/* ============================================================
   Growing Seed — Gameplay Sandbox
   All tunable numbers live in CONFIG below so mechanics can be
   adjusted without hunting through logic.
   ============================================================ */

const CONFIG = {
  // Thresholds are scaled so a consistent daily player (logging in, doing
  // faith activities, and tending the tree every day) reaches Old Tree
  // around day ~25 of a month and collects a handful of fruit by day 30 —
  // verified by simulation, not guesswork. The original numbers (50/150/
  // 350/600/1000/1500) had a consistent player hitting full bloom by
  // day ~16, with 17 fruit already banked by day 30 — the second half of
  // the month had nothing left to grow toward.
  stages: [
    { key: 'seed',        min: 0,    label: 'Seed' },
    { key: 'germination',  min: 75,   label: 'Germination' },
    { key: 'seedling',    min: 225,  label: 'Seedling' },
    { key: 'sapling',     min: 525,  label: 'Sapling' },
    { key: 'youngTree',   min: 900,  label: 'Young Tree' },
    { key: 'matureTree',  min: 1500, label: 'Mature Tree' },
    { key: 'oldTree',     min: 2250, label: 'Old Tree' }
  ],
  fullBloomThreshold: 2250,
  pointsPerFruit: 100,

  actions: {
    fight:     { label: 'Fight',     icon: '⚔️', cost: 10, successRate: 0.7, reward: 35, failPenalty: 12, accent: '--c-fight', type: 'challenge' },
    // Endure used to hand out a free +15 growth for doing nothing risky,
    // which made it a strictly-better, no-tension choice. Now it's a true
    // passive hold: costs FP, always "succeeds", but grows nothing.
    endure:    { label: 'Endure',    icon: '🛡️', cost: 5,  successRate: 1.0, reward: 0,  failPenalty: 0,  accent: '--c-endure', type: 'challenge' },
    giveup:    { label: 'Give Up',   icon: '🍂', cost: 0,  successRate: 1.0, reward: -60, failPenalty: 0, accent: '--c-giveup', isRegression: true, type: 'challenge' },
    // Tend-your-tree actions now cost the same FP each, since they're a
    // required sequence (Water → Prune → Fertilize) rather than a menu
    // of options to optimize between.
    water:     { label: 'Water',     icon: '💧', cost: 10, successRate: 1.0, reward: 20, failPenalty: 0,  accent: '--c-water', type: 'task', step: 0 },
    prune:     { label: 'Prune',     icon: '✂️', cost: 10, successRate: 1.0, reward: 30, failPenalty: 0,  accent: '--c-protect', type: 'task', step: 1 },
    fertilize: { label: 'Fertilize', icon: '✨', cost: 10, successRate: 1.0, reward: 48, failPenalty: 0,  accent: '--c-fertilize', type: 'task', step: 2 }
  },

  // Chance a Challenge event interrupts after finishing a Daily Task —
  // deliberately not every time, per the requested flow.
  challengeChance: 0.35,

  // Each "challenge" is framed as a real-life struggle, tied back to how a
  // tree would face the same thing, paired with a short KJV verse (public
  // domain, quoted in full) rather than a generic "a storm is coming" line.
  challenges: [
    {
      key: 'anxiety',
      title: '🌪️ Anxious Winds',
      flavor: "The wind howls and your branches shake. Anxiety can rattle you the same way — but a tree with deep roots doesn't have to fear the storm.",
      verseText: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
      verseRef: 'Philippians 4:6 (KJV)'
    },
    {
      key: 'doubt',
      title: '🌫️ A Season of Doubt',
      flavor: "Fog rolls in and you can't see the sky. Even when you can't see growth happening, roots are still working underground.",
      verseText: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.',
      verseRef: 'Isaiah 41:10 (KJV)'
    },
    {
      key: 'loneliness',
      title: '🍂 Standing Alone',
      flavor: 'The field feels empty around you. But even a lone tree is never truly alone — held by the same ground and the same sky as every other.',
      verseText: 'The LORD, he it is that doth go with thee; he will not fail thee, nor forsake thee.',
      verseRef: 'Deuteronomy 31:6 (KJV)'
    },
    {
      key: 'anger',
      title: '🔥 A Scorching Heat',
      flavor: 'The heat presses in and everything feels like it could catch fire. A tree with deep roots can weather a drought season without breaking.',
      verseText: 'Be ye angry, and sin not: let not the sun go down upon your wrath.',
      verseRef: 'Ephesians 4:26 (KJV)'
    },
    {
      key: 'temptation',
      title: '🐛 Pests at the Roots',
      flavor: "Something small is gnawing at your roots, trying to weaken you from below. Every tree faces this — the question is whether it's caught early.",
      verseText: 'God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape.',
      verseRef: '1 Corinthians 10:13 (KJV)'
    },
    {
      key: 'comparison',
      title: '🌳 Overshadowed',
      flavor: 'A bigger tree blocks your light. But every tree grows at its own pace, toward its own shape — comparing rings only slows your own growth.',
      verseText: 'Let every man prove his own work, and then shall he have rejoicing in himself alone, and not in another.',
      verseRef: 'Galatians 6:4 (KJV)'
    },
    {
      key: 'grief',
      title: '🥀 A Broken Branch',
      flavor: 'Something in you feels broken today. Even a wounded tree can heal around the break and keep growing.',
      verseText: 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.',
      verseRef: 'Psalm 34:18 (KJV)'
    },
    {
      key: 'fear',
      title: '⛈️ The Storm Approaches',
      flavor: 'A storm is rolling in fast and every instinct says to brace for the worst. Fear will always come knocking — it doesn\'t have to move in.',
      verseText: 'God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',
      verseRef: '2 Timothy 1:7 (KJV)'
    }
  ],

  // A rotating verse shown on Home, independent of the Challenge events —
  // picked deterministically by date so it's the same verse all day.
  verseOfDayPool: [
    { text: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither.', ref: 'Psalm 1:3 (KJV)' },
    { text: 'For he shall be as a tree planted by the waters, and that spreadeth out her roots by the river, and shall not see when heat cometh, but her leaf shall be green.', ref: 'Jeremiah 17:7-8 (KJV)' },
    { text: 'Even so every good tree bringeth forth good fruit; but a corrupt tree bringeth forth evil fruit.', ref: 'Matthew 7:17 (KJV)' },
    { text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', ref: 'Proverbs 3:5 (KJV)' },
    { text: 'I can do all things through Christ which strengtheneth me.', ref: 'Philippians 4:13 (KJV)' }
  ],

  // Seed types — "Choose Your Seed": five spiritual-fruit themes, each
  // with its own verse and color identity, matching the original design.
  seedTypes: {
    faith: { label: 'Faith', icon: '✝️', pill: '#f16a5e', soft: '#fdeceb', canopyHi: '#ffcfc9', canopyMid: '#f16a5e', canopyLo: '#7a2b23', canopySideLo: '#6b241d', fruitColor: '#f16a5e', verseRef: 'Matthew 17:20', verseText: 'Even small faith moves mountains', challengeKeys: ['doubt', 'temptation', 'fear'] },
    love:  { label: 'Love',  icon: '❤️', pill: '#ef4f8b', soft: '#fdeaf1', canopyHi: '#ffd3e6', canopyMid: '#ef4f8b', canopyLo: '#7d1d43', canopySideLo: '#6e1a3b', fruitColor: '#ef4f8b', verseRef: '1 Corinthians 13:13', verseText: 'Greatest seed of all virtues', challengeKeys: ['loneliness', 'anger', 'comparison'] },
    hope:  { label: 'Hope',  icon: '🌈', pill: '#2bbfa0', soft: '#e6f9f5', canopyHi: '#b9f3e6', canopyMid: '#2bbfa0', canopyLo: '#124a3e', canopySideLo: '#0f3f35', fruitColor: '#2bbfa0', verseRef: 'Romans 5:5', verseText: 'Hope does not disappoint', challengeKeys: ['fear', 'grief', 'doubt'] },
    peace: { label: 'Peace', icon: '☮️', pill: '#7fd8ae', soft: '#eafaf1', canopyHi: '#d8f8e8', canopyMid: '#7fd8ae', canopyLo: '#396f52', canopySideLo: '#316148', fruitColor: '#7fd8ae', verseRef: 'James 3:18', verseText: 'Peace sown yields righteousness', challengeKeys: ['anxiety', 'anger', 'comparison'] },
    joy:   { label: 'Joy',   icon: '😊', pill: '#f6d24e', soft: '#fffaea', canopyHi: '#fff2c2', canopyMid: '#f6d24e', canopyLo: '#7d5f10', canopySideLo: '#6e530e', fruitColor: '#f6d24e', verseRef: 'Galatians 5:22', verseText: 'Joy is fruit of the Spirit', challengeKeys: ['grief', 'comparison', 'loneliness', 'anxiety'] }
  },

  dailyLoginRewards: [5, 5, 10, 10, 15, 15, 30],
  dailyLoginCompletionBonus: 25,

  // ---------------- Badges / achievements ----------------
  // check(state) returns true once earned. Purely a collection layer —
  // none of these affect gameplay balance.
  badges: [
    { id: 'streak7',    icon: '🔥', label: '7-Day Streak',      desc: 'Log in 7 days in a row.',            check: s => s.loginCyclesCompleted >= 1 },
    { id: 'firstFruit', icon: '🍎', label: 'First Fruit',       desc: 'Grow your very first fruit.',        check: s => s.fruitCount >= 1 },
    { id: 'fiveFruit',  icon: '🧺', label: 'Basketful',         desc: 'Collect 5 fruit from one tree.',      check: s => s.fruitCount >= 5 },
    { id: 'oldTree',    icon: '🌳', label: 'Full Bloom',        desc: 'Reach Old Tree stage.',               check: s => s.previousStage === 'oldTree' },
    { id: 'allSeeds',   icon: '🌈', label: 'Every Seed',        desc: 'Try all five seed types.',            check: s => new Set(s.seedTypesTried).size >= 5 },
    { id: 'survivor10', icon: '🛡️', label: 'Steadfast',         desc: 'Face down 10 challenges.',            check: s => s.challengesSurvived >= 10 },
    { id: 'gospel5',    icon: '📢', label: 'Voice of Faith',    desc: 'Share the Gospel 5 times.',           check: s => s.gospelShareCount >= 5 }
  ],

  // ---------------- Seasonal / limited-time events ----------------
  // Each event has a start/end date (YYYY-MM-DD) and a small bonus multiplier
  // applied to tend-cycle growth while it's active. Add more entries to
  // schedule future events — nothing else in the code needs to change.
  events: [
    {
      id: 'growth-sprint-2026-07',
      label: '🌟 Growth Sprint Week',
      description: 'Limited time: +25% growth from every Water, Prune, and Fertilize.',
      start: '2026-07-01',
      end: '2026-07-14',
      growthMultiplier: 1.25
    }
  ],

  // ---------------- Mock team (sandbox demo data) ----------------
  // Standalone sample so "My Team" has something to show without a real
  // backend — same spirit as the Admin Dashboard's mock players.
  teamRoster: [
    { name: 'Grace M.',  stage: 'Sapling',    streak: 5 },
    { name: 'Daniel T.', stage: 'Young Tree', streak: 3 },
    { name: 'Hannah R.', stage: 'Seedling',   streak: 7 },
    { name: 'Samuel B.', stage: 'Mature Tree',streak: 12 }
  ],
  teamFeedSeed: [
    { name: 'Grace M.',  action: 'prayed today',            icon: '🙏' },
    { name: 'Daniel T.', action: 'reached Young Tree!',      icon: '🌳' },
    { name: 'Hannah R.', action: 'shared the Gospel',        icon: '📢' },
    { name: 'Samuel B.', action: 'grew a fruit!',            icon: '🍎' },
    { name: 'Grace M.',  action: 'kept a 5-day streak',      icon: '🔥' }
  ]
};

const STORAGE_KEY = 'growingSeedSandboxState_v1';

/* ---------------- Sound + haptic feedback ----------------
   Plain Web Audio API tones — no audio files/assets needed, and it works
   fully offline. Respects state.soundEnabled (toggle lives in Profile). */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

function playTone(freqs, durationMs = 150, type = 'sine', volume = 0.14) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + durationMs / 1000 + 0.02);
    });
  } catch (e) { /* audio unavailable — fail silently, never block gameplay */ }
}

function vibrate(pattern) {
  if (!state.soundEnabled) return; // one toggle controls both, per simplicity
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }
}

const SFX = {
  tap:            () => playTone([440], 70, 'sine', 0.05),
  fpGain:         () => playTone([660], 110, 'sine', 0.07),
  growthSuccess:  () => playTone([523.25, 659.25], 170, 'sine', 0.09),
  stageUp:        () => { playTone([523.25, 659.25, 783.99], 260, 'triangle', 0.13); vibrate([40, 30, 60]); },
  fruit:          () => { playTone([659.25, 783.99, 987.77], 300, 'triangle', 0.13); vibrate([30, 20, 30, 20, 80]); },
  fail:           () => playTone([220, 196], 220, 'sawtooth', 0.07),
  badge:          () => { playTone([523.25, 659.25, 783.99, 1046.5], 350, 'triangle', 0.12); vibrate([50, 40, 50, 40, 100]); }
};

/* ---------------- State ---------------- */
let state = loadState();

function defaultState() {
  return {
    faithPoints: 20,
    treeProgress: 0,
    maxBloomReached: false,
    fruitCount: 0,
    pointsForFruit: 0,
    hasCelebratedFirstFruit: false,
    previousStage: 'seed',
    seedType: 'faith',
    hasChosenSeedType: false,
    tendStep: 0, // 0 = Water, 1 = Prune, 2 = Fertilize — must be done in order
    faithCompletions: {},   // key: `${faith}:${periodKey}` -> true
    dailyLogin: { claimedDays: [], streakDay: 1, lastClaimDate: '' },

    // --- New: personalization, sound, badges, tracking ---
    treeName: '',
    treeNameLocked: false,   // locks after first set; unlocks again only on tree reset
    profileName: '',
    profileNameEditsUsed: 0, // 0 = never set; after first set, exactly 1 more edit allowed, then locked
    profileEmail: '',
    dateJoined: getDateKey(), // captured once, the first time this browser ever loads the sandbox
    soundEnabled: true,
    unlockedBadgeIcon: null, // which badge icon is shown next to the tree name
    badges: {},              // key: badgeId -> true once unlocked
    seedTypesTried: [],      // for the "Tried every seed type" badge
    challengesSurvived: 0,   // Fight/Endure resolved (not Give Up)
    gospelShareCount: 0,
    loginCyclesCompleted: 0, // incremented each time a 7-day login cycle finishes
    teamFeedReactions: {}    // key: feed item index -> { emoji: count }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Period keys (for daily/weekly faith activities) ---------------- */
function getDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function getWeekKey(d = new Date()) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}
function periodKeyFor(unit) {
  return unit === 'week' ? getWeekKey() : getDateKey();
}

/* ---------------- Unified growth function ----------------
   Every source of tree growth (Daily Tasks, Challenge Actions,
   Upgrade Roots, test tools) MUST go through this function so
   fruit generation is never bypassed. This directly fixes the
   original bug where handleActionButton() mutated treeProgress
   directly and silently skipped fruit logic. */
function applyGrowth(pointsToAdd) {
  const previous = state.treeProgress;
  state.treeProgress = Math.max(0, state.treeProgress + pointsToAdd);

  let fruitEligible = 0;
  if (state.maxBloomReached) {
    fruitEligible = Math.max(0, pointsToAdd);
  } else if (previous < CONFIG.fullBloomThreshold && state.treeProgress >= CONFIG.fullBloomThreshold) {
    state.maxBloomReached = true;
    fruitEligible = state.treeProgress - CONFIG.fullBloomThreshold;
  }

  if (fruitEligible > 0) {
    state.pointsForFruit += fruitEligible;
    while (state.pointsForFruit >= CONFIG.pointsPerFruit) {
      state.pointsForFruit -= CONFIG.pointsPerFruit;
      state.fruitCount++;
      onFruitGained();
    }
  }
}

function getCurrentStage() {
  let current = CONFIG.stages[0];
  for (const s of CONFIG.stages) {
    if (state.treeProgress >= s.min) current = s;
  }
  return current;
}

function getNextStageThreshold() {
  const stages = CONFIG.stages;
  const idx = stages.findIndex(s => s.key === getCurrentStage().key);
  return stages[idx + 1] || null;
}

/* ---------------- DOM refs ---------------- */
const el = (id) => document.getElementById(id);
const fpValueEl = el('fpValue');
const streakValueEl = el('streakValue');
const fruitValueEl = el('fruitValue');
const stageNameEl = el('stageName');
const progressFillEl = el('progressFill');
const progressTextEl = el('progressText');
const progressTrackEl = el('progressTrack');
const treeStageWrap = el('treeStageWrap');
const bgLayerA = el('bgLayerA');
const bgLayerB = el('bgLayerB');
const stageBurstEl = el('stageBurst');
const particleLayer = el('particleLayer');

const STAGE_BACKGROUNDS = {
  seed:        'radial-gradient(circle at 50% 78%, rgba(151,110,70,0.3) 0 24%, transparent 38%), linear-gradient(to top, #8c6a4f 0%, #b08765 36%, #d8ecf8 100%)',
  germination: 'radial-gradient(circle at 50% 76%, rgba(95,151,84,0.36) 0 22%, transparent 40%), linear-gradient(to top, #73563f 0%, #8d6a4b 34%, #9dc5e0 100%)',
  seedling:    'radial-gradient(circle at 80% 18%, rgba(255,220,132,0.45) 0 10%, transparent 28%), linear-gradient(to top, #6f5a43 0%, #8c744e 32%, #b8ddf0 100%)',
  sapling:     'radial-gradient(circle at 16% 28%, rgba(255,255,255,0.32) 0 11%, transparent 30%), linear-gradient(to top, #87c07a 0%, #a8d594 28%, #d3eef8 100%)',
  youngTree:   'radial-gradient(circle at 22% 22%, rgba(255,255,255,0.36) 0 10%, transparent 26%), linear-gradient(to top, #8acb7a 0%, #b7e0a2 26%, #dff3ff 100%)',
  matureTree:  'radial-gradient(circle at 82% 14%, rgba(255,223,120,0.56) 0 11%, transparent 30%), linear-gradient(to top, #7ab668 0%, #a6d08d 24%, #d9f0ff 100%)',
  oldTree:     'radial-gradient(circle at 22% 14%, rgba(255,177,122,0.4) 0 10%, transparent 28%), linear-gradient(to top, #617f56 0%, #89a07a 26%, #f2d2b3 58%, #b7cde5 100%)'
};

let frontLayerIsA = true;
let skipNextLevelUpCelebration = false;

/* Two-layer opacity crossfade — background-image cannot be transitioned
   directly in CSS, so the "next" gradient is painted into the hidden
   layer first, then its opacity is faded in while the old layer fades out. */
function setStageBackground(stageKey, animate) {
  const incoming = frontLayerIsA ? bgLayerB : bgLayerA;
  const outgoing = frontLayerIsA ? bgLayerA : bgLayerB;
  incoming.style.backgroundImage = STAGE_BACKGROUNDS[stageKey];

  if (!animate) {
    outgoing.style.backgroundImage = STAGE_BACKGROUNDS[stageKey];
    incoming.classList.remove('is-front');
    outgoing.classList.add('is-front');
    frontLayerIsA = !frontLayerIsA;
    return;
  }

  requestAnimationFrame(() => {
    incoming.classList.add('is-front');
    outgoing.classList.remove('is-front');
    frontLayerIsA = !frontLayerIsA;
  });
}

/* ---------------- Render ---------------- */
function render(options = {}) {
  const { persist = true } = options;

  fpValueEl.textContent = Math.floor(state.faithPoints);
  fruitValueEl.textContent = state.fruitCount;

  const completedDays = state.dailyLogin.claimedDays.length;
  streakValueEl.textContent = completedDays > 0 ? completedDays : 1;

  renderStage();
  renderFruits();
  renderLoginGrids();
  renderFaithButtons();
  renderActionAvailability();
  renderEventBanner();
  renderTreeNameDisplay();
  checkBadges();

  if (persist) saveState();
}

function renderStage() {
  const stage = getCurrentStage();
  const stageChanged = stage.key !== state.previousStage;

  stageNameEl.textContent = stage.label;

  // Progress bar toward next stage (or "max bloom" once at Old Tree)
  const next = getNextStageThreshold();
  if (next) {
    const span = next.min - stage.min;
    const into = state.treeProgress - stage.min;
    progressFillEl.style.width = `${Math.min(100, Math.max(0, (into / span) * 100))}%`;
    progressTextEl.textContent = `${Math.floor(into)} / ${span} to ${next.label}`;
  } else {
    progressFillEl.style.width = '100%';
    progressTextEl.textContent = `Old Tree · ${state.pointsForFruit}/${CONFIG.pointsPerFruit} to next fruit`;
  }

  // Only touch the SVG swap + background crossfade + burst when the
  // stage actually changed — fixes the original flicker where every
  // single action re-triggered the fade even without a real transition.
  if (stageChanged) {
    document.querySelectorAll('.tree-stage-img').forEach(elImg => elImg.classList.remove('active'));
    const target = document.querySelector(`.tree-stage-img[data-stage="${stage.key}"]`);
    if (target) requestAnimationFrame(() => target.classList.add('active'));

    setStageBackground(stage.key, true);
    if (skipNextLevelUpCelebration) {
      skipNextLevelUpCelebration = false;
    } else {
      playStageLevelUp();
    }

    state.previousStage = stage.key;
  } else if (!document.querySelector(`.tree-stage-img[data-stage="${stage.key}"]`).classList.contains('active')) {
    // First render on load — set instantly, no animation
    document.querySelectorAll('.tree-stage-img').forEach(elImg => elImg.classList.remove('active'));
    const target = document.querySelector(`.tree-stage-img[data-stage="${stage.key}"]`);
    if (target) target.classList.add('active');
    setStageBackground(stage.key, false);
  }
}

function playStageLevelUp() {
  treeStageWrap.classList.remove('leveling-up');
  void treeStageWrap.offsetWidth;
  treeStageWrap.classList.add('leveling-up');

  stageBurstEl.classList.remove('playing');
  void stageBurstEl.offsetWidth;
  stageBurstEl.classList.add('playing');

  spawnParticles('p-sparkle', 8);
  SFX.stageUp();
  showToast(`🌟 Your tree grew into the ${getCurrentStage().label} stage!`, 'success');
}

function renderFruits() {
  const fruitCircles = document.querySelectorAll('#oldTreeFruits circle');
  const visible = Math.min(state.fruitCount, fruitCircles.length);
  fruitCircles.forEach((c, i) => {
    c.setAttribute('opacity', i < visible ? '1' : '0');
  });
}

function onFruitGained() {
  SFX.fruit();
  if (!state.hasCelebratedFirstFruit) {
    state.hasCelebratedFirstFruit = true;
    // Defer to after render so the fruit circle is already visible.
    setTimeout(() => celebrateFirstFruit(), 250);
  } else {
    setTimeout(() => bounceFruitGroup(), 50);
  }
}

function bounceFruitGroup() {
  const group = el('oldTreeFruits');
  if (!group) return;
  group.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
    { duration: 500, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
  );
}

/* ---------------- Particle system (plain CSS/DOM + Web Animations API) ---------------- */
function spawnParticles(className, count) {
  const rect = particleLayer.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = `particle ${className}`;
    const startX = 20 + Math.random() * (rect.width - 40);
    const startY = className === 'p-water' ? -10 : rect.height * 0.35 + Math.random() * rect.height * 0.3;
    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;
    particleLayer.appendChild(p);

    const drift = (Math.random() - 0.5) * 40;
    const fall = className === 'p-water' ? rect.height * 0.6 : -40 - Math.random() * 30;

    const anim = p.animate(
      [
        { transform: 'translate(0,0) scale(0.6)', opacity: 0 },
        { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.15 },
        { transform: `translate(${drift}px, ${fall}px) scale(0.9)`, opacity: 0 }
      ],
      { duration: 700 + Math.random() * 400, easing: 'ease-out', delay: i * 40 }
    );
    anim.onfinish = () => p.remove();
  }
}

function spawnShieldPulse() {
  const p = document.createElement('div');
  p.className = 'particle p-shield';
  particleLayer.appendChild(p);
  const anim = p.animate(
    [
      { transform: 'scale(0.7)', opacity: 0.9 },
      { transform: 'scale(1.25)', opacity: 0 }
    ],
    { duration: 550, easing: 'ease-out' }
  );
  anim.onfinish = () => p.remove();
}

function spawnPrune() {
  // A quick "snip" — a fast double-pulse on the tree plus a couple of
  // small clippings falling, distinct from the shield/water/spark effects.
  treeStageWrap.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.97)' },
      { transform: 'scale(1)' },
      { transform: 'scale(0.985)' },
      { transform: 'scale(1)' }
    ],
    { duration: 380, easing: 'ease-in-out' }
  );
  spawnParticles('p-leaf', 3);
}

function spawnImpactFlash(success) {
  const p = document.createElement('div');
  p.className = 'particle p-impact';
  p.style.background = success ? 'rgba(255,255,255,0.55)' : 'rgba(198,62,56,0.35)';
  particleLayer.appendChild(p);
  const anim = p.animate(
    [{ opacity: 0.9 }, { opacity: 0 }],
    { duration: 380, easing: 'ease-out' }
  );
  anim.onfinish = () => p.remove();

  treeStageWrap.animate(
    success
      ? [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }]
      : [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
    { duration: 320, easing: 'ease-out' }
  );
}

function spawnDroop() {
  treeStageWrap.animate(
    [
      { transform: 'rotate(0deg) scale(1)', filter: 'saturate(1)' },
      { transform: 'rotate(-3deg) scale(0.97)', filter: 'saturate(0.6)' },
      { transform: 'rotate(0deg) scale(1)', filter: 'saturate(1)' }
    ],
    { duration: 900, easing: 'ease-in-out' }
  );
  spawnParticles('p-leaf', 4);
}

/* ---------------- Result popup ---------------- */
function showResultPopup({ icon, title, detail, accentVar, actionType }) {
  el('resultIcon').textContent = icon;
  el('resultTitle').textContent = title;
  el('resultDetail').textContent = detail;
  el('resultCard').style.setProperty('--result-accent', `var(${accentVar})`);
  el('resultOverlay').dataset.actionType = actionType;
  el('resultOverlay').classList.add('visible');
}
el('resultCloseBtn').addEventListener('click', () => {
  const actionType = el('resultOverlay').dataset.actionType;
  el('resultOverlay').classList.remove('visible');

  if (actionType === 'challenge') {
    // Event resolved — return to the main screen.
    el('challengeModal').hidden = true;
    return;
  }

  if (actionType === 'task') {
    // Randomly, not every time, a challenge interrupts the daily task flow.
    if (Math.random() < CONFIG.challengeChance) {
      setTimeout(() => openChallenge(), 350);
    }
  }
});

/* ---------------- Tabs / bottom nav ---------------- */
document.querySelectorAll('.bottom-nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.hidden = panel.dataset.tab !== tab;
  });
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  if (tab === 'ranking') renderRanking();
  if (tab === 'profile') renderBadges();
}

/* ---------------- Toasts ---------------- */
function showToast(message, type = 'info') {
  const stack = el('toastStack');

  // Cap simultaneous toasts so rapid actions can't pile up and block the UI.
  while (stack.children.length >= 2) {
    stack.removeChild(stack.firstElementChild);
  }

  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  stack.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 250);
  }, 2200);
}

/* ---------------- Tree tap → Daily Tasks modal ---------------- */
treeStageWrap.addEventListener('click', () => openDailyTasks());
treeStageWrap.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDailyTasks(); }
});

function openDailyTasks() {
  if (!state.hasChosenSeedType) {
    seedChoiceContext = 'onboarding';
    el('seedChoiceModal').hidden = false;
    return;
  }
  el('dailyTasksModal').hidden = false;
}
el('closeDailyTasksBtn').addEventListener('click', () => { el('dailyTasksModal').hidden = true; });

function openChallenge() {
  el('dailyTasksModal').hidden = true;

  const seedType = CONFIG.seedTypes[state.seedType] || CONFIG.seedTypes.faith;
  const themed = CONFIG.challenges.filter(c => seedType.challengeKeys.includes(c.key));
  const pool = themed.length ? themed : CONFIG.challenges;
  const challenge = pool[Math.floor(Math.random() * pool.length)];

  el('challengeTitle').textContent = challenge.title;
  el('challengeFlavorText').textContent = challenge.flavor;
  el('challengeVerseText').textContent = challenge.verseText;
  el('challengeVerseRef').textContent = challenge.verseRef;
  el('challengeModal').hidden = false;
}

/* ---------------- Challenge / Daily Task actions ---------------- */
function runAction(key) {
  const cfg = CONFIG.actions[key];
  const button = document.querySelector(`.action-btn[data-action="${key}"]`);

  if (cfg.type === 'task' && cfg.step !== state.tendStep) {
    const nextKey = Object.keys(CONFIG.actions).find(k => CONFIG.actions[k].step === state.tendStep);
    showToast(`Do ${CONFIG.actions[nextKey].label} first.`, 'warning');
    return;
  }

  if (state.faithPoints < cfg.cost) {
    showToast('Not enough Faith Points for that yet.', 'warning');
    return;
  }

  SFX.tap();
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 200);

  state.faithPoints = Math.max(0, state.faithPoints - cfg.cost);

  const isGiveUp = !!cfg.isRegression;
  const isSuccess = isGiveUp ? false : Math.random() < cfg.successRate;
  let delta = isGiveUp ? cfg.reward : (isSuccess ? cfg.reward : -cfg.failPenalty);

  // Apply any active seasonal event's growth multiplier to positive
  // tend-cycle growth only (never boosts a challenge fail/regression).
  const activeEvent = getActiveEvent();
  if (activeEvent && cfg.type === 'task' && delta > 0) {
    delta = Math.round(delta * activeEvent.growthMultiplier);
  }

  applyGrowth(delta); // <-- unified path, fruit logic always runs

  // Per-action animation
  if (key === 'water') spawnParticles('p-water', 6);
  else if (key === 'fertilize') spawnParticles('p-sparkle', 7);
  else if (key === 'prune') spawnPrune();
  else if (key === 'fight') spawnImpactFlash(isSuccess);
  else if (key === 'endure') spawnShieldPulse();
  else if (key === 'giveup') spawnDroop();

  if (cfg.type === 'task') {
    state.tendStep = (state.tendStep + 1) % 3;
  }
  if (cfg.type === 'challenge' && !isGiveUp) {
    state.challengesSurvived++;
  }

  SFX[isGiveUp || !isSuccess ? 'fail' : 'growthSuccess']();

  progressTrackEl.classList.remove('growth-success', 'growth-fail');
  void progressTrackEl.offsetWidth;
  progressTrackEl.classList.add(isGiveUp || !isSuccess ? 'growth-fail' : 'growth-success');

  const detailText = isGiveUp
    ? `Progress regressed ${Math.abs(cfg.reward)} points.`
    : isSuccess
      ? (delta > 0 ? `+${delta} growth points.${activeEvent && cfg.type === 'task' ? ' (event bonus applied)' : ''}` : 'You held steady — no growth gained or lost.')
      : `Failed — -${cfg.failPenalty} growth points.`;

  showResultPopup({
    icon: cfg.icon,
    title: cfg.label,
    detail: detailText,
    accentVar: cfg.accent,
    actionType: cfg.type
  });

  render();
}

['fight', 'endure', 'giveup', 'water', 'prune', 'fertilize'].forEach(key => {
  const btn = document.querySelector(`.action-btn[data-action="${key}"]`);
  btn.addEventListener('click', () => runAction(key));
});

function renderActionAvailability() {
  Object.entries(CONFIG.actions).forEach(([key, cfg]) => {
    const btn = document.querySelector(`.action-btn[data-action="${key}"]`);
    if (!btn) return;
    const wrongStep = cfg.type === 'task' && cfg.step !== state.tendStep;
    btn.disabled = state.faithPoints < cfg.cost || wrongStep;
  });

  const nextKey = Object.keys(CONFIG.actions).find(k => CONFIG.actions[k].step === state.tendStep);
  const hint = el('tendStepHint');
  if (hint && nextKey) {
    hint.textContent = `Next step: ${CONFIG.actions[nextKey].label} ${CONFIG.actions[nextKey].icon}`;
  }
}

/* ---------------- Faith activities (now require a photo upload) ---------------- */
function renderFaithButtons() {
  const isSunday = new Date().getDay() === 0;

  document.querySelectorAll('.faith-btn').forEach(btn => {
    const faith = btn.dataset.faith;
    const unit = btn.dataset.period;
    const key = `${faith}:${periodKeyFor(unit)}`;
    const done = !!state.faithCompletions[key];
    const sundayLocked = btn.dataset.sundayOnly === 'true' && !isSunday;
    btn.disabled = done || sundayLocked;
    btn.style.opacity = (done || sundayLocked) ? '0.55' : '1';
  });

  const worshipNote = el('worshipNote');
  if (worshipNote) {
    worshipNote.textContent = isSunday
      ? "It's Sunday — Worship Attendance is available today."
      : 'Worship Attendance can only be logged on Sundays.';
  }

  // Share the Gospel unlocks once the tree reaches Young Tree or beyond.
  const stageOrder = CONFIG.stages.map(s => s.key);
  const currentIndex = stageOrder.indexOf(getCurrentStage().key);
  const youngTreeIndex = stageOrder.indexOf('youngTree');
  el('gospelCard').hidden = currentIndex < youngTreeIndex;
}

let pendingFaithBtn = null;
let pendingPhotoDataUrl = null;

document.querySelectorAll('.faith-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const faith = btn.dataset.faith;
    const unit = btn.dataset.period;
    const key = `${faith}:${periodKeyFor(unit)}`;

    if (btn.dataset.sundayOnly === 'true' && new Date().getDay() !== 0) {
      showToast('Worship Attendance can only be logged on Sundays.', 'warning');
      return;
    }

    if (state.faithCompletions[key]) {
      showToast('Already completed for this period.', 'warning');
      return;
    }

    pendingFaithBtn = btn;
    pendingPhotoDataUrl = null;
    el('photoUploadTitle').textContent = `Upload Proof — ${btn.textContent.trim().split('+')[0].trim()}`;
    el('photoPreview').innerHTML = '<span id="photoPreviewPlaceholder">No photo selected yet</span>';
    el('confirmPhotoUploadBtn').disabled = true;
    el('photoUploadModal').hidden = false;
  });
});

el('choosePhotoBtn').addEventListener('click', () => el('photoFileInput').click());

el('photoFileInput').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setPendingPhoto(reader.result);
  reader.readAsDataURL(file);
});

el('useSamplePhotoBtn').addEventListener('click', () => {
  // Draws a small placeholder image so the upload flow can be tested
  // without needing a real camera/file on the test device.
  const canvas = document.createElement('canvas');
  canvas.width = 240; canvas.height = 180;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 240, 180);
  grad.addColorStop(0, '#bdf7a0');
  grad.addColorStop(1, '#3a9e4f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 240, 180);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '16px sans-serif';
  ctx.fillText('Sample Photo', 60, 95);
  setPendingPhoto(canvas.toDataURL());
});

function setPendingPhoto(dataUrl) {
  pendingPhotoDataUrl = dataUrl;
  el('photoPreview').innerHTML = `<img src="${dataUrl}" alt="Uploaded proof preview" />`;
  el('confirmPhotoUploadBtn').disabled = false;
}

el('cancelPhotoUploadBtn').addEventListener('click', () => {
  el('photoUploadModal').hidden = true;
  pendingFaithBtn = null;
  pendingPhotoDataUrl = null;
});

el('confirmPhotoUploadBtn').addEventListener('click', () => {
  if (!pendingFaithBtn || !pendingPhotoDataUrl) return;
  const btn = pendingFaithBtn;
  const faith = btn.dataset.faith;
  const unit = btn.dataset.period;
  const fp = Number(btn.dataset.fp);
  const growth = Number(btn.dataset.growth || 0);
  const key = `${faith}:${periodKeyFor(unit)}`;

  state.faithCompletions[key] = true;
  state.faithPoints += fp;
  if (growth > 0) applyGrowth(growth);
  if (faith === 'gospel') state.gospelShareCount++;

  el('photoUploadModal').hidden = true;
  pendingFaithBtn = null;
  pendingPhotoDataUrl = null;

  SFX.fpGain();
  showToast(
    growth > 0
      ? `+${fp} FP and +${growth} growth — thank you for sharing your faith today.`
      : `+${fp} FP earned. Thank you for showing up today.`,
    'success'
  );
  render();
});

/* ---------------- Daily login ---------------- */
function renderLoginGrids() {
  [el('loginGrid'), el('loginGridModal')].forEach(grid => {
    if (!grid) return;
    grid.innerHTML = '';
    for (let day = 1; day <= 7; day++) {
      const d = document.createElement('div');
      d.className = 'login-day';
      const claimed = state.dailyLogin.claimedDays.includes(day);
      const claimable = !claimed && day === state.dailyLogin.streakDay && !hasClaimedToday();
      if (claimed) d.classList.add('claimed');
      if (claimable) d.classList.add('claimable');
      d.textContent = claimed ? '✓' : `D${day}`;
      grid.appendChild(d);
    }
  });
}

function hasClaimedToday() {
  return state.dailyLogin.lastClaimDate === getDateKey();
}

el('dailyLoginOpenBtn').addEventListener('click', () => el('dailyLoginModal').hidden = false);
el('closeDailyLoginBtn').addEventListener('click', () => el('dailyLoginModal').hidden = true);

el('claimTodayBtn').addEventListener('click', () => {
  if (hasClaimedToday()) {
    showToast('Already claimed today — come back tomorrow.', 'warning');
    return;
  }
  const day = state.dailyLogin.streakDay;
  const reward = CONFIG.dailyLoginRewards[day - 1] || 0;
  const isFinalDay = day >= CONFIG.dailyLoginRewards.length;

  state.faithPoints += reward + (isFinalDay ? CONFIG.dailyLoginCompletionBonus : 0);
  state.dailyLogin.claimedDays.push(day);
  state.dailyLogin.lastClaimDate = getDateKey();
  state.dailyLogin.streakDay = isFinalDay ? 1 : day + 1;
  if (isFinalDay) {
    state.dailyLogin.claimedDays = [];
    state.loginCyclesCompleted++;
  }

  showToast(
    isFinalDay
      ? `Day ${day} claimed (+${reward} FP) plus a +${CONFIG.dailyLoginCompletionBonus} FP streak bonus!`
      : `Day ${day} claimed (+${reward} FP).`,
    'success'
  );
  render();
});

/* ---------------- Verse of the Day ---------------- */
function renderVerseOfDay() {
  const pool = CONFIG.verseOfDayPool;
  // Deterministic by date, so it's the same verse all day and changes daily.
  const dayNumber = Math.floor(Date.now() / 86400000);
  const verse = pool[dayNumber % pool.length];
  el('verseText').textContent = `"${verse.text}"`;
  el('verseRef').textContent = verse.ref;
}

/* ---------------- Choose Your Seed (Faith/Love/Hope/Peace/Joy) ---------------- */
function applySeedTypePalette() {
  const type = CONFIG.seedTypes[state.seedType] || CONFIG.seedTypes.faith;
  treeStageWrap.style.setProperty('--canopy-hi', type.canopyHi);
  treeStageWrap.style.setProperty('--canopy-mid', type.canopyMid);
  treeStageWrap.style.setProperty('--canopy-lo', type.canopyLo);
  treeStageWrap.style.setProperty('--canopy-side-lo', type.canopySideLo);
  treeStageWrap.style.setProperty('--fruit-color', type.fruitColor);
}

function renderSeedTypeGrid() {
  const cardsHtml = Object.entries(CONFIG.seedTypes).map(([key, t]) => `
    <button class="seed-type-card ${state.seedType === key ? 'selected' : ''}" data-seed-type="${key}"
            style="--seed-pill:${t.pill}; --seed-soft:${t.soft};">
      <span class="seed-pill">${t.icon} ${t.label}</span>
      <span class="seed-verse-ref">${t.verseRef}</span>
      <span class="seed-verse-text">${t.verseText}</span>
    </button>
  `).join('');

  [el('treeTypeGrid'), el('seedChoiceGrid')].forEach(grid => {
    if (!grid) return;
    grid.innerHTML = cardsHtml;
    grid.querySelectorAll('.seed-type-card').forEach(card => {
      card.addEventListener('click', () => selectSeedType(card.dataset.seedType));
    });
  });
}

let seedChoiceContext = 'onboarding'; // 'onboarding' | 'reset' | 'profile'

function selectSeedType(key) {
  state.seedType = key;
  if (!state.seedTypesTried.includes(key)) state.seedTypesTried.push(key);
  applySeedTypePalette();
  renderSeedTypeGrid();
  saveState();

  const isOnboardingModalOpen = el('seedChoiceModal').hidden === false;

  if (isOnboardingModalOpen && seedChoiceContext === 'onboarding') {
    state.hasChosenSeedType = true;
    el('seedChoiceModal').hidden = true;
    saveState();
    showToast(`Your seed is planted in ${CONFIG.seedTypes[key].label}. Let's grow!`, 'success');
    // Now that onboarding is done, surface the daily reward if it hasn't
    // been claimed yet — same as a normal return visit would.
    if (!hasClaimedToday()) {
      setTimeout(() => { el('dailyLoginModal').hidden = false; }, 400);
    }
  } else if (isOnboardingModalOpen && seedChoiceContext === 'reset') {
    el('seedChoiceModal').hidden = true;
    showToast(`Your tree is growing fresh as ${CONFIG.seedTypes[key].label} now.`, 'success');
  } else {
    showToast(`Your seed is now planted in ${CONFIG.seedTypes[key].label}.`, 'success');
  }
}

/* ---------------- Ranking (sample local leaderboard) ---------------- */
const MOCK_RANKING_NAMES = ['Grace M.', 'Daniel T.', 'Hannah R.', 'Samuel B.', 'Naomi C.'];
const MOCK_TEAM_BATTLE = [
  { team: 'Rooted',        fruit: 34 },
  { team: 'Branching Out', fruit: 41 },
  { team: 'Fruitbearers',  fruit: 27 }
];

let rankingView = 'individual'; // 'individual' | 'team'

el('rankingIndividualBtn').addEventListener('click', () => {
  rankingView = 'individual';
  renderRanking();
});
el('rankingTeamBtn').addEventListener('click', () => {
  rankingView = 'team';
  renderRanking();
});

function renderRanking() {
  el('rankingIndividualBtn').classList.toggle('active', rankingView === 'individual');
  el('rankingTeamBtn').classList.toggle('active', rankingView === 'team');
  el('individualRankingPanel').hidden = rankingView !== 'individual';
  el('teamRankingPanel').hidden = rankingView !== 'team';

  if (rankingView === 'individual') {
    renderIndividualRanking();
  } else {
    renderTeamRoster();
    renderTeamFeed();
    renderTeamBattle();
  }
}

function renderIndividualRanking() {
  const mockScores = MOCK_RANKING_NAMES.map(name => ({
    name,
    fp: Math.floor(Math.random() * 600) + 50
  }));
  mockScores.push({ name: 'You', fp: Math.floor(state.faithPoints), isYou: true });
  mockScores.sort((a, b) => b.fp - a.fp);

  el('rankingList').innerHTML = mockScores.map((row, i) => `
    <div class="ranking-row ${row.isYou ? 'is-you' : ''}">
      <span class="ranking-rank">#${i + 1}</span>
      <span class="ranking-name">${row.name}</span>
      <span class="ranking-fp">${row.fp} FP</span>
    </div>
  `).join('');
}

function renderTeamRoster() {
  el('teamRosterList').innerHTML = CONFIG.teamRoster.map(m => `
    <div class="team-member-row">
      <span class="team-member-name">${m.name}</span>
      <span class="team-member-meta">${m.stage} · 🔥${m.streak}</span>
    </div>
  `).join('');
}

function renderTeamFeed() {
  el('teamFeedList').innerHTML = CONFIG.teamFeedSeed.map((item, i) => {
    const reactions = state.teamFeedReactions[i] || {};
    return `
      <div class="team-feed-item">
        <div class="team-feed-text">${item.icon} <strong>${item.name}</strong> ${item.action}</div>
        <div class="team-feed-reactions">
          ${['🔥', '🙏', '👏'].map(emoji => `
            <button class="reaction-btn" data-feed-index="${i}" data-emoji="${emoji}">
              ${emoji} <span>${reactions[emoji] || 0}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.feedIndex;
      const emoji = btn.dataset.emoji;
      if (!state.teamFeedReactions[idx]) state.teamFeedReactions[idx] = {};
      state.teamFeedReactions[idx][emoji] = (state.teamFeedReactions[idx][emoji] || 0) + 1;
      SFX.tap();
      saveState();
      renderTeamFeed();
    });
  });
}

function renderTeamBattle() {
  const yourTeamFruit = MOCK_TEAM_BATTLE[0].fruit + state.fruitCount; // "Rooted" is your team
  const rows = [
    { team: 'Rooted', fruit: yourTeamFruit, isYours: true },
    ...MOCK_TEAM_BATTLE.slice(1)
  ].sort((a, b) => b.fruit - a.fruit);

  el('teamBattleList').innerHTML = rows.map((r, i) => `
    <div class="ranking-row ${r.isYours ? 'is-you' : ''}">
      <span class="ranking-rank">#${i + 1}</span>
      <span class="ranking-name">${r.team}${r.isYours ? ' (You)' : ''}</span>
      <span class="ranking-fp">🍎 ${r.fruit}</span>
    </div>
  `).join('');
}

/* ---------------- Seasonal / limited-time events ---------------- */
function getActiveEvent() {
  const today = getDateKey();
  return CONFIG.events.find(e => today >= e.start && today <= e.end) || null;
}

function renderEventBanner() {
  const banner = el('eventBanner');
  const activeEvent = getActiveEvent();
  if (!activeEvent) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  banner.innerHTML = `<strong>${activeEvent.label}</strong><br>${activeEvent.description}`;
}

/* ---------------- Badges / achievements ---------------- */
function checkBadges() {
  let newlyUnlocked = null;
  CONFIG.badges.forEach(b => {
    if (!state.badges[b.id] && b.check(state)) {
      state.badges[b.id] = true;
      newlyUnlocked = b;
    }
  });
  if (newlyUnlocked) {
    SFX.badge();
    showToast(`🏅 Badge unlocked: ${newlyUnlocked.label}!`, 'success');
    if (!state.unlockedBadgeIcon) {
      state.unlockedBadgeIcon = newlyUnlocked.icon;
    }
  }
  renderBadges();
}

function renderBadges() {
  const grid = el('badgeGrid');
  if (!grid) return;
  grid.innerHTML = CONFIG.badges.map(b => {
    const unlocked = !!state.badges[b.id];
    return `
      <button class="badge-tile ${unlocked ? 'unlocked' : 'locked'}" data-badge-icon="${b.icon}" ${unlocked ? '' : 'disabled'} title="${b.desc}">
        <span class="badge-icon">${unlocked ? b.icon : '🔒'}</span>
        <span class="badge-label">${b.label}</span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.badge-tile.unlocked').forEach(btn => {
    btn.addEventListener('click', () => {
      state.unlockedBadgeIcon = btn.dataset.badgeIcon;
      renderTreeNameDisplay();
      saveState();
      showToast('Sticker set next to your tree name!', 'info');
    });
  });
}

/* ---------------- Personalization: profile name + tree name ---------------- */
function renderTreeNameDisplay() {
  const displayEl = el('treeNameDisplay');
  const sticker = state.unlockedBadgeIcon ? `${state.unlockedBadgeIcon} ` : '';
  displayEl.textContent = state.treeName ? `${sticker}${state.treeName}` : `${sticker}Growing Seed`;
}

function renderNameLocks() {
  // Tree name: fully locked after first set, only unlocked by resetting the tree.
  const treeInput = el('treeNameInput');
  const treeHint = el('treeNameHint');
  treeInput.disabled = state.treeNameLocked;
  el('saveTreeNameBtn').disabled = state.treeNameLocked;
  treeHint.textContent = state.treeNameLocked
    ? '🔒 Locked — reset your tree to rename it.'
    : 'You can set this once — choose carefully!';

  // Profile name: one free initial set, then exactly one more edit, then locked.
  const profileInput = el('profileNameInput');
  const profileHint = el('profileNameHint');
  const locked = state.profileNameEditsUsed >= 1 && !!state.profileName;
  profileInput.disabled = locked;
  el('saveProfileNameBtn').disabled = locked;
  if (!state.profileName) {
    profileHint.textContent = 'Set your name once — you\'ll get one chance to change it later.';
  } else if (!locked) {
    profileHint.textContent = 'You have 1 more change available before this locks.';
  } else {
    profileHint.textContent = '🔒 Locked — you\'ve used your one allowed change.';
  }
}

function renderDateJoined() {
  const d = new Date(state.dateJoined + 'T00:00:00');
  el('dateJoinedValue').textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

el('saveTreeNameBtn').addEventListener('click', () => {
  if (state.treeNameLocked) return; // extra guard beyond the disabled attribute
  const value = el('treeNameInput').value.trim().slice(0, 24);
  if (!value) { showToast('Enter a name first.', 'warning'); return; }
  state.treeName = value;
  state.treeNameLocked = true;
  renderTreeNameDisplay();
  renderNameLocks();
  saveState();
  showToast('Tree name saved and locked. Reset your tree to rename it.', 'success');
});

el('saveProfileNameBtn').addEventListener('click', () => {
  const value = el('profileNameInput').value.trim().slice(0, 24);
  if (!value) { showToast('Enter a name first.', 'warning'); return; }
  const isFirstSet = !state.profileName;
  if (!isFirstSet) {
    if (state.profileNameEditsUsed >= 1) return; // already used the one allowed change
    state.profileNameEditsUsed++;
  }
  state.profileName = value;
  renderNameLocks();
  saveState();
  showToast(isFirstSet ? 'Profile name saved.' : 'Profile name changed — that was your one allowed change.', 'success');
});

el('saveProfileEmailBtn').addEventListener('click', () => {
  const value = el('profileEmailInput').value.trim();
  state.profileEmail = value;
  saveState();
  showToast('Email saved.', 'success');
});

/* ---------------- Sound toggle ---------------- */
el('soundToggle').addEventListener('change', () => {
  state.soundEnabled = el('soundToggle').checked;
  saveState();
  if (state.soundEnabled) SFX.tap();
});

/* ---------------- Test tools ---------------- */
el('addTestFpBtn').addEventListener('click', () => {
  state.faithPoints += 100;
  showToast('+100 FP added for testing.', 'info');
  render();
});

el('resetTreeBtn').addEventListener('click', () => {
  const RESET_COST = 1000;
  if (state.faithPoints < RESET_COST) {
    showToast(`Resetting your tree costs ${RESET_COST} FP — you have ${Math.floor(state.faithPoints)}.`, 'warning');
    return;
  }
  if (!confirm(`Reset your tree's growth for ${RESET_COST} FP and choose a new seed to grow? Your streak stays as it is.`)) return;
  state.faithPoints -= RESET_COST;
  state.treeProgress = 0;
  state.maxBloomReached = false;
  state.fruitCount = 0;
  state.pointsForFruit = 0;
  state.hasCelebratedFirstFruit = false;
  state.previousStage = null; // forces the stage-swap/background to re-run back to Seed
  state.treeNameLocked = false; // renaming unlocks again on a fresh tree
  skipNextLevelUpCelebration = true;
  document.querySelectorAll('.tree-stage-img').forEach(elImg => elImg.classList.remove('active'));
  render();
  renderNameLocks();
  seedChoiceContext = 'reset';
  el('seedChoiceModal').hidden = false;
  showToast(`Tree reset for ${RESET_COST} FP. You can rename it now.`, 'info');
});

el('resetProgressBtn').addEventListener('click', () => {
  if (!confirm('Reset all local progress? This only clears this browser\'s saved sandbox state.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  document.querySelectorAll('.tree-stage-img').forEach(elImg => elImg.classList.remove('active'));
  render();
  showToast('Progress reset.', 'info');
});

/* ---------------- First-fruit celebration (Canvas) ---------------- */
function celebrateFirstFruit() {
  showToast('🍎 Your tree bore its first fruit!', 'success');

  const canvas = el('celebrationCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  ctx.scale(dpr, dpr);

  const colors = ['#ff7043', '#ffd54f', '#4dbd72', '#3e8ede'];
  const particles = Array.from({ length: 60 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 1.2) * 8,
    size: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1
  }));

  let frame = 0;
  function tick() {
    frame++;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
      p.vy += 0.18; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (frame < 140) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------------- Init ---------------- */
applySeedTypePalette();
renderVerseOfDay();
renderSeedTypeGrid();
el('treeNameInput').value = state.treeName || '';
el('profileNameInput').value = state.profileName || '';
el('profileEmailInput').value = state.profileEmail || '';
renderDateJoined();
renderNameLocks();
el('soundToggle').checked = state.soundEnabled;
renderRanking();
render({ persist: false });

if (!state.hasChosenSeedType) {
  // First-ever visit: choosing a seed comes before anything else,
  // including the daily reward popup.
  seedChoiceContext = 'onboarding';
  setTimeout(() => { el('seedChoiceModal').hidden = false; }, 400);
} else if (!hasClaimedToday()) {
  setTimeout(() => { el('dailyLoginModal').hidden = false; }, 400);
}
