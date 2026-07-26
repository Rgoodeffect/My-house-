# مصروفات البيت — Household Expenses

A real, database-backed mobile app for tracking household expenses, budgets, and account
balances — rebuilt from a single-file HTML/localStorage prototype into a proper client/server
product that runs natively on **iOS and Android**.

- **`mobile/`** — an [Expo](https://expo.dev) / React Native (TypeScript) app. Builds to a real
  `.ipa`/`.aab` for the App Store and Google Play, not a wrapped web page.
- **`server/`** — a Node.js/Express + PostgreSQL (via Prisma) REST API. Every user has an
  account (JWT auth) and their data lives in the database, so it syncs across every device they
  log into.

## Features

- Email/password accounts with per-user data isolation
- Expense tracking with categories (custom emoji + color), payment method, notes, search/filter
- Month-by-month navigation shared across Home, Budget, Balance and Reports
- Monthly total budget + per-category limits, with spend progress bars and over/near-budget alerts
- Cash vs. bank balance tracking (salary + carried-over balance − spend this month)
- Reports: category breakdown (pie chart), daily/periodic spend trend (bar chart), top 5
  expenses, remaining budget per category, and a custom date-range mode
- Category management (add/delete, emoji picker)
- Export to JSON/CSV (share sheet) and import from a previously exported JSON file
- Full data wipe with a two-step confirmation
- Arabic RTL UI, light/dark theme

## Architecture

```
server/   Express + TypeScript API, Prisma ORM, PostgreSQL
  prisma/schema.prisma   User, Category, Expense, Budget, Balance models
  src/routes/            auth, categories, expenses, budgets, balances, data (export/import)
  src/middleware/auth.ts JWT bearer-token auth guard

mobile/   Expo (React Native + TypeScript)
  src/api/               fetch client (JWT via expo-secure-store) + typed endpoint wrappers
  src/context/           Auth, Categories, Month, Confirm-dialog providers
  src/navigation/        Auth stack (Login/Register) + bottom-tab main app
  src/screens/           Home, Add, Budget, Balance, Reports, Settings
  src/components/        shared UI (Card, Button, SelectField, DateField, charts helpers, …)
```

The mobile app is a thin client: it holds no persistent state of its own beyond the JWT and a
short-lived per-screen cache. All expenses, budgets, balances and categories live in Postgres,
so signing in on a second phone shows the same data.

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env          # edit JWT_SECRET before shipping this anywhere real
docker compose -f ../docker-compose.yml up -d postgres   # or point DATABASE_URL at your own Postgres
npm install
npx prisma migrate deploy
npm run dev                    # http://localhost:4000
```

Or run the whole backend (Postgres + API) in Docker:

```bash
docker compose up --build
```

Health check: `curl http://localhost:4000/health`.

### 1b. Deploying the backend to Render (production)

The repo includes a [`render.yaml`](./render.yaml) Blueprint that provisions everything needed —
a free PostgreSQL database and a Docker web service for the API, wired together automatically:

1. Push this repo to GitHub (already done if you're reading this from `Rgoodeffect/My-house-`).
2. In the [Render dashboard](https://dashboard.render.com), click **New +** → **Blueprint**, and
   point it at this repository. Render reads `render.yaml` and shows you the two resources it
   will create (`household-expenses-db` + `household-expenses-api`).
3. Click **Apply**. Render builds `server/Dockerfile`, generates a random `JWT_SECRET`, wires
   `DATABASE_URL` to the new database automatically, and runs `prisma migrate deploy` on every
   boot (baked into the Dockerfile's `CMD`) — no manual migration step needed.
4. Once it's live, copy the service's public URL (e.g. `https://household-expenses-api.onrender.com`)
   — that's your API base. The mobile app needs `<that URL>/api` as `EXPO_PUBLIC_API_URL`.

Free-tier caveats worth knowing: the web service spins down after ~15 minutes idle (the first
request after that takes a few extra seconds to wake it up), and Render deletes free Postgres
databases after 30 days unless you upgrade the database to a paid plan. Fine for trying this
out; upgrade both resources before relying on it day to day.

Prefer to configure it by hand instead of the Blueprint? Create a PostgreSQL instance and a
Docker-runtime Web Service pointing at `server/Dockerfile` (root/context: `server`) in the
Render dashboard, then set `DATABASE_URL` (from the database's "Connect" tab), `JWT_SECRET`
(any long random string), and `PORT=4000` as env vars.

### 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env           # set EXPO_PUBLIC_API_URL to reach your server
npx expo start
```

Then open the app in **Expo Go** (scan the QR code) or press `i`/`a` for the iOS
Simulator/Android Emulator.

**Important — `EXPO_PUBLIC_API_URL`:** `localhost` only resolves to your API when the app runs
in the iOS Simulator on the same machine. For a physical phone or the Android emulator, set it
to your computer's LAN IP (e.g. `http://192.168.1.20:4000/api`) or a deployed server URL. This
can also be set via `app.json`'s `expo.extra.apiUrl` if you'd rather not use an env file.

### 3. Building the real iOS/Android app

The Expo Go app above is for development. To produce an installable app — for your own device,
internal testing, or the App Store / Google Play — use
[EAS Build](https://docs.expo.dev/build/introduction/). `mobile/eas.json` already defines three
build profiles:

```bash
cd mobile
npm install -g eas-cli
eas login              # creates a free Expo account if you don't have one
eas init                # links this project to your Expo account (writes extra.eas.projectId into app.json)
```

Then pick a profile depending on what you need:

```bash
# Quickest way to get a real, installable file without any store account:
eas build --platform android --profile preview   # produces a .apk you can install directly on a phone
eas build --platform ios --profile preview        # needs an Apple Developer account to sign, even for internal installs

# Store-ready builds (app bundle for Play, signed archive for App Store):
eas build --platform android --profile production
eas build --platform ios --profile production
```

`app.json` already sets `ios.bundleIdentifier` and `android.package` to
`com.householdexpenses.app` — change that to your own identifier before you submit to either
store (it must be unique per store). Once a production build is ready, submit it with:

```bash
eas submit --platform android
eas submit --platform ios
```

`eas submit` will prompt for the store credentials it needs (a Google Play service account key,
or your Apple ID + app-specific password) the first time you run it.

Before your first store submission, remember to point `EXPO_PUBLIC_API_URL` (or
`app.json`'s `expo.extra.apiUrl`) at your **deployed** backend, not `localhost` — see the Render
section above.

## Data model

Per user: `Category` (name/icon/color), `Expense` (name, amount, category, date, payment
method, note), `Budget` (per month: a `total` entry plus optional per-category limits), and
`Balance` (per month: cash/bank salary + carried-over balance). See
`server/prisma/schema.prisma` for the exact schema.

## API

All routes except `/health`, `/api/auth/register` and `/api/auth/login` require
`Authorization: Bearer <token>`. See `server/src/routes/*.ts` — each route file is short and
self-documenting. Notable endpoints:

- `POST /api/auth/register` / `POST /api/auth/login` → `{ token, user }`
- `GET /api/expenses?month=YYYY-MM` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /api/budgets` `{ month, entries: { total?, [categoryName]: number } }` (full replace)
- `PUT /api/balances` `{ month, salaryCash, salaryBank, prevCash, prevBank }`
- `GET /api/data/export` / `POST /api/data/import` / `POST /api/data/clear`

## What's verified vs. what's left for you

Verified in this environment: the API was migrated against a real Postgres database and
smoke-tested end-to-end (register → categories → add expense → budgets → balances → export);
the mobile app type-checks and bundles cleanly (Metro built all 1200+ modules with no errors).

Not yet done, because it needs a device/simulator and your own accounts: running the mobile UI
by hand on an iOS/Android simulator, and an EAS Build submission. Both are described above.
