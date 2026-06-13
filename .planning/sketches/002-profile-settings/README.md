---
sketch: 002
name: profile-settings
question: "How should the top-bar profile menu, Profile modal, and Settings modal look — and which Settings layout reads best?"
winner: "B"
tags: [profile, settings, modal, top-bar, flat]
---

# Sketch 002: Profile & Settings

## Design Question
Desktop top bar gains a one-tap theme toggle (moved from sidebar) and a profile-icon menu (Profile / Settings / Sign out). Profile and Settings open as modals. Which Settings layout reads best?

## How to View
open .planning/sketches/002-profile-settings/index.html
(?show=menu|profile|settings, ?v=a|b, ?t=dark)

## Variants (Settings layout)
- **A: cards** — each section in a bordered card. Strong grouping but a box-in-modal feels heavy.
- **B: flat (WINNER ★)** — colored section headers + underline, no inner boxes. Lighter, scannable, matches the clean-flat board direction.

## Locked design
- Top bar (desktop) right cluster: mobile toggle · one-tap theme (sun/moon) · Add Task · profile avatar.
- Profile menu (dropdown): name+email header, Profile, Settings, Sign out (danger).
- Profile modal: avatar (colored initials + color dots) · display name · email (read-only) · timezone. Save → user_metadata.
- Settings modal (flat, 4 sections): Preferences (theme 3-way / default view / default priority), Display (week start / date format / density), Behavior (confirm-delete / show-completed), Account & data (change password / export / import / sign out / delete[deferred]).
- Mobile: same Profile/Settings reached via the avatar popover (extended to Profile/Settings/Sign out); modals become bottom sheets.
