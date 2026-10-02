const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} = require('@firebase/rules-unit-testing');
const {
  arrayUnion,
  collection,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} = require('firebase/firestore');

const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules.example'), 'utf8');
let testEnv;

async function seedUsers() {
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', 'user-1'), { role: 'user' });
    await setDoc(doc(db, 'users', 'user-2'), { role: 'user' });
    await setDoc(doc(db, 'users', 'moderator-1'), { role: 'moderator' });
    await setDoc(doc(db, 'publicProfiles', 'user-1'), { profileVisibility: 'public', name: 'User One' });
    await setDoc(doc(db, 'publicProfiles', 'user-2'), { profileVisibility: 'private', name: 'User Two' });
    await setDoc(doc(db, 'faithFeedPosts', 'approved-1'), {
      uid: 'user-1',
      visibility: 'public',
      moderationStatus: 'approved',
      text: 'Approved post',
      icon: '📝',
      reactions: { 'user-1': '🔥' },
      comments: [],
      createdAt: new Date()
    });
  });
}

function dbFor(uid) {
  return testEnv.authenticatedContext(uid).firestore();
}

describe('Firestore security rules', function () {
  before(async function () {
    testEnv = await initializeTestEnvironment({
      projectId: 'growing-seed-rules-test',
      firestore: { rules }
    });
  });

  beforeEach(async function () {
    await testEnv.clearFirestore();
    await seedUsers();
  });

  after(async function () {
    await testEnv.cleanup();
  });

  it('limits public profile reads to visible profiles', async function () {
    const db = dbFor('user-2');
    await assertSucceeds(getDoc(doc(db, 'publicProfiles', 'user-1')));
    await assertSucceeds(getDoc(doc(db, 'publicProfiles', 'user-2')));
    await assertFails(getDoc(doc(dbFor('user-1'), 'publicProfiles', 'user-2')));
  });

  it('allows a player to submit a pending post but not approve it', async function () {
    const db = dbFor('user-1');
    const pendingPost = {
      uid: 'user-1',
      visibility: 'public',
      moderationStatus: 'pending',
      text: 'Needs review',
      icon: '📝',
      createdAt: serverTimestamp()
    };
    await assertSucceeds(setDoc(doc(db, 'faithFeedPosts', 'pending-1'), pendingPost));
    await assertFails(updateDoc(doc(db, 'faithFeedPosts', 'pending-1'), { moderationStatus: 'approved' }));
  });

  it('allows moderators to approve a pending post', async function () {
    const db = dbFor('moderator-1');
    await assertSucceeds(updateDoc(doc(db, 'faithFeedPosts', 'approved-1'), {
      moderationStatus: 'hidden',
      moderationNote: 'Reviewed',
      moderatedBy: 'moderator-1',
      moderatedAt: serverTimestamp()
    }));
  });

  it('allows signed-in users to query approved public posts', async function () {
    const db = dbFor('user-2');
    const posts = await assertSucceeds(getDocs(query(
      collection(db, 'faithFeedPosts'),
      where('moderationStatus', '==', 'approved'),
      where('visibility', '==', 'public')
    )));
    assert.equal(posts.size, 1);
  });

  it('allows a player to change only their own reaction', async function () {
    const post = doc(dbFor('user-2'), 'faithFeedPosts', 'approved-1');
    await assertSucceeds(updateDoc(post, { 'reactions.user-2': '🙏' }));
    await assertFails(updateDoc(post, { 'reactions.user-1': '👏' }));
  });

  it('allows comments on approved posts but rejects forged authors', async function () {
    const post = doc(dbFor('user-2'), 'faithFeedPosts', 'approved-1');
    await assertSucceeds(updateDoc(post, {
      comments: arrayUnion({ id: 'comment-1', uid: 'user-2', author: 'User Two', text: 'Amen.' })
    }));
    await assertFails(updateDoc(post, {
      comments: arrayUnion({ id: 'comment-2', uid: 'user-1', author: 'User One', text: 'Forged.' })
    }));
  });

  it('streams another user\'s reactions and comments and persists them', async function () {
    this.timeout(10000);
    const observerDb = dbFor('user-1');
    const otherUserDb = dbFor('user-2');
    const postRef = doc(otherUserDb, 'faithFeedPosts', 'approved-1');
    const feedQuery = query(
      collection(observerDb, 'faithFeedPosts'),
      where('moderationStatus', '==', 'approved'),
      where('visibility', '==', 'public')
    );
    const pendingWaits = new Set();
    let latestPost = null;
    let listenerError = null;

    function waitForPost(predicate) {
      if (listenerError) return Promise.reject(listenerError);
      if (latestPost && predicate(latestPost)) return Promise.resolve(latestPost);
      return new Promise((resolve, reject) => {
        const waiter = {
          predicate,
          resolve(post) {
            clearTimeout(waiter.timeout);
            pendingWaits.delete(waiter);
            resolve(post);
          },
          reject(error) {
            clearTimeout(waiter.timeout);
            pendingWaits.delete(waiter);
            reject(error);
          },
          timeout: setTimeout(() => waiter.reject(new Error('Timed out waiting for a feed snapshot.')), 5000)
        };
        pendingWaits.add(waiter);
      });
    }

    const unsubscribe = onSnapshot(feedQuery, snapshot => {
      const post = snapshot.docs.find(docSnap => docSnap.id === 'approved-1')?.data();
      if (!post) return;
      latestPost = post;
      for (const waiter of pendingWaits) {
        if (waiter.predicate(post)) waiter.resolve(post);
      }
    }, error => {
      listenerError = error;
      for (const waiter of pendingWaits) waiter.reject(error);
    });

    try {
      await waitForPost(post => post.text === 'Approved post');
      await assertSucceeds(updateDoc(postRef, new FieldPath('reactions', 'user-2'), '🙏'));
      const reactedPost = await waitForPost(post => post.reactions?.['user-2'] === '🙏');
      assert.equal(reactedPost.reactions['user-2'], '🙏');

      await assertSucceeds(updateDoc(postRef, {
        comments: arrayUnion({ id: 'live-comment', uid: 'user-2', author: 'User Two', text: 'Amen.' })
      }));
      const commentedPost = await waitForPost(post => post.comments?.some(comment => comment.id === 'live-comment'));
      assert.equal(commentedPost.comments.find(comment => comment.id === 'live-comment').text, 'Amen.');

      const persistedPost = await getDoc(doc(observerDb, 'faithFeedPosts', 'approved-1'));
      assert.equal(persistedPost.data().reactions['user-2'], '🙏');
      assert.equal(persistedPost.data().comments.find(comment => comment.id === 'live-comment').uid, 'user-2');
    } finally {
      unsubscribe();
      for (const waiter of pendingWaits) waiter.reject(new Error('Test listener closed.'));
    }
  });

  it('keeps share history owned by its author', async function () {
    const db = dbFor('user-1');
    await assertSucceeds(setDoc(doc(db, 'shareHistory', 'share-1'), {
      uid: 'user-1',
      sourceType: 'feedPost',
      sourceId: 'approved-1',
      caption: 'My reshare',
      createdAt: serverTimestamp()
    }));
    await assertFails(getDoc(doc(dbFor('user-2'), 'shareHistory', 'share-1')));
    await assertFails(updateDoc(doc(db, 'shareHistory', 'share-1'), { caption: 'Changed' }));
  });
});
