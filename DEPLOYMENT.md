# Deployment Guide

This guide deploys the app as three pieces:

| Piece | Host | Notes |
| --- | --- | --- |
| FastAPI backend (`main.py`) | **Render** | Free web service, public HTTPS URL |
| Next.js frontend (`romania_frontend/`) | **Vercel** | Free tier, native Next.js support |
| Supabase (auth + database) | **Supabase** (already hosted) | Only need to apply migrations + set redirect URLs |

The order matters: deploy the **backend first** so you have its URL, then the
frontend (which needs that URL), then wire up Supabase redirects.

---

## Prerequisites

- The repo is pushed to GitHub: `github.com/Spupalm/Romania-Map-Pathfinding-Web-Application`
- A [Render](https://render.com) account (sign up with GitHub)
- A [Vercel](https://vercel.com) account (sign up with GitHub)
- Access to the Supabase project used by this app

> **Commit the new config files first.** This branch now includes `render.yaml`,
> the root `.gitignore`, and `romania_frontend/.env.example`. Commit and push them
> (and merge to your main branch if you want the hosts to auto-deploy from `main`).

---

## 1. Deploy the backend to Render

### Option A — Blueprint (uses `render.yaml`)

1. In the Render dashboard, click **New +** -> **Blueprint**.
2. Connect the GitHub repo. Render reads `render.yaml` and proposes a web
   service named `romania-pathfinding-api`.
3. Click **Apply**. Render runs:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Wait for the deploy to finish, then note the service URL, e.g.
   `https://romania-pathfinding-api.onrender.com`.

### Option B — Manual web service

1. **New +** -> **Web Service** -> connect the repo.
2. Settings:
   - Runtime: **Python 3**
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free
3. Create the service and note its URL.

### Verify the backend

Open `https://<your-render-url>/docs` in a browser. You should see the FastAPI
interactive docs. You can test `POST /api/search` there with a body like:

```json
{ "start": "Arad", "goal": "Bucharest", "algorithm": "A*" }
```

> **Free-tier note:** Render free services sleep after inactivity, so the first
> request after idle can take ~30–60s to wake. Not a bug.

---

## 2. Deploy the frontend to Vercel

1. In Vercel, click **Add New** -> **Project** and import the GitHub repo.
2. **Set the Root Directory to `romania_frontend`** (important — the Next.js app
   is in a subfolder, not the repo root).
3. Vercel auto-detects Next.js. Leave build/output settings at defaults.
4. Add **Environment Variables** (Project Settings -> Environment Variables).
   Use the same names as `romania_frontend/.env.example`:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | Your Render backend URL (from step 1), e.g. `https://romania-pathfinding-api.onrender.com` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel URL (see note below) |

5. Click **Deploy**. Vercel gives you a URL like `https://your-app.vercel.app`.
6. **Update `NEXT_PUBLIC_SITE_URL`** to that Vercel URL and redeploy (the auth
   callback uses it to build redirect links). If you know your production domain
   ahead of time, set it before the first deploy to avoid the extra redeploy.

> All `NEXT_PUBLIC_*` values are bundled into the browser build, so a change to
> any of them requires a redeploy to take effect.

---

## 3. Wire up Supabase

### Apply migrations (if not already applied)

In the Supabase dashboard -> **SQL Editor**, run each file in order using the
full contents from `supabase/migrations/`:

1. `202609030001_create_saved_routes.sql`
2. `202609060001_create_profiles.sql`

If you're reusing an existing Supabase project, check first which migrations were
already applied so you don't run them twice.

### Set redirect / URL configuration

In **Authentication -> URL Configuration**:

- **Site URL**: your Vercel URL, e.g. `https://your-app.vercel.app`
- **Redirect URLs**: add
  - `https://your-app.vercel.app/api/auth/callback`
  - `http://localhost:3000/api/auth/callback` (keep local dev working)

If you use Google sign-in, configure the Google provider under
**Authentication -> Providers** and add the same callback URLs to the Google
OAuth client in Google Cloud Console.

---

## 4. Final check

1. Open your Vercel URL.
2. Go to the main page, pick a start and destination, choose an algorithm, run a
   calculation. A successful route confirms the frontend can reach the Render
   backend (`NEXT_PUBLIC_API_URL` is correct and CORS is open).
3. Register / log in, then save a run and open the History page to confirm
   Supabase auth and the migrations work.

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| `Cannot connect to the Python server` on calculation | `NEXT_PUBLIC_API_URL` is wrong or unset in Vercel, or the Render service is asleep (retry after ~30s). |
| First request very slow | Render free tier cold start. Expected. |
| Login redirects to an error page | `NEXT_PUBLIC_SITE_URL` doesn't match the deployed domain, or the callback URL isn't in Supabase's Redirect URLs list. |
| Auth works locally but not in prod | Add the production callback URL to Supabase and confirm the Supabase keys in Vercel are the real project keys, not placeholders. |
| Env change didn't take effect | Redeploy — `NEXT_PUBLIC_*` vars are baked in at build time. |
| Backend deploy fails on Render | Check the build log; confirm `requirements.txt` installs and the start command is `uvicorn main:app --host 0.0.0.0 --port $PORT`. |

---

## Notes on the changes made for deployment

- `main.py` now reads `HOST`/`PORT` from the environment (defaults
  `127.0.0.1:8000` locally), so it binds correctly on Render via `$PORT`.
- `render.yaml` is a Render Blueprint for one-click backend setup.
- Root `.gitignore` keeps `.venv/`, `.env`, `node_modules/`, etc. out of git.
- `romania_frontend/.env.example` documents every env var the frontend needs.
- The backend CORS is currently `allow_origins=["*"]`. That works for any
  frontend origin. To lock it down later, replace `"*"` in `main.py` with your
  exact Vercel URL.
