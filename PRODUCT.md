# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(A Tauri v2 desktop app for Windows; the UI is a web view, so web conventions apply. Window 1200×800, minimum 900×600.)

## Users

Anyone who wants to find their files faster, with students and young professionals as the core: people whose Windows laptop holds a messy folder of uni notes, contracts, invoices, CVs, photos and scans, in German and English. They come to the app with a concrete need ("where is my rental agreement?", "how much was the laptop?") and want the file or the answer in seconds.

## Product Purpose

Smart Space reads one folder the user picks and lets them find files by meaning and ask questions about them. Success: the right file or a correct answer with its source, quickly, without the user organising anything first.

## Positioning

Everything runs on the user's own PC: no cloud, no account, no telemetry, and the user's files are never changed, moved or deleted. Every chat answer points to the exact file (and page) it came from.

## Operating Context

- Desktop app; the backend starts with the app and stops when it closes.
- Onboarding: welcome → hardware check → one recommended model set (download) → pick a folder → Home.
- Home: folder tree and scan status (Stop / Resume) in a sidebar, the file list in the middle, chat on the right.
- The folder is watched: new, changed and deleted files are picked up within seconds.
- MVP presentation on 23 November 2026 on a laptop with an RTX 3050 (4 GB), shown live, possibly on a projector.

## Capabilities and Constraints

- Reads PDF, Word, PowerPoint, text, Markdown, CSV, photos and scanned PDFs (OCR); each file gets an AI summary, a document type and tags.
- Hybrid search (meaning + keywords) over text and summaries; chat with numbered citations; German and English.
- A file can be removed from Smart Space (it forgets the file and keeps ignoring it) and added back; the real file is never touched.
- Fixed for the MVP: the 3-column Home layout (sidebar · files · chat), dark theme, English UI (German later).
- Not in the MVP: settings page, privacy page, quick-search window, installer.

## Brand Commitments

- Name: Smart Space.
- Binding for now: dark theme.
- Feel the user asked for: professional, modern and minimal; a hint of a file manager, but not a heavy file-manager clone.

## Evidence on Hand

- Demo folder `C:\SmartSpaceDemoFiles` (17 synthetic German/English files) and agreed demo queries in `docs/DEMO_PC_RESULTS.md`.
- No testimonials, customers or benchmarks beyond the measured results in `docs/DEMO_PC_RESULTS.md`; do not invent any.

## Product Principles

1. The user's files come first: the interface frames them and gets out of the way.
2. Private by default, and visibly so: nothing leaves the PC, and the app says so plainly.
3. Every answer shows where it came from.
4. Calm while working: scanning and AI work happen in the background without demanding attention.
