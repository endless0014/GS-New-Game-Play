# Growing Seed — Gameplay Sandbox

A standalone, no-setup version of the core Growing Seed gameplay loop, built for testing mechanics and animations on GitHub Pages without needing your Firebase project. Progress saves to `localStorage` in the visitor's own browser — there's no login, no backend, no shared data.

## What's in scope

- Seed → Old Tree progression (7 stages)
- **Tap the tree to open Daily Tasks** (Water / Protect / Fertilize) — not permanent on-page buttons
- **Challenge Actions (Fight / Endure / Give Up) appear on their own**, at random, while tending the tree — not something the player opens directly
- Faith Activities (simplified to instant-claim buttons instead of photo upload, for fast testing)
- Daily login streak (7-day cycle + completion bonus)
- Upgrade Roots
- Fruit generation at Old Tree stage

**Not included on purpose:** login/register, Firebase sync, admin dashboard, photo uploads. Those need your real Firebase project to function and aren't part of "gameplay" — this sandbox is for testing feel and mechanics, not the full production app. Everything here is written so it can be merged back into your existing `script.js`/`style.css` once you're happy with it.

## Bug fixes included (from our review)

1. **Fruit generation now always fires.** In the original code, `handleActionButton()` (Water/Protect/Fertilize/Fight/Endure) modified tree progress directly and skipped the fruit-unlock logic, which only ran through `applyTreeProgress()` (used by Upgrade Roots / Share Gospel / Use All Points). Here, **every** growth source goes through one function, `applyGrowth()`, so fruit always generates correctly regardless of how the player grew the tree. I tested this directly — spamming only Water from 0 to Old Tree correctly produced fruit, which it never did in the original.
2. **No more flicker on every click.** The original re-ran the tree's fade animation on every single action, even when the stage hadn't changed. Here, the fade/burst/background-crossfade only fires when the stage actually changes (`state.previousStage` is tracked and compared).
3. **Background now actually crossfades.** `background-image` can't be transitioned in CSS in any browser — the original's `transition: background-image 0.8s` silently did nothing. This version uses two stacked layers and crossfades their `opacity` instead, which does work.
4. **Modal/z-index scale is fixed and centralized** in one `:root` block (`--z-nav`, `--z-modal`, `--z-toast`, `--z-celebration`) instead of scattered, conflicting values.
5. **Cost/effect text is always visible**, not hover-only — the original hid this behind `:hover`, which never worked on touch devices.
6. **Single unified green theme** — the original mixed a purple auth gradient with a green in-app theme. Everything here uses one palette.

## Animations included

- Distinct per-action feedback: water droplets, shield pulse (Protect/Endure), sparkles (Fertilize), impact flash + shake (Fight), droop + falling leaves (Give Up) — built with plain DOM particles and the Web Animations API (`element.animate()`), no libraries, no reflow hacks.
- A one-time "level up" burst (light flash + bounce) when the tree actually advances a stage.
- A canvas-based confetti celebration the first time fruit is earned.
- `prefers-reduced-motion` is respected — all animations collapse to near-instant for players who've asked their OS for reduced motion.

- **Daily Reward pops up automatically on load** if it hasn't been claimed yet that day — no need to tap "Open" first. Once claimed, it won't reappear again until the next day.

## Every stage is now dimensional, not just the seed

All seven stages (Seed → Old Tree) now share the same layered-shading approach:
- Radial gradients with an offset light source on every canopy/leaf/sprout shape, so each reads as a lit sphere rather than a flat circle.
- Linear gradients on every stem/trunk for a cylindrical, not flat-cutout, look.
- A soft semi-transparent highlight on each canopy cluster.
- A blurred, radial-gradient cast shadow (instead of a flat solid ellipse) that breathes gently in sync with the plant's motion.
- Continuous idle motion tuned to each stage's size: Seed does a slow 3D tumble (via `rotateX`/`rotateY` + CSS `perspective`, since it's a loose object); Germination/Seedling — the smallest rooted stages — sway a little quicker; Sapling/Young Tree sway at a medium pace; Mature/Old Tree — the biggest, most established stages — sway slowest and least, the way a heavier tree would move less in the same breeze than a sapling.

All of this respects `prefers-reduced-motion` like the rest of the sandbox. Verified stage-by-stage in a headless browser with zero console errors.

## Seed appearance — dimensional shading, not a flat icon

The Seed stage specifically got a pass to look and feel three-dimensional:
- A radial gradient with an offset light source (upper-left) gives it real sphere-like shading instead of a flat two-tone fill.
- A soft specular highlight (blurred via SVG `feGaussianBlur`) simulates a glossy glint.
- A subtle rim-light stroke suggests bounced light along the opposite edge.
- A separate cast-shadow ellipse breathes in sync with the seed's motion, reinforcing that it's sitting in space, not stuck to the background.
- A continuous, gentle `rotateX`/`rotateY` idle tumble (via CSS 3D transforms + `perspective`) makes it feel like a solid object rather than a static sprite — all respecting `prefers-reduced-motion`.

This same layered-shading + idle-motion approach can be extended to the other six stages if you'd like the whole tree to feel more dimensional, not just the seed.

## Onboarding + themed challenges + reset tree (latest update)

- **Choose Your Seed is now mandatory on first-ever visit** — it appears automatically before anything else, including the Daily Reward popup. There's no way to dismiss it without picking one. Once chosen, the Daily Reward popup follows right after (if not already claimed today), same as a normal return visit.
- **Challenges are now filtered by your chosen seed type**, not pulled from all eight equally:
  - Faith → Doubt, Temptation, Fear
  - Love → Loneliness, Anger, Comparison
  - Hope → Fear, Grief, Doubt
  - Peace → Anxiety, Anger, Comparison
  - Joy → Grief, Comparison, Loneliness, Anxiety
  Verified in testing — repeatedly forcing challenges while playing as "Love" only ever surfaced Loneliness/Anger/Comparison, never the other five.
- **Profile now has two distinct reset options**: "Reset Progress" (full wipe — FP, streak, tree, everything) and the new **"🔄 Reset Tree & Choose New Seed"**, which only resets tree growth (back to Seed stage, fruit cleared) while keeping FP/streak intact, then reopens the seed picker so you can grow a different path without losing your points.
- **Reset Tree confirmed to actually return to Seed stage** — verified in testing: tree progress goes to 0, the Seed SVG becomes active, and the stage label reads "Seed" immediately after resetting. Also fixed a related bug this surfaced: the reset was incorrectly firing the "🌟 Your tree grew into the Seed stage!" growth-celebration toast (backwards messaging for a reset) and could, in one path, incorrectly reopen the Daily Reward popup as if it were first-time onboarding — both are now suppressed specifically for the reset flow while still firing normally for real growth.

## Major addition: bottom nav, real content, and a values-driven Challenge system

- **Bottom navigation** (Home / Tasks / Ranking / Profile) — the game is now organized into tabs instead of one long scroll.
- **Faith Activities now require a photo upload** before claiming FP — tap an activity, attach a photo (or use "Use Sample Photo (test)" for fast testing without a real file), then claim. The Claim button stays disabled until a photo is attached.
- **Share the Gospel** is back, in its own card on the Tasks tab — it grants both FP *and* direct tree growth in one action (matching the original app's dual-effect behavior), and goes through the same photo-upload flow as the other activities.
- **Choose Your Seed** (Profile tab) — matches the original design: five spiritual-fruit themes (Faith, Love, Hope, Peace, Joy), each with its own color, icon, and verse (Matthew 17:20, 1 Corinthians 13:13, Romans 5:5, James 3:18, Galatians 5:22). Selecting one retints the canopy and fruit color live via CSS custom properties across Young/Mature/Old Tree stages.
- **Challenges are now real-life struggles, not generic events.** Instead of "a storm is coming," each Challenge is framed as something people actually face — anxiety, doubt, loneliness, anger, temptation, comparison, grief, fear — each paired with a one-line tree metaphor and a real Bible verse (KJV, public domain, quoted in full). Example: *"The wind howls and your branches shake. Anxiety can rattle you the same way — but a tree with deep roots doesn't have to fear the storm"* → Philippians 4:6. The underlying Fight/Endure/Give Up mechanics are unchanged — only the framing shown each time is new.
- **Verse of the Day** card on Home — rotates daily (deterministic by date, so it's stable all day) through a small pool of tree-themed verses (Psalm 1:3, Jeremiah 17:7-8, Matthew 7:17, and others).
- **Sample Leaderboard** (Ranking tab) — mock local data plus your real current FP, sorted together, to preview the layout.

All of this was tested end-to-end in a headless browser: tab switching, the photo-upload gate (confirm button disabled until a photo is attached), Share the Gospel's dual FP+growth reward, tree species retinting the live canopy, and the challenge popup rendering its verse — zero console errors.

## Role-based permissions, teams, and gameplay rebalance (newest update)

**1. Admin Dashboard: 4-tier permission matrix + Teams**
- **Admin**: every action available — add FP, View, Open UI, Reset Password, Delete, Reset Progress, and changing anyone's role.
- **Moderator**: everything the same *except* Reset Progress and changing roles — both are visibly disabled with a tooltip explaining why, confirmed by testing (both correctly locked when previewing as Moderator, both correctly enabled as Admin).
- **Team Leader**: a completely different view — their own team roster with a **🔔 Remind** button per member (simulated notification), plus a **Pending Join Requests** list with Approve/Decline. A "Specifically, you are: [name]" selector lets you simulate being any of the leaders in the mock data.
- **User**: a **Join a Team** view listing every Leader with a **Request to Join** button. Once requested, it shows "Requested ⏳" until the Leader approves; once approved, it shows "✓ On this team" with a **Leave Team** option. Also simulatable via a "Specifically, you are: [name]" selector.
- All four views tested end-to-end: promoting/approving/declining/leaving/requesting all update state correctly and re-render immediately.
- Also added: a **Deleted Players** section (Admin/Moderator only) so **Delete** isn't destructive — deleted players can be **Restored** — plus a read-only **View** modal for player details.

**2. Task scheduling rules**
- **Worship Attendance** can now only be logged on Sundays — locked the rest of the week with a note explaining why, verified by faking the browser's day-of-week in testing.
- **Small Group** stays once-per-week (already correct from before). **Prayer, Bible Reading, Devotion** stay daily (already correct).
- **Share the Gospel** is now hidden entirely until your tree reaches **Young Tree** stage — verified hidden at Seed, confirmed it appears once grown to Young Tree.

**3. Removed "Upgrade Roots (10 FP)"** — gameplay tending (Water/Prune/Fertilize) is now the only way to grow the tree.

**4. Tend Your Tree is now a required sequence, not a menu**
- Water → Prune → Fertilize, in that order — attempting a step out of order is blocked with a toast telling you what to do first (e.g. "Do Water first").
- All three now cost the same **10 FP** each, instead of three different costs.
- "Protect" was renamed to **Prune** (✂️) — a clearer, tending-specific word — with its own distinct animation (a quick double-pulse "snip" plus a couple of falling clippings), separate from Endure's shield-pulse.
- After Fertilize, the sequence loops back to Water so the cycle can repeat.

**5. Challenge rebalance: Endure is now truly passive**
- Endure previously handed out a free +15 growth for zero risk, quietly making it the best option in the game with none of the tension "enduring" should carry.
- Endure now costs its FP but grants **0 growth** — a true, no-gain-no-loss pass-through — leaving Fight (70%/30% risk) and Give Up (guaranteed regression) as the two mechanics with real consequences.

## Admin Dashboard: analytics + 4-tier roles (latest update)

- **Logins per day chart** — bar chart, no external library (drawn on a plain `<canvas>`), defaults to the last 7 days but has a full date-range picker (start/end date inputs + Apply) backed by ~120 days of mock daily history, so you can browse further back than a week.
- **Task completions per day chart** — a second bar chart (Daily Tasks + Challenges + Faith Activities combined per day), plus a breakdown panel below showing totals for each category over the selected range.
- **4-tier role system**: User → Moderator → Leader → Admin, replacing the old binary Player/Admin. Each player card now has a role dropdown instead of a single toggle button.
- **Only Admins can change roles** — a "Previewing as" selector at the top simulates viewing the dashboard as each tier; switching away from Admin visibly locks every role dropdown (with a real permission check in the code, not just a disabled attribute, mirroring what a real backend check would do).
- Role filter chips updated to all four tiers.

**Bug caught and fixed during testing**: the "Last 7 days" quick-range button shared a CSS class with the role-filter chips, and the role-filter's click handler was accidentally attaching itself to it too — clicking "Last 7 days" was silently wiping the entire player list (an `undefined` role matched nothing). Fixed by scoping the role-filter handler to its own container. Good reminder of why shared class names for unrelated controls are worth double-checking.

## Admin Dashboard sample (`admin.html`)

A separate page, linked from the bottom of the main game, showing what a fixed admin dashboard could look like:

- **Card-based player list instead of a wide table** — this directly fixes the original 12-column table, which cannot work on a phone-width screen. Cards reflow to 2-up on wider screens, single column on mobile.
- **A real confirm/cancel dialog for destructive actions** (Reset Player, Reset All Demo Data) — this replaces the original's broken pattern where `window.confirm()` asked the player to "type your email to confirm" but a browser confirm dialog has no text field to type into.
- **Search + role filter chips** for finding a specific player instead of scrolling a giant table.
- Stat tiles (Total Players, Admins, Avg FP, Avg Streak) in a responsive grid.

**Important:** this page uses entirely local mock data generated in the browser (`admin.js`, its own `localStorage` key) — it is **not connected** to your real Firebase users, and none of the actions here (add FP, toggle role, reset) affect anyone's real account. It exists purely so you can test the *layout and interaction pattern* before deciding whether to rebuild your real admin dashboard this way. Wiring it to real data would mean swapping the mock `makeMockUser()`/`loadState()` functions for actual Firestore reads, and re-adding your real `isAdminUser()`/role-check gating in front of the page.

## Interaction flow (updated per your request)

- Tapping the tree opens a **Tend Your Tree** popup with Water / Protect / Fertilize.
- After finishing a task, there's a **35% chance** (`CONFIG.challengeChance` in `script.js`) a Challenge event pops up on its own with a random flavor line (`CONFIG.challengeFlavors`), presenting Fight / Endure / Give Up. Resolving it returns you to the main screen.
- The player never taps into a Challenge directly — it's purely a random interruption while tending the tree, matching what you described.

## Balance — left unchanged, flagged for your decision

I did **not** rebalance the economy, since that's a design call, not a bug:
- **Water is currently the most FP-efficient action** (4 growth per FP spent), better than the "riskier" Fight (≈2.1 growth per FP). If you want Fight to feel worth the risk, its numbers need to beat the safe options — right now they don't.
- **None of the six action buttons have a cooldown**, unlike Faith Activities. This may be intentional (FP is meant to be freely spent), but it's worth deciding on purpose rather than by accident.

All costs/rewards live in one place at the top of `script.js` — the `CONFIG` object — so you can tune numbers without touching any logic.

## How to test it

1. Unzip this folder.
2. Push it to a GitHub repo (or a new branch/folder in your existing one).
3. Enable GitHub Pages for that folder, or just open `index.html` directly in a browser — it works with no server.
4. Use the **"+100 FP (test)"** and **"Reset Progress"** buttons at the bottom to speed through the full seed→fruit arc without waiting on real FP earn rates.

## Merging back into your real app

The logic in `script.js` is written to be easy to lift into your existing file:
- Replace your `handleActionButton()` body with the `runAction()` pattern here so all six actions route through one growth function.
- Copy the `applyGrowth()` function in as a replacement for the fruit-bypass issue in your `applyTreeProgress()`/direct-mutation split.
- Copy the two-layer background markup (`#bgLayerA`/`#bgLayerB`) and `setStageBackground()` function to fix the crossfade.
- The particle functions (`spawnParticles`, `spawnShieldPulse`, `spawnImpactFlash`, `spawnDroop`) are self-contained and only need the `.particle-layer` div added to your existing tree markup.
