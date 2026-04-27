# UbiQuity 2.0 — Interactive Design Prototype

A collaborative design prototype for UbiQuity 2.0, a hybrid CDP/MAP for SMEs. Built with React 19, TypeScript, Vite, and optionally backed by Supabase for shared review sessions.

## Prerequisites

- Node.js 18+
- npm 9+
- (Optional) A Supabase project for collaborative mode

## Setup

```bash
git clone <repo-url>
cd ubiquity
npm install
```

## Environment Variables

Copy the example env file and fill in your Supabase credentials (optional):

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Without these variables, the prototype runs in local-only mode using mock data.

## Database Setup

If using Supabase, apply the migration and seed the database:

```bash
# Apply schema (via Supabase CLI or dashboard SQL editor)
# See supabase/migrations/001_initial_schema.sql

# Seed demo data
npm run seed
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running Tests

```bash
npm test
```

## Deployment

The app deploys as a static SPA to Vercel or Netlify:

```bash
npm run build
```

- **Vercel**: `vercel.json` handles SPA routing rewrites
- **Netlify**: `public/_redirects` handles SPA routing

## Reviewer Access

When Supabase is configured and seeded, use these credentials:

| Email | Password | Role |
|---|---|---|
| `reviewer1@ubiquity.test` | `password123` | Reviewer |
| `reviewer2@ubiquity.test` | `password123` | Reviewer |
| `reviewer3@ubiquity.test` | `password123` | Reviewer |

In local-only mode (no Supabase), authentication is bypassed and a mock user is used automatically.
