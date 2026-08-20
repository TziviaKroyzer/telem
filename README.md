# Telem — Merkaz Telem

Internal app for notes and calendar, hall reservations, files, search, and personal tasks for Merkaz Telem. The UI is Hebrew (RTL) and runs in the browser and on Android via Capacitor.

## Tech stack

- React 19 + Vite 6
- React Router
- Firebase (Authentication, Firestore, Storage)
- Capacitor 7 (Android)
- `@hebcal/core` for the Hebrew calendar
- Lucide for icons

## Setup from scratch

```bash
git clone <repo-url>
cd telem-new
npm install
```

1. Copy `.env.example` to `.env` in the project root.
2. Fill in the `VITE_FIREBASE_*` variables from your Firebase project (Firebase Console → Project settings).
3. Run `npm run dev`.

Without a valid `.env` file, the app will not connect to Firebase.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local Vite development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

### Android (Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android
```

Build and install from Android Studio. The Android app lives in `android/`.

## Project structure

```
telem-new/
  src/
    App.jsx              Routing and authentication
    firebase.js          Firebase init from environment variables
    pages/               App pages (home, notes, halls, files, search, profile, admin)
    components/          Shared components (login, calendar, forms, admin lists)
    utils/               Validation and Hebrew Firebase error messages
    index.css            Design system
  firestore.rules        Firestore security rules
  storage.rules          Storage security rules
  android/               Capacitor Android project
  .env.example           Required environment variable names
```

## Tests

There is no automated test suite yet. For manual checks: sign in, add a note, profile tasks, files, hall reservation, and admin.

## Security

- Firebase secrets live in `.env` (not committed to git).
- After a previous API key exposure, rotate the key in the Firebase Console.
- Deploy security rules (requires Firebase CLI and project access):

```bash
npm i -g firebase-tools
firebase login
firebase use telem-8ad5a
firebase deploy --only firestore:rules,storage:rules
```
