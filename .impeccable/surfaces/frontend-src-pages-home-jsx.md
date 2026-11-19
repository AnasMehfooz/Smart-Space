---
version: 1
slug: "frontend-src-pages-home-jsx"
primary_target: "frontend/src/pages/Home.jsx"
related_targets: ["frontend/src/pages/onboarding/Onboarding.jsx"]
---

# Home (desktop app main window)

Scope: the Home window and, through shared tokens, onboarding. Mode: Operate.
Audience: students and young professionals finding files and answers in their own folder, offline.
Task: see the folder's files, know whether scanning is done, open a file, ask the chat and jump to the cited file.
Constraints: fixed 3-column layout (sidebar · files · chat); dark theme; minimal, professional, a hint of a file manager; window 1200×800, min 900×600; demo on a projector.
Memorable moment: a chat answer whose cited facts are marked like highlighter on a page, each mark leading to its file.

## Direction contract

THESIS: The folder reads like pages the user already marked up: highlighter ink appears only where something matters (the open folder, the selected file, a cited fact, scan done). Refuses the category default of grey cards with one glowing accent.

OWN-WORLD: Matte graphite ground (#15171b) and warm paper-white ink, hairline rules instead of cards or shadows. Four flat highlighter inks with fixed jobs: yellow = selected / cited, green = done, pink = removed or failed, blue = in progress. Marks are skewed, slightly uneven swipes behind text, never glows. Geist, tabular figures for counts.

STORY: The visitor sees every file in one line with what it is, sees "Scanning completed", asks a question, and the answer's facts are highlighted with numbered sources; one click lands on the file, a double-click opens it.

FIRST VIEWPORT: Left 280px margin index: logo, folder tree with counts, scan status at the bottom. Centre: breadcrumb then hairline-ruled one-line rows (icon · name · description · ⋯). Right 400px: "Ask your files", messages, input pinned at the bottom (primary action).

FORM: Highlighter Ink, candidate 6 of my grounded list (assigned by the roll). seed:c32260bb0dfad9c7

SIGNATURE: the highlighter swipe, drawn once on selection and on each cited sentence as it streams in (a short left-to-right wipe), static under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 2026-11-19, finish review: at the 900×600 minimum window the description column shows about three words. The user accepted this as is ("Accept as is"); no hover or stacked fallback. 1200×800 and 1440×900 have no open findings.
