<<<<<<< HEAD
# whatsapp
=======
# Chat App (Next.js + TypeScript + Socket.IO + Supabase)

A starter chat application scaffold using Next.js, TypeScript, Socket.IO for realtime messaging and Supabase for auth and data.

Features included in this scaffold:
- Next.js + TypeScript
- Socket.IO API route for realtime messaging
- Supabase client integration (auth + user profiles)
- Pages: login, chat, profile, admin
- Basic WhatsApp-like theme CSS

Environment variables (create `.env.local`):

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<optional-service-role-key-for-admin>

Install & run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

Tailwind
------

Tailwind is configured. After running `npm install`, the Tailwind directives in `styles/globals.css` are processed by PostCSS when Next.js builds.

>>>>>>> 1b7088f (first commit)
