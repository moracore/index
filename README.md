# Index — Media Tracker

A manual, offline-first media tracker for logging sequential progress through tiered content: TV shows, anime, manga, book series, and more.

No external APIs. No accounts. Data lives in your browser.

## Features

- **Sequential pointer model** — progress is tracked as a single `(segment, unit)` position. Advancing forward auto-completes all prior segments; moving backward prompts confirmation.
- **Proportional progress bar** — a master bar where each segment's visual width is proportional to its unit count, giving an accurate at-a-glance completion picture.
- **Media types** — TV, Anime, Manga, Book Series, Movie, Standalone, Custom; each with sensible segment/unit label defaults.
- **Ongoing support** — mark a series as ongoing to keep appending segments without losing progress ratios.
- **Per-entry accent colors** — visually distinguish entries on the dashboard.
- **Sort & settings** — sort by date added, alphabetically, or by progress; toggle dark/light theme.
- **PWA** — installable on desktop and mobile, works fully offline.

## Tech Stack

- React 19 + TypeScript
- Vite 8 + `vite-plugin-pwa`
- Lucide React icons
- No backend — all state persisted in `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Progress Model

Total progress is computed as:

```
P = (units completed in all prior segments + current unit index) / total units
```

Each segment's share of the master bar equals `unitCount / totalUnits`, so a 24-episode season always looks twice as wide as a 12-episode season.
