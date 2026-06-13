# Skills — Checkmate

Tooling and agent skills relevant to working in this repo. This project has **no build
system and no test framework** — "skills" here means the workflows and external tools
used to develop, verify, and ship it, plus the agent skills that fit this codebase.

## Project commands (the only real "tooling")

| Task | Command |
|------|---------|
| Local test server | `python -m http.server 8181` |
| JS syntax check | `node --check app.js` |
| Headless UI screenshot | `chrome.exe --headless=new --screenshot --window-size=1366,900 http://localhost:8181/_previewN.html` |
| Deploy | `git push origin main` (Vercel auto-deploys) |

There is no `npm install`, no bundler, no linter config, no unit tests. Verification is
manual/headless against throwaway `_previewN.html` files (the auth gate blocks the real
app headlessly).

## Verification workflow (do this for every UI change)

1. `node --check app.js` after any JS edit.
2. Create a `_previewN.html` mirroring the real markup/CSS for the changed component.
3. Screenshot headless at the relevant widths (light + dark). Known quirk: a ~484px
   layout viewport renders at a ~402px window — screenshot mobile previews at 402px.
4. Clean up `_preview*.html` + screenshot PNGs when done.

## Relevant agent skills

When an agent assists on this repo, these skills map well to its work:

- **gen-architecture** — regenerate `architecture.excalidraw` from the codebase.
- **ui-ux-pro-max** — UI/UX design intelligence (styles, palettes, layout, a11y) for
  the board, sidebar, modals, and mobile surfaces.
- **gsd:sketch** — throwaway HTML mockups in `.planning/sketches/` (2–3 variants, pick a
  winner) before implementing a design change.
- **gsd:writing-plans / docs/superpowers/plans/** — write an implementation plan per
  feature before coding.
- **code-review** / **simplify** — review the current diff for bugs (code-review) or
  apply reuse/simplification/efficiency cleanups (simplify).
- **verify** / **run** — launch and drive the static app to confirm a change works.
- **caveman** — compressed communication mode (active in this session).

## Design-task process (when asked for design/redesign work)

Apply in order: brainstorm (clarifying questions one at a time) → `ui-ux-pro-max` →
`gsd:sketch` (variants in `.planning/sketches/`, pick a winner) → write a plan in
`docs/superpowers/plans/` → implement → verify headlessly. Always state which option is
recommended and why; confirm after each logical step unless told "all at once".

## What NOT to reach for

- No test runner — don't scaffold Jest/Vitest/Playwright; verification is headless
  screenshots.
- No framework migration — vanilla JS is a deliberate constraint.
- No build step — don't add bundlers, transpilers, or `package.json` scripts.

See [`Agents.md`](../../Agents.md) for the full working rules.
