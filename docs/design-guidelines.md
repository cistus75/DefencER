# DefencER Design Guidelines

This document records the UI direction used for DefencER so future changes stay visually consistent.

The rules are adapted from the `redesign-existing-projects` audit in Leonxlnx/taste-skill. Marketing-page-only guidance such as AIDA page structure, random hero layouts, and GSAP-heavy scrolling is intentionally excluded because DefencER is a fixed game HUD.

## Core direction

- The visual target is a cold, heavy research-facility interior inspired by Eternal Return laboratory spaces.
- The interface should feel like a game HUD attached to a facility, not a generic SaaS dashboard.
- Prefer restrained industrial surfaces over glowing sci-fi decoration.
- Preserve the current left rules / center battlefield / right battle-info structure unless gameplay requirements change.

## Palette

- Use one primary UI accent: muted cyan-blue.
- Keep all neutral surfaces in one cool blue-gray family.
- Orange is reserved for battlefield route guidance.
- Gold is reserved for credits.
- Red and purple are semantic enemy/gameplay colors, not general UI accents.
- Avoid saturated cyan, purple-blue gradients, and multi-color neon outlines.

## Surfaces and lighting

- Use tinted dark navy shadows rather than generic transparent black shadows when possible.
- Keep a consistent light direction: subtle cool highlight from the upper edge, deeper shadow below.
- Prefer off-black navy backgrounds over pure black.
- Add very subtle texture or micro-patterns to avoid flat vector surfaces.
- Borders should be hairlines and low-contrast. Do not outline every object with bright cyan.

## Typography

- Pretendard remains the primary Korean UI font.
- Use medium/semi-bold weights for hierarchy instead of only regular/bold.
- Large data values use tabular figures.
- Large labels use slightly tighter tracking; small English labels may use slightly wider tracking.
- Keep copy concise. Avoid verbose helper text where the UI already communicates the state.

## Layout and spacing

- Prefer CSS Grid for major screen regions.
- Maintain clear shared baselines between adjacent HUD elements.
- Mathematical centering may be optically corrected by 1-2 px if needed.
- Do not add decorative cards simply to fill space.
- The center battlefield owns visual priority; side panels should remain quieter.

## Interaction

- Every interactive control needs hover, pressed, and keyboard focus feedback.
- Use transform/opacity for motion rather than layout-changing properties.
- Keep transitions around 180-250 ms and visually weighty rather than bouncy.
- Game state colors should not depend on glow alone; preserve shape and contrast cues.

## Anti-patterns

Avoid these unless a concrete gameplay requirement calls for them:

- bright cyan borders on every panel
- purple/blue AI-style gradients
- multiple unrelated accent colors
- excessive glow and bloom
- generic dashboard cards with border + shadow + gradient on every surface
- random decorative icons with no gameplay meaning
- unnecessary English meta labels or filler copy
- large empty regions filled only with abstract neon shapes

## Review order

When polishing a screen, review in this order:

1. palette consistency
2. information hierarchy
3. spacing and alignment
4. interactive states
5. battlefield readability
6. final typography and micro-detail polish
