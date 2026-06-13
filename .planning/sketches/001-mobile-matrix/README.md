---
sketch: 001
name: mobile-matrix
question: "How should the mobile 3x3 status×priority count-grid look, and how should drilling into a cell feel?"
winner: "B"
tags: [mobile, board, matrix, flat, light]
---

# Sketch 001: Mobile Matrix Grid

## Design Question
On mobile, the board defaults to a 3×3 grid of count-tiles (rows High/Med/Low × cols To Do/In Progress/Done). Tapping a tile drills into a full-screen list of just that intersection's tasks. What tile style reads best, and does the drill-in + title-first quick-add flow feel right?

## How to View
open .planning/sketches/001-mobile-matrix/index.html
(tabs switch variants; ?v=a|b|c, ?t=dark, ?drill=1, ?sheet=1 for direct states)

## Variants
- **A: color-block** — priority-tinted tiles, big colored counts. Playful, colorful; lower count contrast.
- **B: minimal accent (WINNER ★)** — white tiles, thin priority color bar on top, dark high-contrast counts. Clean flat-light, best readability.
- **C: compact dot** — small single-row tiles (dot + count). Most compact; drops status sub-label, feels sparse.

## Winner & Rationale
**B.** Color as accent (not fill) matches the clean-flat/light direction; dark counts give strongest contrast/accessibility; calm at a glance. Drill-in (back arrow + contextual "+ Add to Pri·Status") and title-first quick-add sheet (default chips + More + Save) both validated.

## Locked design decisions
- Centered ~400px column (no bezel) for the in-app desktop/mobile toggle.
- Top bar: brand · sun/moon theme · desktop/mobile toggle · avatar.
- Category chips row filters grid counts.
- Bottom nav: Board (grid) · ⊕ Add · List.
- Tile = white, top priority-color accent bar (4px), dark count, status sub-label.
- Tap tile → full-screen list; contextual add prefills that cell's status+priority.
