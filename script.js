/* ============================================================
   Growing Seed — Gameplay Sandbox
   All tunable numbers live in CONFIG below so mechanics can be
   adjusted without hunting through logic.
   ============================================================ */

const CONFIG = {
  stages: [
    { key: 'seed',        min: 0,    label: 'Seed' },
    { key: 'germination',  min: 50,   label: 'Germination' },
    { key: 'seedling',    min: 150,  label: 'Seedling' },
    { key: 'sapling',     min: 350,  label: 'Sapling' },
    { key: 'youngTree',   min: 600,  label: 'Young Tree' },
    { key: 'matureTree',  min: 1000, label: 'Mature Tree' },
    { key: 'oldTree',     min: 1500, label: 'Old Tree' }
  ],
  fullBloomThreshold: 1500,
  pointsPerFruit: 100,
  upgradeRootsCost: 10,
  upgradeRootsGrowth: 10,

  actions: {
    fight:     { label: 'Fight',     icon: '⚔️', cost: 10, successRate: 0.7, reward: 35, failPenalty: 12, accent: '--c-fight', type: 'challenge' },
    endure:    { label: 'Endure',    icon: '🛡️', cost: 5,  successRate: 1.0, reward: 15, failPenalty: 0,  accent: '--c-endure', type: 'challenge' },
    giveup:    { label: 'Give Up',   icon: '🍂', cost: 0,  successRate: 1.0, reward: -60, failPenalty: 0, accent: '--c-giveup', isRegression: true, type: 'challenge' },
    water:     { label: 'Water',     icon: '💧', cost: 5,  successRate: 1.0, reward: 20, failPenalty: 0,  accent: '--c-water', type: 'task' },
    protect:   { label: 'Protect',   icon: '🛡️', cost: 10, successRate: 1.0, reward: 30, failPenalty: 0,  accent: '--c-protect', type: 'task' },
    fertilize: { label: 'Fertilize', icon: '✨', cost: 15, successRate: 1.0, reward: 48, failPenalty: 0,  accent: '--c-fertilize', type: 'task' }
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
    faith: { label: 'Faith', icon: '✝️', pill: '#f16a5e', soft: '#fdeceb', canopyHi: '#ffcfc9', canopyMid: '#f16a5e', canopyLo: '#7a2b23', canopySideLo: '#6b241d', fruitColor: '#f16a5e', verseRef: 'Matthew 17:20', verseText: 'Even small faith moves mountains' },
    love:  { label: 'Love',  icon: '❤️', pill: '#ef4f8b', soft: '#fdeaf1', canopyHi: '#ffd3e6', canopyMid: '#ef4f8b', canopyLo: '#7d1d43', canopySideLo: '#6e1a3b', fruitColor: '#ef4f8b', verseRef: '1 Corinthians 13:13', verseText: 'Greatest seed of all virtues' },
    hope:  { label: 'Hope',  icon: '🌈', pill: '#2bbfa0', soft: '#e6f9f5', canopyHi: '#b9f3e6', canopyMid: '#2bbfa0', canopyLo: '#124a3e', canopySideLo: '#0f3f35', fruitColor: '#2bbfa0', verseRef: 'Romans 5:5', verseText: 'Hope does not disappoint' },
    peace: { label: 'Peace', icon: '☮️', pill: '#7fd8ae', soft: '#eafaf1', canopyHi: '#d8f8e8', canopyMid: '#7fd8ae', canopyLo: '#396f52', canopySideLo: '#316148', fruitColor: '#7fd8ae', verseRef: 'James 3:18', verseText: 'Peace sown yields righteousness' },
    joy:   { label: 'Joy',   icon: '😊', pill: '#f6d24e', soft: '#fffaea', canopyHi: '#fff2c2', canopyMid: '#f6d24e', canopyLo: '#7d5f10', canopySideLo: '#6e530e', fruitColor: '#f6d24e', verseRef: 'Galatians 5:22', verseText: 'Joy is fruit of the Spirit' }
  },

  dailyLoginRewards: [5, 5, 10, 10, 15, 15, 30],
  dailyLoginCompletionBonus: 25
};

const STORAGE_KEY = 'growingSeedSandboxState_v1';

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
    faithCompletions: {},   // key: `${faith}:${periodKey}` -> true
    dailyLogin: { claimedDays: [], streakDay: 1, lastClaimDate: '' }
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

  // Mirror the same stats into the Profile tab
  el('profileFp').textContent = Math.floor(state.faithPoints);
  el('profileStreak').textContent = completedDays > 0 ? completedDays : 1;
  el('profileFruit').textContent = state.fruitCount;

  renderStage();
  renderFruits();
  renderLoginGrids();
  renderFaithButtons();
  renderActionAvailability();

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
    playStageLevelUp();

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
  if (tab === 'profile') renderSeedTypeGrid();
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
  el('dailyTasksModal').hidden = false;
}
el('closeDailyTasksBtn').addEventListener('click', () => { el('dailyTasksModal').hidden = true; });

function openChallenge() {
  el('dailyTasksModal').hidden = true;
  const challenge = CONFIG.challenges[Math.floor(Math.random() * CONFIG.challenges.length)];
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

  if (state.faithPoints < cfg.cost) {
    showToast('Not enough Faith Points for that yet.', 'warning');
    return;
  }

  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 200);

  state.faithPoints = Math.max(0, state.faithPoints - cfg.cost);

  const isGiveUp = !!cfg.isRegression;
  const isSuccess = isGiveUp ? false : Math.random() < cfg.successRate;
  const delta = isGiveUp ? cfg.reward : (isSuccess ? cfg.reward : -cfg.failPenalty);

  applyGrowth(delta); // <-- unified path, fruit logic always runs

  // Per-action animation
  if (key === 'water') spawnParticles('p-water', 6);
  else if (key === 'fertilize') spawnParticles('p-sparkle', 7);
  else if (key === 'protect') spawnShieldPulse();
  else if (key === 'fight') spawnImpactFlash(isSuccess);
  else if (key === 'endure') spawnShieldPulse();
  else if (key === 'giveup') spawnDroop();

  progressTrackEl.classList.remove('growth-success', 'growth-fail');
  void progressTrackEl.offsetWidth;
  progressTrackEl.classList.add(isGiveUp || !isSuccess ? 'growth-fail' : 'growth-success');

  const detailText = isGiveUp
    ? `Progress regressed ${Math.abs(cfg.reward)} points.`
    : isSuccess
      ? `+${cfg.reward} growth points.`
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

['fight', 'endure', 'giveup', 'water', 'protect', 'fertilize'].forEach(key => {
  const btn = document.querySelector(`.action-btn[data-action="${key}"]`);
  btn.addEventListener('click', () => runAction(key));
});

function renderActionAvailability() {
  Object.entries(CONFIG.actions).forEach(([key, cfg]) => {
    const btn = document.querySelector(`.action-btn[data-action="${key}"]`);
    if (btn) btn.disabled = state.faithPoints < cfg.cost;
  });
}

/* ---------------- Upgrade Roots ---------------- */
el('upgradeRootsBtn').addEventListener('click', () => {
  if (state.faithPoints < CONFIG.upgradeRootsCost) {
    showToast('Not enough Faith Points to upgrade roots.', 'warning');
    return;
  }
  state.faithPoints -= CONFIG.upgradeRootsCost;
  applyGrowth(CONFIG.upgradeRootsGrowth);
  spawnParticles('p-sparkle', 5);
  showToast(`Roots upgraded! +${CONFIG.upgradeRootsGrowth} growth.`, 'success');
  render();
});

/* ---------------- Faith activities (now require a photo upload) ---------------- */
function renderFaithButtons() {
  document.querySelectorAll('.faith-btn').forEach(btn => {
    const faith = btn.dataset.faith;
    const unit = btn.dataset.period;
    const key = `${faith}:${periodKeyFor(unit)}`;
    const done = !!state.faithCompletions[key];
    btn.disabled = done;
    btn.style.opacity = done ? '0.55' : '1';
  });
}

let pendingFaithBtn = null;
let pendingPhotoDataUrl = null;

document.querySelectorAll('.faith-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const faith = btn.dataset.faith;
    const unit = btn.dataset.period;
    const key = `${faith}:${periodKeyFor(unit)}`;

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

  el('photoUploadModal').hidden = true;
  pendingFaithBtn = null;
  pendingPhotoDataUrl = null;

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
  if (isFinalDay) state.dailyLogin.claimedDays = [];

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
  const grid = el('treeTypeGrid');
  grid.innerHTML = Object.entries(CONFIG.seedTypes).map(([key, t]) => `
    <button class="seed-type-card ${state.seedType === key ? 'selected' : ''}" data-seed-type="${key}"
            style="--seed-pill:${t.pill}; --seed-soft:${t.soft};">
      <span class="seed-pill">${t.icon} ${t.label}</span>
      <span class="seed-verse-ref">${t.verseRef}</span>
      <span class="seed-verse-text">${t.verseText}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.seed-type-card').forEach(card => {
    card.addEventListener('click', () => {
      state.seedType = card.dataset.seedType;
      applySeedTypePalette();
      renderSeedTypeGrid();
      showToast(`Your seed is now planted in ${CONFIG.seedTypes[state.seedType].label}.`, 'success');
      saveState();
    });
  });
}

/* ---------------- Ranking (sample local leaderboard) ---------------- */
const MOCK_RANKING_NAMES = ['Grace M.', 'Daniel T.', 'Hannah R.', 'Samuel B.', 'Naomi C.'];

function renderRanking() {
  // Regenerated each time the tab opens — sample data only, not persisted,
  // just enough to show what a leaderboard layout would look like.
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

/* ---------------- Test tools ---------------- */
el('addTestFpBtn').addEventListener('click', () => {
  state.faithPoints += 100;
  showToast('+100 FP added for testing.', 'info');
  render();
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
render({ persist: false });

// Surface the daily reward automatically on load if it hasn't been
// claimed yet today, instead of waiting for the player to tap "Open."
if (!hasClaimedToday()) {
  setTimeout(() => {
    el('dailyLoginModal').hidden = false;
  }, 400);
}
