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
