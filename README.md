# Kasatria 3D People Table

A modified version of the three.js [CSS3D periodic table](https://threejs.org/examples/#css3d_periodictable)
that shows 200 people loaded live from a Google Sheet, behind Google sign-in.

- **React + Vite** for sign-in, data loading and the page around the 3D view
- **three.js** (`CSS3DRenderer`, `TrackballControls`) + **tween.js** for the 3D scene
- **Google Identity Services** (`@react-oauth/google`) for sign-in
- **Google Sheets API v4** (API key, link-viewable Sheet) for data
- **GitHub Pages** via GitHub Actions for hosting

## Requirements → implementation

| # | Requirement | Where |
|---|---|---|
| 1 | Sheet imported from the CSV and shared | `data/people-clean.csv`, [SETUP.md](SETUP.md) §1 |
| 2 | Google sign-in page (Image A) | `src/components/LoginCard.jsx`, `src/auth/` |
| 3 | Data retrieved from the Sheet | `src/data/sheets.js`, `src/data/useSheetData.js` |
| 4 | Tiles show person data (Image B) | `src/three/tile.js`, `src/styles/tile.css` |
| 5 | Red < $100K · Orange $100K–$200K · Green ≥ $200K | `src/data/parse.js` (`wealthBand`), `Legend.jsx` |
| 6 | Table / Sphere / Helix / Grid | `src/three/layouts.js`, `LayoutControls.jsx` (keys 1–4) |
| 7 | Table 20 × 10 | `tableTargets` |
| 8 | Double helix | `doubleHelixTargets` |
| 9 | Grid 5 × 4 × 10 | `gridTargets` |

Layout sizes are covered by unit tests in `tests/layouts.test.js`.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values (see SETUP.md)
npm run dev                   # http://localhost:5173
```

Without `.env.local`, `npm run dev` still works: it shows a **demo sign-in** button and uses
the bundled sample of the CSV. Neither fallback exists in production builds — production
always requires Google sign-in and reads the live Sheet.

```bash
npm test         # unit tests (parsing, colour bands, layout dimensions)
npm run lint
npm run build    # → dist/
```

To regenerate the clean CSV from the original file:

```bash
npm run clean-csv -- "path/to/Data Template.csv"
```

## Project structure

```
src/
  auth/         Google sign-in state (ID token decoded, kept in sessionStorage)
  components/   React UI: LoginCard, Viewer, Header, LayoutControls, Legend, StatusOverlay,
                PeriodicTable3D (the React ↔ three.js bridge)
  data/         Sheets API fetch, CSV/Sheet row parsing, colour bands
  three/        scene.js (renderer, camera, controls, tweens), layouts.js, tile.js
  styles/
scripts/        clean-csv.mjs — Windows-1252 CSV → clean UTF-8 + sample data
tests/          Vitest unit tests
```

## Notes

- Sign-in is a client-side gate on a static site: the Google ID token is decoded, not
  verified on a server. The Sheet itself is link-viewable so any signed-in visitor can load it.
- The Client ID and API key are public by nature; they are protected by the authorized
  origins and the API key's website + API restrictions in Google Cloud.
