# Chat App (Next.js + TypeScript + Socket.IO + Supabase)

A starter chat application using Next.js, TypeScript, Socket.IO for real-time messaging, and Supabase for authentication and data.

## Features
- Next.js + TypeScript
- Socket.IO API route for real-time messaging
- Supabase client integration (auth + user profiles)
- Pages: `login`, `index` (chat), `profile`, `admin`
- Tailwind CSS for styling

## Prerequisites
- Node.js 16+ and npm or yarn
- A Supabase project (for auth and DB)

## Environment
Create a `.env.local` in the project root and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# (optional) SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Setup
Install dependencies and run the dev server:

```bash
npm install
npm run dev
# or: yarn && yarn dev
```

Open http://localhost:3000

## Scripts
- `dev` — run development server
- `build` — build for production
- `start` — run production server

## Project structure
- `components/` — React components (e.g., `ChatBubble.tsx`, `Layout.tsx`)
- `lib/` — helpers and clients (e.g., `supabaseClient.ts`)
- `pages/` — Next.js pages and API routes (e.g., `api/socketio.ts`)
- `styles/` — global CSS and Tailwind setup

## Notes
- See `lib/supabaseClient.ts` for how environment variables are referenced.

## Contributing
PRs and issues welcome. Keep changes focused and well-tested.
