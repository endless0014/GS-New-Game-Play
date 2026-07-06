/* ============================================================
   Admin Dashboard (Sample)
   All data here is local mock data generated in the browser —
   there is no backend, no real user accounts, and nothing here
   is connected to the gameplay sandbox's own saved progress.
   This exists purely to test the layout/interaction pattern.
   ============================================================ */

const STORAGE_KEY = 'growingSeedAdminSandbox_v1';
const STAGE_LABELS = ['Seed', 'Germination', 'Seedling', 'Sapling', 'Young Tree', 'Mature Tree', 'Old Tree'];
const ROLE_TIERS = ['user', 'moderator', 'leader', 'admin'];
const ROLE_LABELS = { user: 'User', moderator: 'Moderator', leader: 'Leader', admin: 'Admin' };

const FIRST_NAMES = ['Maria', 'James', 'Grace', 'Daniel', 'Sofia', 'Noah', 'Ruth', 'Samuel', 'Hannah', 'Elijah', 'Naomi', 'Isaac'];
const LAST_NAMES  = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Ramos'];

let state = loadState();

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeMockUser(role = 'user') {
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
    fruit: randomInt(0, 12),
    teamLeaderId: null,          // set once a join request is approved
    pendingRequestLeaderId: null // set while a join request awaits approval
  };
}

function dateKey(d) { return d.toISOString().slice(0, 10); }

// Generates ~120 days of mock daily activity so the date-range picker
// has real history to browse, not just the last 7 days.
function generateDailyStats() {
  const stats = {};
  const today = new Date();
  for (let i = 0; i < 120; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? randomInt(18, 30) : randomInt(28, 55);
    stats[dateKey(d)] = {
      logins: base,
      dailyTasks: randomInt(20, 70),
      challenges: randomInt(5, 25),
      faithActivities: randomInt(10, 40)
    };
  }
  return stats;
}

// Only these two roles can view the full player-management dashboard.
// Leader and User get their own dedicated views instead (see renderLeaderView/renderUserView).
const PERMISSIONS = {
  admin:     { addPoints: true, resetPassword: true, resetProgress: true,  restore: true, view: true, delete: true, openUI: true, changeRole: true },
  moderator: { addPoints: true, resetPassword: true, resetProgress: false, restore: true, view: true, delete: true, openUI: true, changeRole: false }
};

function defaultState() {
  const users = [makeMockUser('admin')];
  const tierMix = ['user', 'user', 'user', 'user', 'moderator', 'leader'];
  tierMix.forEach(role => users.push(makeMockUser(role)));

  // Seed a little team data so Leader/User views have something to show
  // out of the box: two members already on the team, one pending request.
  const leader = users.find(u => u.role === 'leader');
  const plainUsers = users.filter(u => u.role === 'user');
  if (leader && plainUsers.length >= 3) {
    plainUsers[0].teamLeaderId = leader.id;
    plainUsers[1].teamLeaderId = leader.id;
    plainUsers[2].pendingRequestLeaderId = leader.id;
  }

  return { users, deletedUsers: [], dailyStats: generateDailyStats(), viewerRole: 'admin' };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.users.length) return defaultState();
    if (!parsed.dailyStats) parsed.dailyStats = generateDailyStats();
    if (!parsed.viewerRole) parsed.viewerRole = 'admin';
    if (!parsed.deletedUsers) parsed.deletedUsers = [];
    // Migrate any old 'player' role values to the new 'user' tier, and
    // backfill team fields for users saved before teams existed.
    parsed.users.forEach(u => {
      if (u.role === 'player') u.role = 'user';
      if (u.teamLeaderId === undefined) u.teamLeaderId = null;
      if (u.pendingRequestLeaderId === undefined) u.pendingRequestLeaderId = null;
    });
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
  renderCharts();
  applyViewerRoleVisibility();
  if (state.viewerRole === 'admin' || state.viewerRole === 'moderator') {
    renderUsers();
    renderDeletedUsers();
  } else if (state.viewerRole === 'leader') {
    renderLeaderView();
  } else if (state.viewerRole === 'user') {
    renderUserView();
  }
  saveState();
}

function applyViewerRoleVisibility() {
  const role = state.viewerRole;
  el('adminModView').hidden = !(role === 'admin' || role === 'moderator');
  el('deletedUsersCard').hidden = !(role === 'admin' || role === 'moderator');
  el('leaderView').hidden = role !== 'leader';
  el('userView').hidden = role !== 'user';

  const asWhoRow = el('asWhoRow');
  const asWhoSelect = el('asWhoSelect');
  const previousSelection = asWhoSelect.value;

  if (role === 'leader') {
    asWhoRow.hidden = false;
    const leaders = state.users.filter(u => u.role === 'leader');
    asWhoSelect.innerHTML = leaders.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('')
      || '<option value="">No leaders yet</option>';
  } else if (role === 'user') {
    asWhoRow.hidden = false;
    const plainUsers = state.users.filter(u => u.role === 'user');
    asWhoSelect.innerHTML = plainUsers.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('')
      || '<option value="">No users yet</option>';
  } else {
    asWhoRow.hidden = true;
  }

  // Restore the previous selection if it's still a valid option, instead
  // of silently snapping back to the first person in the list.
  if (previousSelection && [...asWhoSelect.options].some(o => o.value === previousSelection)) {
    asWhoSelect.value = previousSelection;
  }
}

function renderStats() {
  const users = state.users;
  const total = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const staff = users.filter(u => u.role === 'moderator' || u.role === 'leader').length;
  const avgFp = total ? Math.round(users.reduce((s, u) => s + u.fp, 0) / total) : 0;
  const avgStreak = total ? (users.reduce((s, u) => s + u.streak, 0) / total).toFixed(1) : 0;

  el('statGrid').innerHTML = `
    <div class="stat-tile"><span class="value">${total}</span><span class="label">Total Players</span></div>
    <div class="stat-tile"><span class="value">${staff}</span><span class="label">Moderators + Leaders</span></div>
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

  const perms = PERMISSIONS[state.viewerRole] || PERMISSIONS.moderator;

  list.forEach(u => {
    if (perms.addPoints) el(`add-${u.id}`).addEventListener('click', () => addPoints(u.id, 50));
    if (perms.view) el(`view-${u.id}`).addEventListener('click', () => viewUser(u.id));
    if (perms.openUI) el(`openui-${u.id}`).addEventListener('click', () => openUIAs(u.id));
    if (perms.resetPassword) el(`resetpw-${u.id}`).addEventListener('click', () => resetPassword(u.id));
    if (perms.delete) el(`delete-${u.id}`).addEventListener('click', () => confirmAction(
      'Delete this player?',
      `${u.name} will be moved to Deleted Players, where an Admin or Moderator can restore them. This only affects local demo data.`,
      () => deleteUser(u.id)
    ));
    if (perms.resetProgress) {
      const resetBtn = el(`reset-${u.id}`);
      if (resetBtn) resetBtn.addEventListener('click', () => confirmAction(
        'Reset this player?',
        `This sets ${u.name}'s FP, streak, stage, and fruit back to zero. This only affects local demo data.`,
        () => resetUser(u.id)
      ));
    }
    if (perms.changeRole) {
      const roleSelect = el(`roleSelect-${u.id}`);
      if (roleSelect) roleSelect.addEventListener('change', () => updateRole(u.id, roleSelect.value));
    }
  });
}

function userCardHtml(u) {
  const perms = PERMISSIONS[state.viewerRole] || PERMISSIONS.moderator;
  const roleOptions = ROLE_TIERS.map(tier =>
    `<option value="${tier}" ${u.role === tier ? 'selected' : ''}>${ROLE_LABELS[tier]}</option>`
  ).join('');

  return `
    <div class="user-card">
      <div class="user-card-top">
        <div>
          <div class="user-name">${escapeHtml(u.name)}</div>
          <div class="user-email">${escapeHtml(u.email)}</div>
        </div>
        <span class="role-badge ${u.role}">${ROLE_LABELS[u.role]}</span>
      </div>
      <div class="user-stats">
        <div class="u-stat"><span class="n">${u.fp}</span><span class="l">FP</span></div>
        <div class="u-stat"><span class="n">${u.streak}</span><span class="l">Streak</span></div>
        <div class="u-stat"><span class="n">${u.fruit}</span><span class="l">Fruit</span></div>
        <div class="u-stat"><span class="n">${u.stage}</span><span class="l">Stage</span></div>
      </div>
      <label class="role-select-label">
        Role
        <select id="roleSelect-${u.id}" class="role-select" ${perms.changeRole ? '' : 'disabled title="Only Admins can change roles"'}>
          ${roleOptions}
        </select>
      </label>
      <div class="user-actions">
        <button id="add-${u.id}">+50 FP</button>
        <button id="view-${u.id}">View</button>
        <button id="openui-${u.id}">Open UI</button>
        <button id="resetpw-${u.id}">Reset Password</button>
        <button id="delete-${u.id}" class="danger-action">Delete</button>
        <button id="reset-${u.id}" class="danger-action" ${perms.resetProgress ? '' : 'disabled title="Only Admins can reset progress"'}>Reset Progress</button>
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

function updateRole(id, newRole) {
  // Guard here too, not just via the disabled attribute — mirrors the
  // real app needing a server-side check, not just a hidden UI control.
  const perms = PERMISSIONS[state.viewerRole] || PERMISSIONS.moderator;
  if (!perms.changeRole) {
    showToast('Only Admins can change roles.', 'warning');
    renderUsers();
    return;
  }
  const u = state.users.find(x => x.id === id);
  if (!u || !ROLE_TIERS.includes(newRole)) return;
  u.role = newRole;
  showToast(`${u.name} is now ${ROLE_LABELS[newRole]}.`, 'info');
  renderAll();
}

function resetUser(id) {
  const perms = PERMISSIONS[state.viewerRole] || PERMISSIONS.moderator;
  if (!perms.resetProgress) {
    showToast('Only Admins can reset progress.', 'warning');
    return;
  }
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  u.fp = 0;
  u.streak = 1;
  u.fruit = 0;
  u.stage = STAGE_LABELS[0];
  showToast(`${u.name}'s progress was reset.`, 'info');
  renderAll();
}

function viewUser(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  el('viewUserBody').innerHTML = `
    <div class="vu-row"><span class="vu-label">Name</span><span class="vu-value">${escapeHtml(u.name)}</span></div>
    <div class="vu-row"><span class="vu-label">Email</span><span class="vu-value">${escapeHtml(u.email)}</span></div>
    <div class="vu-row"><span class="vu-label">Role</span><span class="vu-value">${ROLE_LABELS[u.role]}</span></div>
    <div class="vu-row"><span class="vu-label">Stage</span><span class="vu-value">${u.stage}</span></div>
    <div class="vu-row"><span class="vu-label">Faith Points</span><span class="vu-value">${u.fp}</span></div>
    <div class="vu-row"><span class="vu-label">Streak</span><span class="vu-value">${u.streak}</span></div>
    <div class="vu-row"><span class="vu-label">Fruit</span><span class="vu-value">${u.fruit}</span></div>
    <div class="vu-row"><span class="vu-label">Team Leader</span><span class="vu-value">${teamLeaderName(u.teamLeaderId)}</span></div>
  `;
  el('viewUserModal').hidden = false;
}
el('closeViewUserBtn').addEventListener('click', () => { el('viewUserModal').hidden = true; });

function teamLeaderName(leaderId) {
  if (!leaderId) return '— none —';
  const leader = state.users.find(u => u.id === leaderId);
  return leader ? leader.name : '— none —';
}

function openUIAs(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  showToast(`Opening the app as ${u.name}… (sample only, no real session switch)`, 'info');
}

function resetPassword(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  showToast(`Password reset email sent to ${u.email} (sample only).`, 'success');
}

function deleteUser(id) {
  const idx = state.users.findIndex(x => x.id === id);
  if (idx === -1) return;
  const [removed] = state.users.splice(idx, 1);
  state.deletedUsers.push(removed);
  showToast(`${removed.name} was deleted.`, 'info');
  renderAll();
}

function restoreUser(id) {
  const idx = state.deletedUsers.findIndex(x => x.id === id);
  if (idx === -1) return;
  const [restored] = state.deletedUsers.splice(idx, 1);
  state.users.push(restored);
  showToast(`${restored.name} was restored.`, 'success');
  renderAll();
}

function renderDeletedUsers() {
  const perms = PERMISSIONS[state.viewerRole] || PERMISSIONS.moderator;
  const list = state.deletedUsers;
  el('deletedUsersCard').hidden = !(state.viewerRole === 'admin' || state.viewerRole === 'moderator') || list.length === 0;
  el('deletedUserList').innerHTML = list.map(u => `
    <div class="user-card">
      <div class="user-card-top">
        <div>
          <div class="user-name">${escapeHtml(u.name)}</div>
          <div class="user-email">${escapeHtml(u.email)}</div>
        </div>
        <span class="role-badge ${u.role}">${ROLE_LABELS[u.role]}</span>
      </div>
      <div class="user-actions">
        <button id="restore-${u.id}" ${perms.restore ? '' : 'disabled'}>Restore</button>
      </div>
    </div>
  `).join('');
  list.forEach(u => {
    const btn = el(`restore-${u.id}`);
    if (btn && perms.restore) btn.addEventListener('click', () => restoreUser(u.id));
  });
}

/* ---------------- Filters ---------------- */
el('searchInput').addEventListener('input', renderUsers);

document.querySelectorAll('#roleChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#roleChips .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeRoleFilter = chip.dataset.role;
    renderUsers();
  });
});

/* ---------------- Add / reset all ---------------- */
el('addTestUserBtn').addEventListener('click', () => {
  state.users.push(makeMockUser('user'));
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
      document.querySelectorAll('#roleChips .chip').forEach(c => c.classList.remove('active'));
      document.querySelector('#roleChips .chip[data-role="all"]').classList.add('active');
      el('searchInput').value = '';
      el('viewerRoleSelect').value = state.viewerRole;
      updateViewerRoleNote();
      selectedRange = { start: todayMinus(6), end: todayMinus(0) };
      el('rangeStart').value = selectedRange.start;
      el('rangeEnd').value = selectedRange.end;
      el('last7Btn').classList.add('active');
      renderAll();
    }
  );
});

/* ---------------- Viewer role simulator ---------------- */
el('viewerRoleSelect').value = state.viewerRole;
updateViewerRoleNote();

el('viewerRoleSelect').addEventListener('change', () => {
  state.viewerRole = el('viewerRoleSelect').value;
  updateViewerRoleNote();
  saveState();
  renderAll();
});

el('asWhoSelect').addEventListener('change', () => renderAll());

function updateViewerRoleNote() {
  const note = el('viewerRoleNote');
  if (state.viewerRole === 'admin') {
    note.textContent = 'You are previewing as Admin — every action below is available.';
  } else if (state.viewerRole === 'moderator') {
    note.textContent = 'You are previewing as Moderator — everything except changing roles and resetting progress.';
  } else if (state.viewerRole === 'leader') {
    note.textContent = 'You are previewing as a Team Leader — you can see your team and send reminders.';
  } else {
    note.textContent = 'You are previewing as a User — you can request to join a team led by someone else.';
  }
}

/* ---------------- Leader view: team + pending requests ---------------- */
function currentAsWhoId() {
  return el('asWhoSelect').value;
}

function renderLeaderView() {
  const leaderId = currentAsWhoId();
  const leader = state.users.find(u => u.id === leaderId);
  el('leaderTeamNote').textContent = leader
    ? `Reminders go out to everyone on ${leader.name}'s team.`
    : 'Promote someone to Leader first (as an Admin) to see a team here.';

  const team = state.users.filter(u => u.teamLeaderId === leaderId);
  el('leaderTeamEmpty').hidden = team.length > 0;
  el('leaderTeamList').innerHTML = team.map(u => `
    <div class="user-card">
      <div class="user-card-top">
        <div>
          <div class="user-name">${escapeHtml(u.name)}</div>
          <div class="user-email">${escapeHtml(u.email)}</div>
        </div>
        <span class="role-badge ${u.role}">${ROLE_LABELS[u.role]}</span>
      </div>
      <div class="user-stats">
        <div class="u-stat"><span class="n">${u.fp}</span><span class="l">FP</span></div>
        <div class="u-stat"><span class="n">${u.streak}</span><span class="l">Streak</span></div>
        <div class="u-stat"><span class="n">${u.fruit}</span><span class="l">Fruit</span></div>
        <div class="u-stat"><span class="n">${u.stage}</span><span class="l">Stage</span></div>
      </div>
      <div class="user-actions">
        <button class="remind-btn" id="remind-${u.id}">🔔 Remind</button>
      </div>
    </div>
  `).join('');
  team.forEach(u => {
    el(`remind-${u.id}`).addEventListener('click', () => {
      showToast(`Reminder sent to ${u.name} (sample only — no real notification).`, 'success');
    });
  });

  const pending = state.users.filter(u => u.pendingRequestLeaderId === leaderId);
  el('leaderRequestsEmpty').hidden = pending.length > 0;
  el('leaderRequestsList').innerHTML = pending.map(u => `
    <div class="user-card">
      <div class="user-card-top">
        <div>
          <div class="user-name">${escapeHtml(u.name)}</div>
          <div class="user-email">${escapeHtml(u.email)}</div>
        </div>
        <span class="role-badge ${u.role}">${ROLE_LABELS[u.role]}</span>
      </div>
      <div class="user-actions">
        <button id="approve-${u.id}">✓ Approve</button>
        <button id="decline-${u.id}" class="danger-action">Decline</button>
      </div>
    </div>
  `).join('');
  pending.forEach(u => {
    el(`approve-${u.id}`).addEventListener('click', () => {
      u.teamLeaderId = leaderId;
      u.pendingRequestLeaderId = null;
      showToast(`${u.name} joined the team.`, 'success');
      renderAll();
    });
    el(`decline-${u.id}`).addEventListener('click', () => {
      u.pendingRequestLeaderId = null;
      showToast(`Declined ${u.name}'s request.`, 'info');
      renderAll();
    });
  });
}

/* ---------------- User view: choose or apply to a leader's team ---------------- */
function renderUserView() {
  const userId = currentAsWhoId();
  const me = state.users.find(u => u.id === userId);
  el('userTeamNote').textContent = me && me.teamLeaderId
    ? `You're on ${teamLeaderName(me.teamLeaderId)}'s team.`
    : 'Request to join a Leader\'s team below. They will need to approve you.';

  const leaders = state.users.filter(u => u.role === 'leader');
  el('leaderOptionsList').innerHTML = leaders.map(leaderUser => {
    let btnLabel = 'Request to Join';
    let btnClass = 'request-btn';
    let disabled = '';
    if (me && me.teamLeaderId === leaderUser.id) {
      btnLabel = '✓ On this team';
      btnClass = 'request-btn joined';
      disabled = 'disabled';
    } else if (me && me.pendingRequestLeaderId === leaderUser.id) {
      btnLabel = 'Requested ⏳';
      btnClass = 'request-btn pending';
      disabled = 'disabled';
    } else if (me && me.teamLeaderId) {
      disabled = 'disabled title="Leave your current team first"';
    }
    return `
      <div class="user-card">
        <div class="user-card-top">
          <div>
            <div class="user-name">${escapeHtml(leaderUser.name)}</div>
            <div class="user-email">${escapeHtml(leaderUser.email)}</div>
          </div>
          <span class="role-badge leader">Leader</span>
        </div>
        <div class="user-actions">
          <button class="${btnClass}" id="join-${leaderUser.id}" ${disabled}>${btnLabel}</button>
        </div>
      </div>
    `;
  }).join('');

  leaders.forEach(leaderUser => {
    const btn = el(`join-${leaderUser.id}`);
    if (btn && !btn.disabled) {
      btn.addEventListener('click', () => {
        if (!me) return;
        me.pendingRequestLeaderId = leaderUser.id;
        showToast(`Request sent to ${leaderUser.name}.`, 'success');
        renderAll();
      });
    }
  });

  if (me && me.teamLeaderId) {
    el('leaderOptionsList').innerHTML += `
      <button class="btn secondary" id="leaveTeamBtn" style="width:100%;margin-top:0.6rem;">Leave Team</button>
    `;
    el('leaveTeamBtn').addEventListener('click', () => {
      me.teamLeaderId = null;
      showToast('You left your team.', 'info');
      renderAll();
    });
  }
}

/* ---------------- Analytics: date range + charts ---------------- */
function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateKey(d);
}

let selectedRange = { start: todayMinus(6), end: todayMinus(0) };

el('rangeStart').value = selectedRange.start;
el('rangeEnd').value = selectedRange.end;

el('last7Btn').addEventListener('click', () => {
  selectedRange = { start: todayMinus(6), end: todayMinus(0) };
  el('rangeStart').value = selectedRange.start;
  el('rangeEnd').value = selectedRange.end;
  el('last7Btn').classList.add('active');
  renderCharts();
});

el('applyRangeBtn').addEventListener('click', () => {
  const start = el('rangeStart').value;
  const end = el('rangeEnd').value;
  if (!start || !end || start > end) {
    showToast('Pick a valid start and end date.', 'warning');
    return;
  }
  selectedRange = { start, end };
  el('last7Btn').classList.remove('active');
  renderCharts();
});

function datesInRange(start, end) {
  const out = [];
  const cur = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (cur <= last) {
    out.push(dateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function shortLabel(dateStr, totalDays) {
  const d = new Date(dateStr + 'T00:00:00');
  if (totalDays <= 9) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function renderCharts() {
  const days = datesInRange(selectedRange.start, selectedRange.end);
  const stats = days.map(d => state.dailyStats[d] || { logins: 0, dailyTasks: 0, challenges: 0, faithActivities: 0 });

  const loginLabels = days.map(d => shortLabel(d, days.length));
  const loginValues = stats.map(s => s.logins);
  drawBarChart('loginChart', loginLabels, loginValues, '#3a9e4f');

  const taskValues = stats.map(s => s.dailyTasks + s.challenges + s.faithActivities);
  drawBarChart('taskChart', loginLabels, taskValues, '#2bbfa0');

  const totalDailyTasks = stats.reduce((s, x) => s + x.dailyTasks, 0);
  const totalChallenges = stats.reduce((s, x) => s + x.challenges, 0);
  const totalFaith = stats.reduce((s, x) => s + x.faithActivities, 0);
  const totalLogins = stats.reduce((s, x) => s + x.logins, 0);

  el('taskBreakdown').innerHTML = `
    <div class="breakdown-row"><span>Total logins (range)</span><strong>${totalLogins}</strong></div>
    <div class="breakdown-row"><span>🌿 Daily Tasks completed</span><strong>${totalDailyTasks}</strong></div>
    <div class="breakdown-row"><span>⚡ Challenges resolved</span><strong>${totalChallenges}</strong></div>
    <div class="breakdown-row"><span>🙏 Faith Activities logged</span><strong>${totalFaith}</strong></div>
  `;
}

// Lightweight dependency-free bar chart — no external chart library,
// so this works fully offline and needs nothing beyond this file.
function drawBarChart(canvasId, labels, values, color) {
  const canvas = el(canvasId);
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.parentElement.clientWidth;
  const cssHeight = 160;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const max = Math.max(...values, 1);
  const padding = { top: 10, bottom: 24, left: 8, right: 8 };
  const chartHeight = cssHeight - padding.top - padding.bottom;
  const n = values.length;
  const gap = 6;
  const barWidth = Math.max(4, (cssWidth - padding.left - padding.right - gap * (n - 1)) / n);

  values.forEach((v, i) => {
    const barHeight = (v / max) * chartHeight;
    const x = padding.left + i * (barWidth + gap);
    const y = padding.top + (chartHeight - barHeight);

    ctx.fillStyle = color;
    ctx.beginPath();
    const r = Math.min(4, barWidth / 2);
    ctx.moveTo(x, y + barHeight);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + barWidth - r, y);
    ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
    ctx.lineTo(x + barWidth, y + barHeight);
    ctx.closePath();
    ctx.fill();

    // value label above bar (skip if too many bars to stay readable)
    if (n <= 14) {
      ctx.fillStyle = '#4f6557';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(v), x + barWidth / 2, y - 3 < 8 ? 8 : y - 3);
    }

    // x-axis label (skip some if crowded)
    const skip = n > 20 ? Math.ceil(n / 12) : 1;
    if (i % skip === 0) {
      ctx.fillStyle = '#6b7a6d';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, cssHeight - 8);
    }
  });
}

window.addEventListener('resize', () => renderCharts());

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
