# Growing Seed — Gameplay Sandbox

A standalone, no-setup version of the core Growing Seed gameplay loop, built for testing mechanics and animations on GitHub Pages without needing your Firebase project. Progress saves to `localStorage` in the visitor's own browser — there's no login, no backend, no shared data.

## Admin Dashboard: custom FP amounts, chart fix, Super Admin tier, manual events (latest update)

**1. Custom FP amount modal** — the "+FP" button now opens a small modal with a number input (defaults to 50, but editable to anything) instead of always adding a fixed +50.

**2. Fixed chart overflow with large date ranges** — picking a big range (e.g. 3+ months) previously forced bars into a fixed minimum width that pushed the chart wider than its container, so the date labels underneath got clipped by the card's rounded border. Fixed by making the bar gap scale down as the number of days grows, and by reserving proper bottom padding for labels. Verified with a 99-day range: bars now fill the container width proportionally and labels sit cleanly inside the card.

**3. New Super Admin tier, with two permanently-locked accounts** — `endlesssh0014@gmail.com` and `endlessnogu@gmail.com` are seeded as Super Admin and **cannot have their role changed by anyone**, including other Super Admins — enforced both by disabling their role dropdown in the UI and with a hard guard inside `updateRole()` itself (verified this holds even when calling `updateRole()` directly from the browser console, bypassing the UI entirely). Every other Admin's role **can** be changed — but only by a Super Admin now.

   **Current permission matrix** (also shown live under "Previewing as" in the dashboard):
   | Action | Super Admin | Admin | Moderator |
   |---|---|---|---|
   | Add FP | ✅ | ✅ | ✅ |
   | View player | ✅ | ✅ | ✅ |
   | Open UI (impersonate) | ✅ | ✅ | ✅ |
   | Reset Password | ✅ | ✅ | ✅ |
   | Delete / Restore player | ✅ | ✅ | ✅ |
   | Reset Progress | ✅ | ✅ | ❌ |
   | **Change roles** | ✅ | ❌ | ❌ |
   | **Activate/deactivate seasonal events** | ✅ | ❌ | ❌ |

   Leader and User get their own separate views (My Team / Join a Team) rather than the player-management list at all.

**4. Seasonal events are now Super-Admin-activated, not automatic** — "Growth Sprint Week" no longer turns on by date. A Super Admin activates it from a new "🌟 Seasonal Events" card, choosing a duration in hours or days; it automatically expires and turns itself off when that time is up (or a Super Admin can deactivate it early). This is stored in its own shared `localStorage` key so the actual game (a separate page) picks it up immediately — verified end-to-end: no event banner in the game before activation, the banner and +25% growth bonus appear in the game right after a Super Admin activates it, and both disappear again after deactivating.

## Branding, header cleanup, and permanent email lock

1. **Real logos in the header** — replaced the placeholder shield emoji with your actual ABCF and Pulse logos (in `assets/`), shown next to a static "Growing Seed" wordmark, matching your reference image.
2. **Custom tree name moved out of the header** — since the header now carries your real branding, a custom tree name (e.g. "Endless") displays in the **Seed Growth card** instead, and only when one is actually set (hidden otherwise).
3. **The branded header no longer shows on the Profile tab** — Profile has its own identity block (Name/Email/Date Joined), so repeating the big green banner there was redundant. It reappears normally on Home/Tasks/Ranking.
4. **Email is now permanently locked after the first save** — no edits at all afterward (unlike Profile Name, which still allows exactly one change). Verified: input and Save button both disable immediately after the first save, with a clear "🔒 Locked — email cannot be changed once set" message.

## Ranking economy fix + real Team create/join flow (latest update)

1. **FP for ranking is now lifetime-earned, not current spendable balance.** Previously ranking used `state.faithPoints` directly — since that number drops every time you tend your tree or resolve a challenge, an active/engaged player could rank *below* someone who just hoarded FP and never played. Added `state.totalFpEarned`, a cumulative counter that only goes up, routed through a single `earnFp()` helper used by every real FP source (daily login, Faith Activities, Share the Gospel). The test-only "+100 FP" button deliberately does **not** count toward it, so testing doesn't inflate your rank.
2. **Ranking now shows both FP and Tree Progress** per row, not just FP.
3. **Fixed a regressed bug**: the Endure button in the actual live Challenge popup had reverted back to showing "+15" (stale from before the passive-hold rebalance) during an earlier unrelated HTML restructure. Now correctly shows "+0 growth" and matches the result message.
4. **Built a real Create/Join Team flow** in the game itself (Ranking tab → My Team), since previously "My Team" only showed fixed sample data with no way to actually join or create one:
   - **Create a Team** costs 500 FP, prompts for a team name, and makes you its leader
   - **Join a Team** lists sample existing teams, free to join
   - **Leave Team** returns you to the no-team state, where you can create or join again
   - Verified end-to-end: blocked with a clear message when short on FP, deducts exactly 500 FP on success, leader tag shows correctly, and leaving/rejoining both work.

## Profile restructure + explicit Save buttons + Reset Tree cost (latest update)

1. **Explicit Save buttons everywhere** — Profile Name, Email, and Tree Name no longer rely on a hidden `change`-on-blur event with no visible confirmation moment. Each field now has its own **Save** button that only commits and locks on click.
2. **Profile tab restructured** — removed the redundant "Your Progress" stats card (FP/Streak/Fruit were already visible in the header on every screen). In its place, a proper **Profile card**: Name, Email, and **Date Joined** (captured automatically the first time the sandbox ever loads in that browser).
3. **Reset Tree now costs 1000 FP** — verified both directions: blocked with a clear "costs 1000 FP — you have X" toast when short, and correctly deducts exactly 1000 FP and proceeds when affordable.

## Six engagement features for youth (latest update)

All six suggestions built and tested end-to-end (details below). One honest note on process: I initially wrote all the JavaScript logic before wiring up the matching HTML elements, which meant the game briefly threw a runtime error (`Cannot read properties of null`) since the JS referenced elements that didn't exist yet. Caught this immediately with a headless-browser load check before going further, then finished the HTML/CSS and retested — worth mentioning since it's exactly the kind of thing that's easy to miss without testing.

**1. My Team (in-game, not just admin)**
- New "My Team" view in the Ranking tab (toggle between "Individual" and "My Team")
- Shows your team roster (name, stage, streak), a **team activity feed** with tap-only reactions (🔥 🙏 👏 — no comments, keeps it simple and safe for youth), and a **weekly team-vs-team battle** ranked by fruit collected
- Reactions persist across reloads (verified)

**2. Sound + haptic feedback**
- Built with the Web Audio API — no sound files, works fully offline. Distinct tones for: button tap, FP gain, growth success, stage-up (plus haptic buzz), fruit gained (plus haptic buzz), a failed challenge, and badge unlocks
- One toggle in Profile controls both sound and vibration
- Verified the toggle actually flips state and that sounds fire on the right events

**3. Badges / achievements**
- 7 badges: 7-Day Streak, First Fruit, Basketful (5 fruit), Full Bloom (Old Tree), Every Seed (try all 5 seed types), Steadfast (survive 10 challenges), Voice of Faith (share the Gospel 5 times)
- Checked automatically after every game action; unlocking one plays a sound + shows a toast
- Tap any unlocked badge to pin its icon next to your tree's name in the header

**4. Team vs. team competition (weekly)**
- Part of the "My Team" ranking view — three sample teams ranked by fruit collected this week, your team's total updates live as you collect fruit

**5. Seasonal / limited-time events**
- A `CONFIG.events` list with start/end dates — an active event shows a banner on Home and applies a growth bonus (currently a sample "🌟 Growth Sprint Week," +25% growth from tending, July 1–14) automatically while it's running
- Verified the bonus actually applies: a base +20 Water action correctly became +25 during the event window, and the result popup notes "(event bonus applied)"
- Adding a new seasonal event later is just one more entry in that list — nothing else needs to change

**6. Personalization**
- Name your tree (shows in the header, replacing "Growing Seed")
- Unlocked badges can be pinned as a small sticker next to that name

## FP economy & growth curve: checked and rebalanced against a 1-month arc

Ran a Monte Carlo simulation (500 runs) of a consistent daily player — logging in every day, doing all daily/weekly Faith Activities, and tending the tree whenever they had FP — against the actual game numbers.

**What the original numbers produced:** full bloom (Old Tree) reached by **day ~16 on average**, with **17 fruit already collected by day 30**. A consistent player finished the entire growth arc in about half a month, leaving the back half of the month as idle fruit-farming with nothing new to reach for.

**The fix:** scaled all seven stage thresholds by 1.5× (Seed 0 · Germination 75 · Seedling 225 · Sapling 525 · Young Tree 900 · Mature Tree 1500 · Old Tree 2250) — no cost, reward, or FP-income numbers changed, only the distance to travel.

**Result, re-verified against both the simulation and the actual game code:**
- A consistent daily player now reaches Old Tree around **day 21–25** (the exact day varies with random Challenge interruptions and Fight's 70/30 odds), with the first fruit shortly after and roughly **7–11 fruit banked by day 30** — a satisfying "reached full bloom and started the harvest" arc that uses the whole month rather than half of it.
- A casual player who misses ~30% of days lands mostly at Mature Tree/Young Tree by day 30, with only ~10% reaching Old Tree in-month — meaning consistency is meaningfully rewarded without punishing casual players into stalling at Seed/Germination.
- Verified stage-by-stage that every threshold boundary (75/225/525/900/1500/2250) correctly triggers the right stage name in the actual running game.

If you'd like the pacing tuned further (e.g., faster/slower, or specifically tuned around your actual expected daily-active-user FP income rather than this simulation's assumptions), the thresholds are the only numbers that need touching — `CONFIG.stages` and `CONFIG.fullBloomThreshold` in `script.js`.

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
