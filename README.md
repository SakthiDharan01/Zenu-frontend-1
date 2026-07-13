# ZenU Frontend

Next.js 14 (App Router) experience for the ZenU wellness platform. This UI now talks to the ZenU backend for authentication, relying on HTTP-only Supabase cookies.

## Getting started

```powershell
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` by default. The backend should be available at `http://localhost:3001` (or whatever you configure below).

## Environment

Create a `.env.local` file with at least:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`NEXT_PUBLIC_API_URL` must point to the Express backend so the frontend can call `/api/auth/*`, `/api/me`, and `/api/logout` with credentials. When deploying, update this value to the backend URL that sets the Supabase cookies. For the Render deployment, set `NEXT_PUBLIC_API_URL=https://zenu-backend.onrender.com` so the frontend talks to the hosted API (including the new `/api/status` health check).

## Auth flows

- `src/lib/authClient.ts` centralises calls to the backend and raises an auth change event when the session updates.
- `src/components/layout/Navigation.tsx` listens for those events to render the signed-in user name and expose logout.
- `src/app/signin/page.tsx` and `src/app/signup/page.tsx` contain forms that post to the backend. Successful actions redirect back to the home page and refresh the layout.

The UI honours the backend contract of returning `{ user: mapUser(user) }` and keeps credentials in cookies—no tokens ever hit localStorage.
