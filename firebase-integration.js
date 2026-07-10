/* ============================================================
   Growing Seed — Firebase Integration (PREPARED, NOT ACTIVE)
   ============================================================

   STATUS: This file is not loaded by index.html or admin.html. Nothing
   in this project currently talks to Firebase. Everything still runs on
   localStorage exactly as before. This file exists so that switching to
   a real backend later is a matter of wiring, not designing from scratch.

   WHY IT'S SEPARATE: keeping this out of the live app means nothing here
   can accidentally run, half-configured, against a real project. You
   turn this on deliberately, when you're ready, by following the
   "HOW TO ACTIVATE" section at the bottom of this file.

   ============================================================
   WHAT YOU NEED BEFORE ACTIVATING
   ============================================================
   1. A Firebase project (console.firebase.google.com).
   2. Firestore Database enabled (Native mode, not Datastore mode).
   3. Authentication enabled, with at least Email/Password turned on
      under Authentication → Sign-in method (add Google/Apple/etc. too
      if you want those options — the auth functions below are written
      generically enough to extend).
   4. Your project's web config object, from:
      Project Settings → General → Your apps → (Web app) → SDK setup
      and configuration → Config. Paste it into FIREBASE_CONFIG below.
   5. Firestore Security Rules deployed — see firestore.rules.example
      in this same folder. This step is NOT optional. Everything this
      sandbox currently enforces (Super Admin locks, who can reset
      progress, who can activate events) is enforced only in JavaScript
      running in the player's own browser, which means a technically
      inclined player could open devtools and grant themselves any
      role right now. The moment real accounts and real data are
      involved, that enforcement has to also happen in Firestore
      Security Rules, server-side, where a player can't override it.

   ============================================================
   DATA MODEL THIS FILE ASSUMES (Firestore collections)
   ============================================================
   users/{uid}
     name, email, role ('user'|'moderator'|'leader'|'admin'|'superadmin'),
     roleLocked (bool), faithPoints, totalFpEarned, treeProgress,
     fruitCount, seedType, treeName, avatarId, dateJoined, ...
     (same shape as the localStorage state in script.js — see
     defaultState() there for the full field list)

   teams/{teamId}
     name, leaderUid, memberUids: [uid, ...],
     requests: [{ uid, name }, ...]

   teamFeed/{teamId}/posts/{postId}
     uid, name, action, icon, createdAt,
     reactions: { [uid]: emoji }   // one reaction per uid, matches the
                                    // "1 reaction per person" rule already
                                    // built into the local version

   sharedEvent/current
     active, activatedAt, durationHours, label, description,
     growthMultiplier
     — written only by Super Admins (enforced by security rules), read
     by every client (this is what index.html's getActiveEvent() would
     subscribe to instead of reading a localStorage key)

   ============================================================ */

// ---- 1. Fill this in from Firebase Console → Project Settings ----
// Leave these placeholder strings as-is until you have real values —
// initFirebase() below deliberately refuses to run against placeholders
// so a half-configured copy of this file can't silently fail in a
// confusing way.
const FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// The two permanently-locked Super Admin accounts (mirrors admin.js's
// LOCKED_SUPERADMIN_EMAILS). Keep these two lists in sync if you ever
// change them — this copy is what the security rules example checks
// against, so the client-side lock and the server-side lock agree.
const LOCKED_SUPERADMIN_EMAILS = ['endlesssh0014@gmail.com', 'endlessnogu@gmail.com'];

let _app = null;
let _auth = null;
let _db = null;

function isConfigured() {
  return Object.values(FIREBASE_CONFIG).every(v => typeof v === 'string' && !v.includes('REPLACE_ME'));
}

// ---- 2. Call this once, e.g. at the top of index.html's init, only
// after you've filled in FIREBASE_CONFIG and uncommented the script tag
// (see "HOW TO ACTIVATE" at the bottom) ----
async function initFirebase() {
  if (!isConfigured()) {
    console.error(
      'firebase-integration.js: FIREBASE_CONFIG still has placeholder values. ' +
      'Fill in your real project config before calling initFirebase().'
    );
    return false;
  }

  // Modular SDK via CDN — no build step / bundler needed, matches this
  // project's plain-HTML-and-script-tags style. Pin the version so an
  // unrelated SDK update can't change behavior under you unexpectedly.
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
  const authModule = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
  const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');

  _app = initializeApp(FIREBASE_CONFIG);
  _auth = authModule.getAuth(_app);
  _db = firestoreModule.getFirestore(_app);

  // Stash the modules so the functions below can use them without
  // re-importing on every call.
  initFirebase._authModule = authModule;
  initFirebase._firestoreModule = firestoreModule;
  return true;
}

/* ============================================================
   AUTH
   ============================================================ */

async function registerWithEmail(email, password, displayName) {
  const { createUserWithEmailAndPassword, updateProfile } = initFirebase._authModule;
  const cred = await createUserWithEmailAndPassword(_auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });

  // Create the matching Firestore user doc. Role defaults to 'user' —
  // never trust a role passed in from the client at signup time; the
  // two Super Admin emails are promoted server-side (see the security
  // rules example / a Cloud Function trigger, not from this client call).
  await createUserDocument(cred.user.uid, {
    name: displayName || '',
    email,
    role: 'user',
    roleLocked: false,
    dateJoined: new Date().toISOString().slice(0, 10)
  });

  return cred.user;
}

async function signInWithEmail(email, password) {
  const { signInWithEmailAndPassword } = initFirebase._authModule;
  const cred = await signInWithEmailAndPassword(_auth, email, password);
  return cred.user;
}

async function signOutUser() {
  const { signOut } = initFirebase._authModule;
  await signOut(_auth);
}

// Fires immediately with the current user (or null), then again on every
// sign-in/sign-out. Use this instead of polling.
function onAuthStateChangedListener(callback) {
  const { onAuthStateChanged } = initFirebase._authModule;
  return onAuthStateChanged(_auth, callback);
}

/* ============================================================
   PLAYER DATA (replaces the localStorage state in script.js)
   ============================================================ */

async function createUserDocument(uid, initialData) {
  const { doc, setDoc } = initFirebase._firestoreModule;
  await setDoc(doc(_db, 'users', uid), {
    faithPoints: 20,
    totalFpEarned: 20,
    treeProgress: 0,
    fruitCount: 0,
    seedType: null,
    hasChosenSeedType: false,
    treeName: '',
    treeNameLocked: false,
    avatarId: null,
    ...initialData
  });
}

async function loadPlayerState(uid) {
  const { doc, getDoc } = initFirebase._firestoreModule;
  const snap = await getDoc(doc(_db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

async function savePlayerState(uid, partialState) {
  const { doc, setDoc } = initFirebase._firestoreModule;
  // merge: true means this behaves like Object.assign, not a full
  // overwrite — mirrors how localStorage's saveState() currently works.
  await setDoc(doc(_db, 'users', uid), partialState, { merge: true });
}

// Real-time sync — call once per session. Returns an unsubscribe function.
function subscribeToPlayerState(uid, callback) {
  const { doc, onSnapshot } = initFirebase._firestoreModule;
  return onSnapshot(doc(_db, 'users', uid), snap => {
    if (snap.exists()) callback(snap.data());
  });
}

/* ============================================================
   ADMIN DASHBOARD — role changes, resets, deletes
   ============================================================
   Every one of these MUST also be restricted by Firestore Security
   Rules (see firestore.rules.example) — this client code only decides
   what to *attempt*; the rules decide what's actually *allowed*. */

async function adminUpdateUserRole(targetUid, newRole) {
  const { doc, getDoc, updateDoc } = initFirebase._firestoreModule;
  const targetSnap = await getDoc(doc(_db, 'users', targetUid));
  if (targetSnap.exists() && targetSnap.data().roleLocked) {
    throw new Error('This account\'s role is permanently locked.');
  }
  await updateDoc(doc(_db, 'users', targetUid), { role: newRole });
}

async function adminResetUserProgress(targetUid) {
  const { doc, updateDoc } = initFirebase._firestoreModule;
  await updateDoc(doc(_db, 'users', targetUid), {
    faithPoints: 0,
    treeProgress: 0,
    fruitCount: 0,
    streak: 1
  });
}

async function adminAddPoints(targetUid, amount) {
  const { doc, updateDoc, increment } = initFirebase._firestoreModule;
  await updateDoc(doc(_db, 'users', targetUid), { faithPoints: increment(amount) });
}

async function adminDeleteUser(targetUid) {
  // Soft-delete pattern (matches the sandbox's Deleted Players / Restore
  // flow) — moves the doc to a `deletedUsers` collection instead of
  // actually destroying it, so Restore is possible.
  const { doc, getDoc, setDoc, deleteDoc } = initFirebase._firestoreModule;
  const snap = await getDoc(doc(_db, 'users', targetUid));
  if (!snap.exists()) return;
  await setDoc(doc(_db, 'deletedUsers', targetUid), snap.data());
  await deleteDoc(doc(_db, 'users', targetUid));
}

async function adminRestoreUser(targetUid) {
  const { doc, getDoc, setDoc, deleteDoc } = initFirebase._firestoreModule;
  const snap = await getDoc(doc(_db, 'deletedUsers', targetUid));
  if (!snap.exists()) return;
  await setDoc(doc(_db, 'users', targetUid), snap.data());
  await deleteDoc(doc(_db, 'deletedUsers', targetUid));
}

/* ============================================================
   SEASONAL EVENTS — Super Admin activation
   ============================================================ */

async function setSharedEvent(eventData) {
  // Security rules should check the caller's role === 'superadmin'
  // before allowing a write here — see firestore.rules.example.
  const { doc, setDoc } = initFirebase._firestoreModule;
  await setDoc(doc(_db, 'sharedEvent', 'current'), eventData);
}

function subscribeToSharedEvent(callback) {
  const { doc, onSnapshot } = initFirebase._firestoreModule;
  return onSnapshot(doc(_db, 'sharedEvent', 'current'), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

/* ============================================================
   TEAMS
   ============================================================ */

async function createTeam(teamId, name, leaderUid) {
  const { doc, setDoc } = initFirebase._firestoreModule;
  await setDoc(doc(_db, 'teams', teamId), {
    name,
    leaderUid,
    memberUids: [],
    requests: []
  });
}

async function requestToJoinTeam(teamId, uid, name) {
  const { doc, updateDoc, arrayUnion } = initFirebase._firestoreModule;
  await updateDoc(doc(_db, 'teams', teamId), {
    requests: arrayUnion({ uid, name })
  });
}

async function approveJoinRequest(teamId, request) {
  const { doc, updateDoc, arrayUnion, arrayRemove } = initFirebase._firestoreModule;
  await updateDoc(doc(_db, 'teams', teamId), {
    memberUids: arrayUnion(request.uid),
    requests: arrayRemove(request)
  });
}

async function kickMember(teamId, uid) {
  const { doc, updateDoc, arrayRemove } = initFirebase._firestoreModule;
  await updateDoc(doc(_db, 'teams', teamId), { memberUids: arrayRemove(uid) });
}

/* ============================================================
   HOW TO ACTIVATE (do this later, deliberately — not now)
   ============================================================
   1. Fill in FIREBASE_CONFIG above with your real project values.
   2. Deploy firestore.rules.example (rename it to firestore.rules and
      run `firebase deploy --only firestore:rules`, or paste it into
      Firestore → Rules in the console).
   3. In index.html and admin.html, uncomment the line:
        <script type="module" src="firebase-integration.js"></script>
   4. Replace the localStorage-based loadState()/saveState() calls in
      script.js and admin.js with the loadPlayerState() / savePlayerState()
      / subscribeToPlayerState() functions above.
   5. Add a real sign-in screen (or wire registerWithEmail/signInWithEmail
      into the existing "Choose Your Seed" onboarding flow) since every
      function above needs a real uid to operate on.
   6. Test against a Firebase project's TEST/staging environment first,
      not production — this hasn't been run against a live Firebase
      project from here, only written to match the existing data shapes.
   ============================================================ */
