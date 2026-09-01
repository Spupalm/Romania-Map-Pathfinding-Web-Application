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

### Install dependencies

**Backend:**
```bash
python -m venv .venv
source .venv/bin/activate      # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd romania_frontend
npm install                    # or bun install
```

## Running the Project

You'll need two terminals running at the same time — one for the backend, one for the frontend.

**1. Start the backend** (from the project root):
```bash
python main.py
```

**2. Start the frontend** (in a separate terminal):
```bash
cd romania_frontend
npm run dev
```
or, if you have Bun installed:
```bash
bun dev
```

Then open the URL shown in the frontend terminal (typically `http://localhost:3000`) in your browser.

## Project Structure

```
Romania-Map-Pathfinding-Web-Application/
├── main.py                # FastAPI backend entry point
├── requirements.txt        # Python dependencies
├── romania_frontend/       # Next.js frontend
│   ├── app/
│   ├── components/
│   └── ...
└── .env                    # Not tracked in git — shared via Discord
```

## Features

- Select any start and destination city on an interactive map of Romania
- Compare a blind search algorithm against a custom heuristic search algorithm
- View execution time, memory usage, and path cost side by side
- View search history of previous queries