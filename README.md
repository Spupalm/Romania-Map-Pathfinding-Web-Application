# Romania Map Pathfinding Web Application

The Romania Map Pathfinding Web Application allows users to select any start and destination cities, then compares one blind search algorithm and one custom heuristic search algorithm. The system evaluates execution time, memory usage, and path cost through an interactive, user-friendly web interface.

## Tech Stack

- **Backend:** Python (FastAPI)
- **Frontend:** Next.js / React (TypeScript)

## Getting Started (first time setup)

If you're opening this project for the first time, do this first:

```bash
cd ~/Desktop
git clone https://github.com/Spupalm/Romania-Map-Pathfinding-Web-Application.git
cd Romania-Map-Pathfinding-Web-Application
```

### Environment variables

`.env` is **not** included in this repo — it's shared separately in Discord. Add it to the project root before running the backend.

The original `romania_frontend` is kept unchanged. Authentication and saved-route
testing live in the separate `route_saving_test_frontend` application. Copy
`route_saving_test_frontend/.env.example` to
`route_saving_test_frontend/.env.local` and fill in the Supabase URL and
publishable key.
Then run `supabase/migrations/202609030001_create_saved_routes.sql` in the
Supabase SQL editor (or with the Supabase CLI). The migration creates the table,
indexes, and Row Level Security policies that isolate every user's records.

### Install dependencies

**Backend:**
```bash
python -m venv .venv
source .venv/bin/activate      # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Original frontend:**
```bash
cd romania_frontend
npm install                    # or bun install
```

**Route Saving test frontend:**
```bash
cd route_saving_test_frontend
npm install
```

## Running the Project

You'll need two terminals running at the same time — one for the backend, one for the frontend.

**1. Start the backend** (from the project root):
```bash
python main.py
```

**2a. Start the original frontend** (in a separate terminal):
```bash
cd romania_frontend
npm run dev
```

**2b. Or start the Route Saving test frontend instead:**
```bash
cd route_saving_test_frontend
npm run dev
```

Run only one frontend at a time unless you deliberately assign different ports.

Then open the URL shown in the frontend terminal (typically `http://localhost:3000`) in your browser.

## Project Structure

```
Romania-Map-Pathfinding-Web-Application/
├── main.py                # FastAPI backend entry point
├── requirements.txt        # Python dependencies
├── romania_frontend/       # Original Next.js frontend (unchanged)
│   ├── app/
│   ├── components/
│   └── ...
├── route_saving_test_frontend/ # Isolated Route Saving test application
├── supabase/migrations/    # saved_routes database migration
└── .env                    # Not tracked in git — shared via Discord
```

## Features

- Select any start and destination city on an interactive map of Romania
- Compare a blind search algorithm against a custom heuristic search algorithm
- View execution time, memory usage, and path cost side by side
- The isolated test frontend can save a completed run for the signed-in user
- The isolated test frontend can reload route configuration, ordered workflow
  steps, algorithm, path cost, execution time, and peak Python memory
