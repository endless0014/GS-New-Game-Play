/* ============================================================
   Admin Dashboard (Sample)
   All data here is local mock data generated in the browser —
   there is no backend, no real user accounts, and nothing here
   is connected to the gameplay sandbox's own saved progress.
   This exists purely to test the layout/interaction pattern.
   ============================================================ */

const STORAGE_KEY = 'growingSeedAdminSandbox_v1';
const STAGE_LABELS = ['Seed', 'Germination', 'Seedling', 'Sapling', 'Young Tree', 'Mature Tree', 'Old Tree'];

const FIRST_NAMES = ['Maria', 'James', 'Grace', 'Daniel', 'Sofia', 'Noah', 'Ruth', 'Samuel', 'Hannah', 'Elijah', 'Naomi', 'Isaac'];
const LAST_NAMES  = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Ramos'];

let state = loadState();

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeMockUser(role = 'player') {
  const first = randomFrom(FIRST_NAMES);
  const last = randomFrom(LAST_NAMES);
  const fp = randomInt(0, 800);
  return {
    id: 'u_' + Math.random().toString(36).slice(2, 9),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    role,
    fp,
    streak: randomInt(1, 7),
    stage: randomFrom(STAGE_LABELS),
    fruit: randomInt(0, 12)
  };
}

function defaultState() {
  const users = [makeMockUser('admin')];
  for (let i = 0; i < 7; i++) users.push(makeMockUser('player'));
  return { users };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.users.length) return defaultState();
    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const el = (id) => document.getElementById(id);
let activeRoleFilter = 'all';

function renderAll() {
  renderStats();
  renderUsers();
  saveState();
}

function renderStats() {
  const users = state.users;
  const total = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const avgFp = total ? Math.round(users.reduce((s, u) => s + u.fp, 0) / total) : 0;
  const avgStreak = total ? (users.reduce((s, u) => s + u.streak, 0) / total).toFixed(1) : 0;
  const totalFruit = users.reduce((s, u) => s + u.fruit, 0);

  el('statGrid').innerHTML = `
    <div class="stat-tile"><span class="value">${total}</span><span class="label">Total Players</span></div>
    <div class="stat-tile"><span class="value">${admins}</span><span class="label">Admins</span></div>
    <div class="stat-tile"><span class="value">${avgFp}</span><span class="label">Avg FP</span></div>
    <div class="stat-tile"><span class="value">${avgStreak}</span><span class="label">Avg Streak</span></div>
  `;
}

function renderUsers() {
  const query = (el('searchInput').value || '').toLowerCase().trim();
  const list = state.users.filter(u => {
    const matchesQuery = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    const matchesRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
    return matchesQuery && matchesRole;
  });

  el('emptyState').hidden = list.length > 0;
  el('userList').innerHTML = list.map(userCardHtml).join('');

  list.forEach(u => {
    el(`add-${u.id}`).addEventListener('click', () => addPoints(u.id, 50));
    el(`role-${u.id}`).addEventListener('click', () => toggleRole(u.id));
    el(`reset-${u.id}`).addEventListener('click', () => confirmAction(
      'Reset this player?',
      `This sets ${u.name}'s FP, streak, stage, and fruit back to zero. This only affects local demo data.`,
      () => resetUser(u.id)
    ));
  });
}

function userCardHtml(u) {
  return `
    <div class="user-card">
      <div class="user-card-top">
        <div>
          <div class="user-name">${escapeHtml(u.name)}</div>
          <div class="user-email">${escapeHtml(u.email)}</div>
        </div>
        <span class="role-badge ${u.role}">${u.role === 'admin' ? 'Admin' : 'Player'}</span>
      </div>
      <div class="user-stats">
        <div class="u-stat"><span class="n">${u.fp}</span><span class="l">FP</span></div>
        <div class="u-stat"><span class="n">${u.streak}</span><span class="l">Streak</span></div>
        <div class="u-stat"><span class="n">${u.fruit}</span><span class="l">Fruit</span></div>
        <div class="u-stat"><span class="n">${u.stage}</span><span class="l">Stage</span></div>
      </div>
      <div class="user-actions">
        <button id="add-${u.id}">+50 FP</button>
        <button id="role-${u.id}">${u.role === 'admin' ? 'Make Player' : 'Make Admin'}</button>
        <button id="reset-${u.id}" class="danger-action">Reset</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function addPoints(id, amount) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  u.fp += amount;
  showToast(`+${amount} FP added to ${u.name}.`, 'success');
  renderAll();
}

function toggleRole(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  u.role = u.role === 'admin' ? 'player' : 'admin';
  showToast(`${u.name} is now ${u.role === 'admin' ? 'an Admin' : 'a Player'}.`, 'info');
  renderAll();
}

function resetUser(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  u.fp = 0;
  u.streak = 1;
  u.fruit = 0;
  u.stage = STAGE_LABELS[0];
  showToast(`${u.name}'s progress was reset.`, 'info');
  renderAll();
}

/* ---------------- Filters ---------------- */
el('searchInput').addEventListener('input', renderUsers);

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeRoleFilter = chip.dataset.role;
    renderUsers();
  });
});

/* ---------------- Add / reset all ---------------- */
el('addTestUserBtn').addEventListener('click', () => {
  state.users.push(makeMockUser('player'));
  showToast('Demo player added.', 'success');
  renderAll();
});

el('resetAllBtn').addEventListener('click', () => {
  confirmAction(
    'Reset all demo data?',
    'This regenerates a fresh set of mock players and clears any changes you\'ve made here.',
    () => {
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      activeRoleFilter = 'all';
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      document.querySelector('.chip[data-role="all"]').classList.add('active');
      el('searchInput').value = '';
      renderAll();
    }
  );
});

/* ---------------- Confirm modal (proper text confirm, not window.confirm) ----------------
   The original app's delete-account flow asked the user to "type your
   email to confirm" inside a plain window.confirm(), which only offers
   OK/Cancel and can't actually collect typed input. This modal is the
   fix for that pattern: a real dialog with a real Confirm/Cancel choice. */
let pendingConfirmAction = null;

function confirmAction(title, body, onConfirm) {
  el('confirmTitle').textContent = title;
  el('confirmBody').textContent = body;
  pendingConfirmAction = onConfirm;
  el('confirmModal').hidden = false;
}

el('confirmYesBtn').addEventListener('click', () => {
  el('confirmModal').hidden = true;
  if (pendingConfirmAction) pendingConfirmAction();
  pendingConfirmAction = null;
});

el('confirmNoBtn').addEventListener('click', () => {
  el('confirmModal').hidden = true;
  pendingConfirmAction = null;
});

/* ---------------- Toasts (shared visual language with the game) ---------------- */
function showToast(message, type = 'info') {
  const stack = el('toastStack');
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

/* ---------------- Init ---------------- */
renderAll();
