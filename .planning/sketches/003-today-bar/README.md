---
sketch: 003
name: today-bar
question: "How should the Today's bar (time-blocked daily planner replacing the sidebar) look, and how should scheduled/empty/done/drag-over slots read?"
winner: "A"
tags: [today, schedule, planner, sidebar, drag-drop, desktop]
---

# Sketch 003: Today's bar

## Design Question
Replace the desktop left sidebar with a time-blocked "Today" planner (8:00 AM–11:00 PM, 30-min slots). Drag a task from the 3×3 grid into a slot to schedule it. What slot layout reads best, and how do empty / filled / done / drag-over states look?

## How to View
open .planning/sketches/003-today-bar/index.html  (?v=a|b, ?t=dark)

## Variants
- **A: time gutter (WINNER ★)** — time fixed on the left, task chip fills the 30-min lane. Calendar-like; times scan fast; empty lanes are clear drop targets.
- **B: stacked** — time label above each chip. More agenda-like but wastes vertical height and empty slots look like bare lines (weak drop affordance).

## Locked design
- Sidebar BECOMES the Today's bar; category pills move to a row between the top bar and the 3×3 grid; Board/List stays the top-bar view toggle; brand sits atop the Today's bar.
- Slots `flex:1 1 0` fill the sidebar height (no scroll) with ~22px min-height; scroll only as a fallback on very short screens. Time labels are one line (white-space:nowrap, 64px gutter).
- Today only (header "Today, <date>"); data stored per-date.
- Drag task from a grid cell → drop on a slot to schedule. Occupied slot → replace, evict previous to unscheduled. Relocate by dragging the chip; unschedule via ✕ on hover.
- One task ↔ at most one slot. Slot renders the LIVE task object → edits/status/delete reflect in both grid and bar. Done task stays, shown strikethrough. Deleted task → slot auto-clears (dangling id skipped).
- Storage: `state.schedule = { "YYYY-MM-DD": { "08:00": taskId } }` in Supabase auth user_metadata (localStorage mirror). NO schema migration. **Existing task rows are never modified** — scheduling only stores id references.
- Desktop-only this phase (sidebar hidden on mobile); mobile tap-to-assign deferred.
