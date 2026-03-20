# Die Goldsucher App

A gold prospecting map app that lets users mark, classify, and track potential gold-finding locations on an interactive map with offline support and cloud sync.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Mapping**: Leaflet + react-leaflet
- **Backend/Storage**: Firebase (Firestore, Storage, Auth)
- **Local Storage**: IndexedDB (via native API)
- **Styling**: Tailwind CSS (CDN with custom config in index.html)
- **Server**: Express with Vite middleware
- **AI**: Google Generative AI (@google/genai)

## Architecture

- `App.tsx` — root component, manages all state and UI orchestration
- `index.tsx` — entry point with path-based routing (`/` = app, `/landing` = landing page)
- `components/` — feature components (Map, AddLocation, LocationDetail, LocationList, Settings, Todo, UI, Landing)
- `components/Landing/LandingPage.tsx` — standalone marketing landing page (Adventure/nature theme)
- `services/` — Firebase, auth, billing, and location persistence logic
- `hooks/` — `useGeoLocation` for GPS tracking
- `types.ts` — shared TypeScript types
- `constants.ts` — colors, default coordinates
- `server.ts` — Express server with Vite middleware, serves static files from `public/`
- `public/images/` — static image assets (hero, map, journal images for landing page)

## Running the App

```
PORT=5000 npm run dev
```

The workflow is configured as "Start application" with `PORT=5000 npm run dev` on port 5000.

## Key Features

- Offline-first with IndexedDB, syncs to Firebase when online/authenticated
- Location classification: Goldhöffig, Interessant, Nicht goldhöffig + custom layers
- Map types: Satellite, Terrain, Hillshade/Standard
- Naturschutzgebiete (nature reserves) overlay: GeoJSON layer with 8780 German nature reserves, toggleable via map menu, offline-cached in IndexedDB
- Nationalparks overlay: GeoJSON layer with all 16 German national parks (data from OpenStreetMap), shown alongside nature reserves with darker green styling, offline-cached in IndexedDB
- Photo attachments (stored as Base64 locally, uploaded to Firebase Storage)
- 14-day trial system via Firebase user profile creation date

## Known Limitations

- Tailwind is loaded from CDN (not PostCSS plugin); custom animations and colors are defined inline in index.html
- Billing/paywall is a demo stub — native store integration needed for mobile app deployment
