# Cruit — Indeed meets Tinder

Fast, affordable recruiting. Swipe right on your next hire.

## What it is

Employers post quick job snippets (title · shift · pay · location · requirements). Candidates post a profile snapshot. Both sides swipe — mutual interest = instant match + messaging to schedule an interview. All swipe history is saved so nothing is ever lost.

**Business model**
- Employers pay: **$20/post** or **$175/month unlimited**
- Candidates: **free** (ad-supported)
- Enterprise plans for high-volume hiring

## Tech stack

| Layer | Tech |
|---|---|
| Backend | [Supabase](https://supabase.com) (Postgres + Auth + Realtime + RLS) |
| Web | Next.js 14 App Router · Tailwind CSS |
| Mobile | Expo SDK 51 · Expo Router · React Native Reanimated |

## Project structure

```
Cruit/
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql   # Full DB schema + trigger
├── web/          # Next.js web app
└── mobile/       # Expo React Native app
```

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **Supabase → SQL Editor**:
   ```
   supabase/migrations/20240101000000_initial_schema.sql
   ```
3. Enable **Realtime** for the `matches` and `messages` tables in Database → Replication

### 2. Web app

```bash
cd web
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into web/out
```

### 3. Mobile app

```bash
cd mobile
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npx expo start       # Scan QR with Expo Go app
```

> **Note:** `react-native-reanimated` requires a development build for production. Use `npx expo run:ios` or `npx expo run:android` for a full build.

## Release/testing checklist

### Web via GitHub Pages

1. Add repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. In GitHub, enable **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` or run the **Deploy web to GitHub Pages** workflow manually.

The web app is configured for a project page at `/Cruit` by default. Override with:

```bash
cd web
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build:pages
```

### iOS and Google Play testing

The Expo app includes store-ready identifiers and generated icon/splash assets.

```bash
cd mobile
cp .env.example .env
npm install
npm run typecheck
npm run build:ios:preview       # internal TestFlight-ready build via EAS
npm run build:android:preview   # internal APK build for Play testing
```

Before store submission, update `mobile/app.json` if you want a different bundle identifier/package than `com.cruit.app`, then run the production EAS build and submit scripts.

## Seed usability test accounts

To create login-able Supabase Auth users plus sample companies, profiles, and jobs, add your service role key locally:

```bash
cd web
printf "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n" > .env.seed
npm run seed:test-users
```

Seeded accounts all use password `CruitTest123!`:

| Role | Email |
|---|---|
| Employer | employer.riverbend@cruit.test |
| Employer | employer.northstar@cruit.test |
| Employer | employer.hearthside@cruit.test |
| Candidate | candidate.ava@cruit.test |
| Candidate | candidate.marcus@cruit.test |
| Candidate | candidate.priya@cruit.test |

## Key features

- **Swipe UI** — drag cards left/right on web and mobile; tap buttons for accessibility
- **Real-time match notifications** — Supabase Realtime pushes match events instantly
- **Swipe history** — all left/right swipes saved; nothing disappears
- **In-app messaging** — real-time chat opens automatically on match
- **Role-based routing** — employers and candidates get separate views
- **Match trigger** — a Postgres function detects mutual interest server-side, preventing race conditions

## Screens

### Candidates
| Screen | Description |
|---|---|
| Swipe | Browse job snippets, swipe right to apply |
| Matches | View matches + chat with employers |
| Profile | Name, title, skills, availability, bio |

### Employers
| Screen | Description |
|---|---|
| Swipe | Browse candidate profiles |
| Jobs | Post/manage job snippets |
| Matches | View matches + chat with candidates + history |
| Profile | Company info + subscription plan |
