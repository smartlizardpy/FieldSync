# FieldSync

FieldSync is an MVP web app for photographers and field crews who want painless geo-linked session management without extra hardware. It combines a marketing site, in-browser workspace, mobile logger, and account settings in a unified React Router project backed by Firebase.

## Table of contents

1. [Core experience](#core-experience)
2. [Product design language](#product-design-language)
3. [Architecture overview](#architecture-overview)
4. [Firebase integration](#firebase-integration)
5. [Local development](#local-development)
6. [Project structure](#project-structure)
7. [Roadmap ideas](#roadmap-ideas)

## Core experience

### Landing page (`/`)
- Hero positions FieldSync as the link between camera file numbers and phone GPS data.
- Features highlight phone anchors, quick number capture, and desk-side matching.
- Capture section links directly to the on-the-go logger for one-tap bookmarking.
- Map-inspired hero preview visualises the planned desktop experience.

### Session workspace (`/app`)
- Dashboard cards summarise imported photos, phone-saved locations, total logs, and cameras.
- Photo list surfaces basic EXIF data and reveals whether a field location exists.
- Detail panel renders a stylised mini-map and metadata for the selected photo.
- Camera and location log summaries reinforce how IDs and GPS entries stay aligned.

### On-the-go capture (`/app/otg`)
- Mobile-first UI for logging the trailing digits from a camera filename alongside live GPS.
- Stores entries locally (with Firebase sync planned) to keep the latest anchor fix.
- Highlights the current anchor and saved history so photographers feel confident on location.

### Account settings (`/app/settings`)
- Profile card captures name, email, timezone for future exports and team features.
- Camera manager records body IDs, serials, and lenses—assignment is flagged as “coming soon.”
- Team directory keeps track of crew members for upcoming collaboration upgrades.

## Product design language

- **Visual tone:** Clean, modern SaaS aesthetic using layered gradients and soft cards.
- **Colour system:** Sky blues and emerald greens for primary actions; slate grays for typography.
- **Typography:** Inter (Google Fonts) for a professional yet approachable voice.
- **Component motifs:**
  - Rounded rectangles with subtle borders and gentle drop shadows.
  - Pill buttons with slight lift (`translate-y`) on hover for tactile feedback.
  - Stat rows and chips that rely on tonal backgrounds rather than heavy outlines.
- **Dark mode:** Landing page supports dark theme via Tailwind; app screens currently target light mode.

## Architecture overview

- **Framework:** [React Router v7](https://reactrouter.com/) using the app-directory structure.
- **Language:** TypeScript end-to-end.
- **Styling:** Tailwind CSS 4 with theme tokens defined in `app/app.css`.
- **State:** Local state in each route for MVP; Firebase will replace mock arrays.
- **Firebase client:** `app/firebase/client.ts` exposes `getFirebaseApp()` and `getFirebaseAnalytics()` with lazy init and SSR guards.
- **Routing:**
  - `app/routes/home.tsx` renders the landing page via the `Welcome` component.
  - `app/routes/app.tsx` powers the workspace dashboard.
  - `app/routes/app.otg.tsx` delivers the on-the-go capture flow.
  - `app/routes/app.settings.tsx` handles account and camera settings.

## Firebase integration

```ts
// app/firebase/client.ts
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "fieldsync-48024.firebaseapp.com",
  projectId: "fieldsync-48024",
  storageBucket: "fieldsync-48024.firebasestorage.app",
  messagingSenderId: "1034685391254",
  appId: "1:1034685391254:web:bff6b586315bb927f1bdb7",
  measurementId: "G-SWSEV3L1P6",
};

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
  }
  return appInstance;
}
```

- Config is inline for rapid prototyping; move to environment variables before production.
- `getFirebaseAnalytics()` checks `isSupported()` to avoid SSR or unsupported browser crashes.
- Next steps: replace in-memory data in `/app`, `/app/otg`, and `/app/settings` with Firestore (or Realtime Database) collections.

## Local development

```bash
npm install        # install dependencies, including Firebase SDK
npm run dev        # start the Vite dev server
npm run typecheck  # ensure TypeScript types are sound
npm run build      # compile client + server bundles
```

The dev server runs at `http://localhost:5173` with hot module reload enabled.

## Project structure

```
app/
  app.css                # Tailwind theme setup
  firebase/client.ts     # Firebase bootstrap helper
  routes/
    home.tsx             # Landing page
    app.tsx              # Session workspace
    app.otg.tsx          # On-the-go capture
    app.settings.tsx     # Account settings
  welcome/welcome.tsx    # Landing page UI
public/                  # Static assets
README.md                # This document
```

## Roadmap ideas

- Persist photos, cameras, and anchors to Firestore for collaborative sync.
- Introduce Firebase Auth for multi-user workspaces.
- Replace the illustrative mini-map with a live map widget (Mapbox, Google Maps, MapLibre, etc.).
- Capture analytics events via Firebase once real usage patterns emerge.
- Build an offline-first sync between `/app/otg` and desktop using IndexedDB + Firebase.

---

Built with ❤️ using React Router, Tailwind CSS, and Firebase.
