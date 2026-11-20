---
name: Smart Space
description: Find files by meaning and ask questions about one local folder; dark, minimal, a hint of a file manager.
colors:
  graphite-ground: "#15171b"
  paper-white: "#e8e5dd"
  paper-bright: "#f3f0e8"
  muted-paper: "#9c988f"
  placeholder-paper: "#8a867e"
  hairline: "#33373e"
  input-edge: "#40444c"
  row-hover: "#1b1e23"
  surface-card: "#1a1c21"
  surface-popover: "#1d2025"
  surface-muted: "#1f2227"
  surface-raised: "#23262c"
  scrollbar-thumb: "#34373e"
  ink-yellow: "#efdf5a"
  ink-green: "#86d39a"
  ink-pink: "#ef93ad"
  ink-blue: "#86c3ea"
  ink-on: "#15171b"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body-answer:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  file-name:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  small:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    fontFeature: "\"tnum\""
  citation:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    fontFeature: "\"tnum\""
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  full: "999px"
spacing:
  hair: "6px"
  row-y: "8px"
  row-x: "12px"
  row-gap: "14px"
  panel: "20px"
  page: "24px"
  header: "4.25rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.ink-on}"
    typography: "{typography.file-name}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 10px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.graphite-ground}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 10px"
  button-ghost:
    textColor: "{colors.muted-paper}"
    rounded: "{rounded.lg}"
    height: "1.75rem"
    padding: "0 10px"
  mark:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.ink-on}"
    padding: "0 0.32em"
  mark-done:
    backgroundColor: "{colors.ink-green}"
    textColor: "{colors.ink-on}"
    padding: "0 0.32em"
  file-row:
    textColor: "{colors.paper-white}"
    typography: "{typography.file-name}"
    padding: "{spacing.row-y} {spacing.row-x}"
  file-row-hover:
    backgroundColor: "{colors.row-hover}"
  chat-composer:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "8px"
  chat-composer-focus:
    backgroundColor: "{colors.surface-popover}"
  user-message:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper-white}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  source-chip:
    textColor: "{colors.paper-white}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  cite:
    textColor: "{colors.ink-yellow}"
    typography: "{typography.citation}"
    rounded: "{rounded.sm}"
    height: "1.1rem"
    padding: "0 0.28rem"
  cite-hover:
    backgroundColor: "{colors.ink-yellow}"
    textColor: "{colors.ink-on}"
  switch-off:
    backgroundColor: "{colors.input-edge}"
    rounded: "{rounded.full}"
    width: "1.75rem"
    height: "1rem"
  switch-on:
    backgroundColor: "{colors.ink-yellow}"
  segmented-selected:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper-white}"
  kbd:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper-white}"
    height: "1.25rem"
    padding: "0 0.35rem"
  tour-card:
    backgroundColor: "{colors.surface-popover}"
    rounded: "{rounded.xl}"
    width: "20rem"
    padding: "1rem 1rem 0.75rem"
  quick-search:
    backgroundColor: "{colors.surface-popover}"
  sidebar:
    backgroundColor: "{colors.graphite-ground}"
    width: "clamp(13.5rem, 19.5vw, 17.5rem)"
  chat-panel:
    backgroundColor: "{colors.graphite-ground}"
    width: "clamp(18rem, 29vw, 25rem)"
---

# Design System: Smart Space

<!-- Recorded from the shipped Home build (frontend/src/index.css and components), merged with its extension to Settings, Privacy, Onboarding, the tour, the first-close dialog and quick search. The North Star and descriptive names come from the direction contract; they were not separately confirmed in a naming interview. Dark only: no light theme exists. -->

## Overview

**Creative North Star: "Highlighter Ink"**

The folder reads like pages the user has already marked up. Everything sits on a matte graphite ground in warm paper-white type, separated by hairline rules rather than cards or shadows. Colour is almost absent until something matters: the open folder, the selected file, a cited fact in a chat answer, a finished scan. Then a flat highlighter swipe is drawn behind the words, the way a student marks a printout.

Density is that of a calm file manager: one file per line, a margin index on the left, a reading column for answers on the right. The interface frames the user's files and stays out of the way; motion is limited to short state changes, the one wipe of the highlighter, and the first-time tour's spotlight gliding on the same curve. The system deliberately refuses the category default of grey cards with one glowing accent: inks are flat, never glows, and each ink has exactly one job.

Coverage: this system was set by the Home window (sidebar, file list, chat) and then extended, on the same grammar, to Onboarding, the Settings and Privacy pages, the first-time tour, the first-close dialog and the quick-search widget. Onboarding no longer uses card containers or a yellow-filled step indicator. There is no light theme; every value here is the dark theme.

**Key Characteristics:**
- Matte graphite ground, warm paper-white text, hairline rules for structure.
- Four flat highlighter inks, each bound to a single meaning.
- The highlighter swipe (`.mark`) is the signature: drawn shape, slanted ragged ends, wiped in left to right.
- One-line ruled file rows; no file cards.
- Geist throughout, tabular figures for every count.
- Flat: no shadows on the ground; depth only for floating menus and dialogs.

## Colors

A near-monochrome graphite and paper palette, with four highlighter inks held in reserve for meaning.

### Primary
- **Highlighter Yellow** (`ink-yellow`): the selected / cited ink. The swipe behind the open folder, the selected file name and every cited fact in a chat answer; the citation numerals; the primary (Send) button when there is text to send; the caret; the focus outline. The same "selected" meaning carries to the open page in the Settings / Privacy index, the current onboarding step, the active quick-search row and a switch that is on. Text on it is Graphite Ground (`ink-on`).

### Secondary
- **Highlighter Green** (`ink-green`): done. The "Scanning completed" swipe and check icon, the status dot of an indexed file in the folder tree, and the check on a finished onboarding step.
- **Highlighter Blue** (`ink-blue`): in progress. The scan and model-download progress bars (both set `--progress-ink` to blue), spinners, pending (at 60%) and processing (pulsing) status dots, and, tinted to 38%, text selection.

### Tertiary
- **Highlighter Pink** (`ink-pink`): removed or failed. The destructive token: error text, the error status dot, the notice bar's border (at 40%), the "Remove from Smart Space" menu item, and the confirm button of every destructive dialog (remove, switch folder, delete data).

### Neutral
- **Graphite Ground** (`graphite-ground`): page, sidebar and chat background; also the text colour on any ink.
- **Paper White** (`paper-white`): all primary text. **Paper Bright** (`paper-bright`) is the hovered/focused menu item text.
- **Muted Paper** (`muted-paper`): descriptions, labels, column headers, counts, icons, secondary breadcrumb segments. **Placeholder Paper** (`placeholder-paper`) for input placeholders.
- **Hairline** (`hairline`): every rule and border: row dividers, panel edges, the tree's child rule, source chips, the progress track. Set one step lighter than the first build so hairlines survive a projector.
- **Input Edge** (`input-edge`): the brighter border used on hover for chips and example questions, for outline buttons, and as the track of a switch that is off. Lifted with the hairline to keep its step above it.
- **Row Hover** (`row-hover`): the only hover fill on file rows and tree rows.
- **Surface Card / Popover / Muted / Raised** (`surface-card`, `surface-popover`, `surface-muted`, `surface-raised`): four close graphite steps. Card is the chat composer at rest; Popover is menus, dialogs, the focused composer, the tour card and the whole quick-search window; Raised is the user's chat bubble, secondary buttons, keyboard keys and the chosen option of a segmented control; Muted is ghost-hover and dialog footers.
- **Scrollbar Thumb** (`scrollbar-thumb`): thin graphite scrollbars, 10px track with a 3px ground-coloured border so the thumb floats.

### Named Rules
**The One Job Rule.** Each ink means one thing everywhere: yellow = selected / cited, green = done, pink = removed / failed, blue = in progress. Never use an ink for decoration, branding a section, or a meaning outside its job.

**The Earned Ink Rule.** Ink appears only where something matters right now. At rest a screen is graphite and paper; if a viewport shows more than a handful of marks, something is marked that should not be.

**The No Dimmed Ink Rule.** A control that is unavailable falls back to plain graphite, never to a faded ink. The empty Send button is secondary graphite with muted text, and turns yellow only when there is something to send.

**The Selection Is Not A Mark Rule.** Text selection is blue-tinted graphite (`ink-blue` at 38%) with paper-white text, so the user's own selection can never be mistaken for a highlighter mark.

## Typography

**Display Font:** Geist Variable (with system-ui, sans-serif)
**Body Font:** Geist Variable (with system-ui, sans-serif)
**Label/Mono Font:** none distinct; Geist with tabular figures

**Character:** A single neutral grotesque, tightened slightly at title sizes, with stylistic set 01 and character variant 11 on globally (`font-feature-settings: "ss01", "cv11"`). Hierarchy comes from weight and colour (paper vs. muted) more than from size; the ramp is narrow on purpose.

### Hierarchy
- **Display** (600, 1.875rem, -0.02em): the wordmark on the onboarding welcome screen only. The welcome headline beside it is the same size (30px, -0.025em).
- **Headline** (600, 22px, -0.02em): the page title of Settings and Privacy. Onboarding step titles use the same treatment at 24px.
- **Title** (600, 15px, -0.01em): the current breadcrumb segment, the "Ask your files" heading, the sidebar wordmark, section headings on Settings / Privacy, the tour card's title.
- **Body / Answer** (400, 15px, line-height 1.65): assistant answers in the chat, which are read as prose and carry the marks.
- **Body** (400, 0.875rem, line-height 1.625): chat intro, user messages, file descriptions, tree rows.
- **File Name** (500, 0.875rem): file names in rows and the scan-status title.
- **Small** (400, 13px): source chips, the "Possibly related files" label, the sample source on the welcome screen.
- **Label** (400, 0.75rem, tabular figures): column headers, "Folders", folder counts, scan meta, the tour's "1 of 3", keyboard keys (12px).
- **Citation** (600, 12px, tabular figures, Highlighter Yellow): the numbered source after a cited fact, set in a small outlined tab rather than as a superscript (see Chat).

### Named Rules
**The Tabular Count Rule.** Every number that counts or measures (file totals, folder counts, indexed / unreadable counts, citation numerals, ETA) uses tabular figures.

**The Weight Not Size Rule.** Distinguish levels with weight (400 / 500 / 600) and paper vs. muted colour. No size above 15px appears inside the Home window.

## Layout

A fixed three-column window: a left margin index, a flexible file list, a right chat column. The window is 1200×800 by default with a 900×600 minimum, so the side columns flex with `clamp()` rather than breaking:

- **Sidebar (margin index):** `clamp(13.5rem, 19.5vw, 17.5rem)` (216–280px). Logo at top (20px inset, 24px below), the folder tree scrolling in the middle, then pinned at the bottom: a hairline, the scan status, another hairline, and two muted links side by side, Settings and Privacy (icon + Body text, md corners, Muted fill and paper text on hover).
- **File list (centre):** flexible, 24px side gutters. A 4.25rem header row holds the breadcrumb; the list scrolls beneath it.
- **Chat (right):** `clamp(18rem, 29vw, 25rem)` (288–400px), hairline on its left edge. Same 4.25rem header ("Ask your files", New chat), messages scroll with 24px between them, the composer is pinned at the bottom as the primary action.

The two headers share the 4.25rem height so the breadcrumb and chat title sit on one line across the window.

File rows are a four-column grid: icon (1rem) · name (1fr) · description (1.1fr) · actions (1.75rem), 14px gaps, 8px × 12px padding. The list is a size container; below 32rem wide the name column gets a 9rem floor (minmax(9rem, 1.4fr) against 1fr) and gaps tighten to 10px, so names stay readable when the window is narrow. "Can't be read" descriptions put the reason first so it survives truncation.

Spacing rhythm: 6px between chips and small items, 8px row padding, 12–14px inside rows, 20px panel insets (sidebar, chat), 24px page gutters and message spacing.

**Settings and Privacy** keep the same margin index (same width, logo at the same inset) with page navigation in place of the folder tree, and put their content in one centred reading column, max 46rem wide, 32px side padding, 40px above the title. Sections are 40px apart; each is a run of hairline-ruled rows (title and description left, value or controls right, 14px vertical padding).

**Onboarding** is a single centred column, max 34rem, under a header row that holds the logo and the step indicator (hidden on the welcome screen).

**Short windows.** A `short` variant (`max-height: 640px`, i.e. the 900×600 minimum) tightens vertical spacing on onboarding so the primary action stays above the fold.

**Quick search** is its own small window that sizes itself to its content: a 3.5rem search line, up to six result rows, a hint line of keys at the foot.

## Elevation & Depth

The system is flat. The ground, the sidebar, the file list and the chat carry no shadows; structure is drawn with 1px hairlines and with four close graphite surface steps. Hover is a fill change (`row-hover`), focus is an outline, selection is a mark: none of them lift.

Depth exists only for layers that genuinely float above the window: the file actions menu, the confirmation dialogs, and the tour card. These use the Popover surface with a 1px paper-white ring at 10% opacity; the menu also carries a small ambient shadow inherited from the component library, and the tour card a softer, deeper one because it sits over a dimmed window. The quick-search widget floats above other apps, so its whole window is the Popover surface.

### Shadow Vocabulary
- **Floating menu** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` plus a 1px ring of `paper-white` at 10%): dropdown menus only.
- **Tour card** (`box-shadow: 0 0 0 1px` paper-white at 10%, `0 8px 24px -6px rgb(0 0 0 / 0.45)`): the tour's card only.
- **Tour scrim** (`box-shadow: 0 0 0 9999px rgb(10 11 13 / 0.62)` around the spotlight, plus a 1px outline of paper-white at 22%): dims everything except the part of Home being explained. It is a cut-out, not a lift.

### Named Rules
**The Hairline Not Shadow Rule.** Separate things with a 1px Hairline rule. A shadow is reserved for something floating above the window; nothing that sits in the page gets one.

## Shapes

Gently rounded, small radii from one base (`--radius: 0.5rem`): md (0.4rem) for source chips, example questions, menu items and the notice bar; lg (0.5rem) for buttons and menus; xl (0.7rem) for the chat composer, the user's message bubble (with a tighter 0.3rem bottom-right corner so it points to its side) and dialogs; full for status dots and scrollbar thumbs.

File rows and the file list have no corners at all: they are ruled lines, not containers.

The one irregular shape is the highlighter itself. The swipe is a drawn SVG path with slanted, slightly uneven ends and a belly that sits a little below the cap height. The logo echoes it: a yellow tile rotated -3° with four different corner radii (0.35rem 0.7rem 0.4rem 0.6rem). The app icon is the same tile at 1024px, tilted -3° with the same uneven corners, carrying the folder-and-magnifier glyph in Graphite Ground strokes.

Small controls added later stay on the same scale: the citation tab and keyboard keys use tight corners (0.3rem and 0.25rem), switches are full pills, segmented controls are lg with their inner options 2px tighter, the tour spotlight is xl.

## Components

### The Highlighter Mark (signature)
A flat highlighter swipe behind text, drawn once.
- **Shape:** one SVG path per ink (yellow, green, pink, blue; an SVG background cannot read a CSS variable), stretched to each line fragment at 100% × 92%, positioned at 78% vertically, 0.32em horizontal padding. `box-decoration-break: clone` keeps every wrapped line correctly swiped.
- **Colour:** ink behind Graphite Ground text (`ink-on`). Default is yellow; `.mark--green`, `.mark--pink`, `.mark--blue` switch ink.
- **Motion:** wipes in left to right, 420ms, `cubic-bezier(0.16, 1, 0.3, 1)`, by growing the background width from 0%. Static under `prefers-reduced-motion`.
- **Where it is used:** the open folder in the tree, the selected file's name in the file list (the tree only brightens and bolds the same file, so one selection gets one swipe), every cited fact in a chat answer, and "Scanning completed" (green). The selection family extends to the open page in the Settings / Privacy index, the current onboarding step, and the active quick-search row (there the wipe shortens to 160ms because the selection follows the arrow keys). The welcome screen shows one sample answer with a mark and a citation tab.
- **Cited facts:** the claim before each `[n]` is marked. Claims up to 160 characters are marked whole; longer ones (lists, paragraphs) only their last sentence, so an answer never becomes one yellow block.

### File Rows
One file per line, ruled like a list.
- **Structure:** file-type icon (muted) · name (500) · description (muted, one line, ellipsis) · ⋯ actions. A hairline under every row; a column header row in Label type with the file total right-aligned in tabular figures.
- **Hover:** fill to Row Hover, 120ms ease-out. The ⋯ menu button is invisible until the row is hovered, selected, focused or its menu is open.
- **Selected:** the name gets the yellow mark; the row is scrolled to centre when selected from the tree or a chat source.
- **Unreadable / removed:** name drops to muted at 400 weight, icon to 60% opacity; the description states why in plain words. Errors use pink text.
- **Busy:** a small spinner inline before "Reading…" or "Writing summary…".
- **Interaction:** click selects, double-click opens the file.

### Folder Tree (navigation)
- **Style:** Body type, rows with 0.4rem corners and Row Hover fill; folder and file icons muted. Children hang off a 1px hairline rule on the left.
- **Folder:** chevron toggles (rotates 90°, 150ms); clicking the name opens the folder in the list and carries the yellow mark when active. File counts on the right in Label type.
- **File:** muted until hovered or selected (then paper-white, 500), with a 6px status dot in the ink of its state (green indexed, blue 60% pending, blue pulsing processing, muted 40% skipped, pink error).

### Scan Status
At the foot of the margin index.
- **Working:** blue spinner icon, title ("Scanning…", "Looking for files…", "Writing summaries · n left"), the file being read in Label type, a 3px blue progress bar on a Hairline track, counts in tabular figures, and a full-width outline Stop scanning button.
- **Paused:** pause icon; plain-language reason ("Waiting for the charger"); Resume scanning when stopped by the user.
- **Completed:** green check, "Scanning completed" in a green mark, no bar, and a muted line that new files are picked up automatically.

### Chat
- **Header:** Title type "Ask your files"; a ghost New chat button once there are messages.
- **Empty state:** a muted explanation and up to three example questions drawn from the user's own files, as hairline-bordered md-corner buttons that brighten border and text on hover.
- **User message:** Raised surface bubble, xl corners with a tighter bottom-right, indented 2.5rem from the left.
- **Answer:** Body / Answer type, cited facts marked, each followed by its citation tab, which opens the file. Below, one source chip per cited file in order of first citation: number · icon · name · page, in Small type (13px), hairline border that brightens on hover; clicking lands on the file in the list.
- **Citation tab:** the numeral in a small tab (12px, 600, tabular figures, about 1.1rem tall, 0.3rem corners) with a 1px Highlighter Yellow outline at 55% and yellow text, raised 0.2em off the baseline. On hover it fills yellow with Graphite Ground text (120ms). Sized to be read on a projector, which the old 11px superscript was not.
- **Possibly related files:** when the answer could not find the fact, a Small muted "Possibly related files:" label introduces the chips. When nothing was cited at all, up to three search matches are offered as chips with a dashed hairline border, so they read as suggestions, not sources.
- **Composer:** Card surface, xl corners, hairline border; on focus the border turns yellow at 70% and the surface steps to Popover. Enter sends, Shift+Enter breaks a line. Send is yellow only with text; Stop (secondary) replaces it while answering.

### Buttons
- **Shape:** lg corners (0.5rem), 2rem tall (1.75rem small), 10px side padding, 500 weight; pressed state nudges down 1px.
- **Primary:** Highlighter Yellow with Graphite Ground text; hover dims to 80%. Used for Send, the forward action of each onboarding step, the tour's Next / Done, and "Keep running in the tray".
- **Secondary:** Raised surface, paper-white text. Used for empty Send and Stop, and as the fallback of a primary button that is not yet available (onboarding: graphite with muted text at full opacity, not a faded yellow).
- **Outline:** hairline/input-edge border on the ground. Used for Stop / Resume scanning and Load more.
- **Ghost:** no fill, muted text, muted fill on hover. Used for New chat and the row ⋯ trigger.
- **Destructive:** pink text on a pink 20% tint, for the confirm button of a destructive dialog only (Remove, Switch folder, Delete).

### Menus and Dialogs
- **File actions menu:** Popover surface, lg corners, ring + small shadow (see Elevation): Open, Show in folder, separator, Remove from Smart Space (pink) or Add back.
- **Remove dialog:** Popover surface, xl corners, ring only; states plainly that the real file is not touched.
- **Confirm dialog** (shared by Switch folder in Settings and the deletes on Privacy): same surface as the remove dialog; Cancel beside the pink destructive confirm. The text states exactly what goes and what stays (for example: summaries, index and chats are forgotten; the files themselves stay where they are). It stays open, with the confirm label in its working form ("Deleting…"), until the work is done.
- **First-close dialog:** the first time the main window is closed it asks once: "Keep running in the tray" (primary, focused) or "Quit Smart Space" (outline), and says what the tray keeps working. The answer is remembered and can be changed in Settings ("When you close the window": Ask / Keep in tray / Quit).

### Settings and Privacy pages
The Home margin index with page links instead of the folder tree: a muted "Back to files" (or "Back to setup") link, a hairline, then Settings and Privacy. The open page's label carries the yellow mark, exactly as the open folder does; the others are muted until hovered. Content is one column (max 46rem) of titled sections, each a run of hairline Rows. Nothing sits in a card.

### Switch and Segmented
- **Switch:** a 1.75rem × 1rem pill. Off is the Input Edge track with a paper-white thumb; on is Highlighter Yellow with a Graphite Ground thumb, because on means selected. The thumb slides 150ms on the mark's curve; static under reduced motion.
- **Segmented:** two or three mutually exclusive choices in a hairline-bordered lg group. Options are muted text (0.8125rem); the chosen one is raised graphite (Raised surface, paper-white, 500), never inked, so a setting value is not mistaken for a selection mark.

### Keyboard Keys
Each key of a shortcut as its own small key: 12px, 1.25rem tall, at least 1.4rem wide, Raised surface, hairline border, 0.25rem corners, paper-white text. Used in Settings (Quick search, keyboard shortcuts) and the quick-search hint line. No ink.

### Tour
The first-time tour over the real Home window, replayable from Settings → Help.
- **Spotlight:** an xl-cornered cut-out around the part being explained, with the rest of the window under a 0.62 graphite scrim and a paper outline at 22%. Between steps it glides 420ms on `cubic-bezier(0.16, 1, 0.3, 1)` (the mark's ease-out-expo), the one authored motion besides the wipe. The window stays usable.
- **Card:** 20rem, Popover surface, xl corners, the floating ring and the tour shadow (see Elevation). "1 of 3" in Label type, a Title, a muted Body line, then Skip tour (ghost, muted) on the left and Back (ghost) / Next or Done (primary) on the right. Three steps: the files, the chat, quick search. Esc skips, arrows step.
- **Reduced motion:** the spotlight and card jump instead of gliding.

### Quick Search
A small window opened from any app (Alt+Space), entirely on the Popover surface.
- **Search line:** search icon, a 17px borderless input, a blue spinner while fetching.
- **Results:** up to six rows, md corners, icon · name (500) · parent folder (muted, gives way first) and an optional snippet line. The active row gets a slightly lifted graphite fill and the yellow mark on its name, plus a ↵ hint. Matched words in the snippet are brighter (paper-white, 500), not inked: the mark is only for the selection.
- **Hints:** a hairline-topped line of Keyboard Keys with muted labels (Open, Show in folder, Show in Smart Space, Close).

### Onboarding
Welcome → Your PC → AI models → Folder, on the Home grammar: hairline-ruled FactRows (muted label left, value right), no cards.
- **Step indicator:** done steps show a green check, the current step's label carries the yellow mark, later steps are muted; short hairline rules join them.
- **Actions:** ghost Back on the left, the primary on the right. A primary that is not yet available falls back to secondary graphite with muted text.
- **Welcome:** the large logo, a 30px headline, then a sample answer between two hairlines (a marked fact, a citation tab and its source chip) so the user meets the signature before Home, then three facts and the primary "Let's get started".
- **Model download:** a blue progress bar (in progress).

### App Icon
The logo tile at 1024px: Highlighter Yellow, tilted -3°, uneven corners, the folder-and-magnifier glyph in Graphite Ground strokes. One ink, used as the product's mark rather than as a state.

### Focus, Selection, Caret, Scrollbars
- **Focus:** a 2px Highlighter Yellow outline with 2px offset on any focus-visible element; buttons use a 3px ring of the focus colour (yellow at 70%, at half strength) instead; the composer shows focus on its container border.
- **Caret:** Highlighter Yellow.
- **Selection:** Highlighter Blue at 38% behind paper-white text.
- **Scrollbars:** thin, Scrollbar Thumb on a transparent track.

### Notice Bar
A one-line alert above the file list for failed file actions: pink border at 40%, md corners, dismiss button. No fill.

## Do's and Don'ts

### Do:
- **Do** use the highlighter mark for exactly three kinds of thing: the current selection (open folder, selected file, open Settings / Privacy page, current onboarding step, active quick-search row), a cited fact, and a completed scan.
- **Do** keep every ink to its one job: yellow selected / cited, green done, pink removed / failed, blue in progress.
- **Do** separate content with 1px Hairline rules and the graphite surface steps.
- **Do** list files as one-line ruled rows (icon · name · description · ⋯) and let the name column win when space is narrow.
- **Do** set every count and citation numeral in tabular figures.
- **Do** let side columns flex with `clamp()` (sidebar 13.5–17.5rem, chat 18–25rem) so the window works down to 900×600.
- **Do** make the swipe static and drop row transitions under `prefers-reduced-motion`.
- **Do** fall back to plain graphite for unavailable controls instead of a faded ink.
- **Do** set the chosen option of a segmented control in raised graphite, and reserve yellow for a switch that is on.
- **Do** colour every progress bar blue (`--progress-ink: var(--ink-blue)`); a bar is "in progress".
- **Do** say in a confirm dialog exactly what goes and what stays before the pink button.

### Don't:
- **Don't** put files or panels in cards, or give anything on the ground a shadow; shadows belong only to floating layers (menus, the tour card).
- **Don't** render an ink as a glow, gradient or blurred halo; marks are flat swipes behind text.
- **Don't** use yellow for "done" or green for "selected"; that breaks the one-job inks.
- **Don't** mark more than the cited claim; long claims get only their last sentence marked.
- **Don't** swipe the same selection twice (the tree brightens the selected file, the list marks it).
- **Don't** style text selection like a highlighter mark.
- **Don't** ink matched search words; brighten them. The mark belongs to the selected row.
- **Don't** add motion beyond state changes, the wipe and the tour's glide.
