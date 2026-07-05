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
    fight:     { label: 'Fight',     icon: '⚔️', cost: 10, successRate: 0.7, reward: 35, failPenalty: 12, accent: '--c-fight' },
    endure:    { label: 'Endure',    icon: '🛡️', cost: 5,  successRate: 1.0, reward: 15, failPenalty: 0,  accent: '--c-endure' },
    giveup:    { label: 'Give Up',   icon: '🍂', cost: 0,  successRate: 1.0, reward: -60, failPenalty: 0, accent: '--c-giveup', isRegression: true },
    water:     { label: 'Water',     icon: '💧', cost: 5,  successRate: 1.0, reward: 20, failPenalty: 0,  accent: '--c-water' },
    protect:   { label: 'Protect',   icon: '🛡️', cost: 10, successRate: 1.0, reward: 30, failPenalty: 0,  accent: '--c-protect' },
    fertilize: { label: 'Fertilize', icon: '✨', cost: 15, successRate: 1.0, reward: 48, failPenalty: 0,  accent: '--c-fertilize' }
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
function showResultPopup({ icon, title, detail, accentVar }) {
  el('resultIcon').textContent = icon;
  el('resultTitle').textContent = title;
  el('resultDetail').textContent = detail;
  el('resultCard').style.setProperty('--result-accent', `var(${accentVar})`);
  el('resultOverlay').classList.add('visible');
}
el('resultCloseBtn').addEventListener('click', () => el('resultOverlay').classList.remove('visible'));

/* ---------------- Toasts ---------------- */
function showToast(message, type = 'info') {
  const stack = el('toastStack');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  stack.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 250);
  }, 2600);
}

/* ---------------- Challenge / Daily Task actions ---------------- */
function runAction(key) {
  const cfg = CONFIG.actions[key];
  const button = el(`${key}Btn`) || document.querySelector(`.action-btn[data-action="${key}"]`);

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
    accentVar: cfg.accent
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

/* ---------------- Faith activities ---------------- */
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

document.querySelectorAll('.faith-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const faith = btn.dataset.faith;
    const unit = btn.dataset.period;
    const fp = Number(btn.dataset.fp);
    const key = `${faith}:${periodKeyFor(unit)}`;

    if (state.faithCompletions[key]) {
      showToast('Already completed for this period.', 'warning');
      return;
    }

    state.faithCompletions[key] = true;
    state.faithPoints += fp;
    showToast(`+${fp} FP earned. Thank you for showing up today.`, 'success');
    render();
  });
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
render({ persist: false });
