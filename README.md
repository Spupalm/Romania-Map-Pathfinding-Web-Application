# Romania Map Pathfinding Web Application

An interactive web application for exploring routes between cities in Romania and comparing the performance of search algorithms. Users can choose a starting city and a destination, view the calculated route, and compare path cost, execution time, and memory usage.

The project uses a **Python FastAPI backend**, a **Next.js frontend**, and **Supabase** for authentication and saved route data.

## Features

- **Interactive Romania map:** Select a starting city and destination and visualize the route.
- **Algorithm comparison:** Compare a blind search algorithm with a custom heuristic search algorithm.
- **Performance results:** Review path cost, execution time, and memory usage.
- **User accounts:** Register and log in through the web interface.
- **Route history:** Save completed runs and review route details and results for the signed-in user.

## Technology Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript | Pages, map visualization, and user interaction |
| Backend | Python, FastAPI | Pathfinding calculations and performance results |
| Authentication and database | Supabase | User accounts, profiles, and saved routes |
| Frontend dependencies | npm | Install packages and run frontend scripts |

## Project Structure

| Path | Description |
| --- | --- |
| `main.py` | Python backend entry point |
| `requirements.txt` | Python dependencies referenced by the backend setup |
| `romania_frontend/` | Main Next.js application |
| `romania_frontend/app/` | Application pages and API routes |
| `romania_frontend/components/` | Reusable interface components |
| `romania_frontend/lib/` | Shared utilities and integration helpers |
| `romania_frontend/public/` | Static assets, including HTML login and registration pages |
| `romania_frontend/package.json` | Frontend dependencies and npm scripts |
| `romania_frontend/.env.local` | Local frontend configuration; do not commit |
| `supabase/migrations/` | SQL migrations for saved routes and profiles |
| `.env` | Local backend configuration; do not commit |
| `.venv/` | Local Python virtual environment |

`node_modules/` and `.next/` are generated locally when installing dependencies and running or building the frontend.

## Prerequisites

Install the following before starting:

- Git
- Python 3 and pip, using a version compatible with the backend dependencies
- Node.js and npm, using a version compatible with `romania_frontend/package.json`
- Access to the project's Supabase configuration, or a Supabase project of your own

> These instructions follow the existing project README and the current folder structure. Use the actual source configuration for environment variable names and the backend port; neither is specified here because those configuration files were not supplied for this documentation update.

## First-Time Setup

### 1. Clone the repository

```bash
git clone https://github.com/Spupalm/Romania-Map-Pathfinding-Web-Application.git
cd Romania-Map-Pathfinding-Web-Application
```

If you already have the repository, open its root folder instead. This is the folder containing `main.py` and `romania_frontend`.

### 2. Set up the Python environment

From the project root, run the commands for your operating system.

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

**Windows PowerShell**

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If `.venv` already exists, activate it and install the dependencies without recreating it. If `requirements.txt` is missing, obtain the project's dependency file before continuing.

### 3. Install frontend dependencies

From the project root:

```bash
cd romania_frontend
npm install
cd ..
```

### 4. Configure environment variables

Obtain the development configuration from the project team. The previous project instructions specify that the backend `.env` is shared separately through the team's Discord.

Place the configuration files at these locations:

| File | Configuration |
| --- | --- |
| `.env` at the project root | Backend environment variables |
| `romania_frontend/.env.local` | Frontend environment variables, including the Supabase configuration required by the application |

Use the variable names expected by the source code. If the repository provides an example environment file, copy it to the corresponding local filename and fill in the values.

Make sure the frontend's configured API address matches the address used by the running backend. Keep private keys and secrets out of source control and browser-exposed variables. Restart the affected development server after changing an environment file.

### 5. Set up the Supabase database

In the intended Supabase project, open the SQL Editor and apply any migrations that have not already been applied, in filename order:

1. Run `supabase/migrations/202609030001_create_saved_routes.sql`.
2. Run the profiles migration whose filename begins with `202609060001_create_profiles`.

Use the complete SQL files from the repository, including their policies and any supporting database objects. The saved-routes migration sets up the storage and Row Level Security policies used to isolate users' route records.

If you are using the team's existing Supabase project, first check which migrations have already been applied.

## Run the Application

Keep **two terminals open**: one for the backend and one for the frontend.

### Terminal 1 — Backend

Open the project root and activate the Python environment.

**macOS / Linux**

```bash
source .venv/bin/activate
python main.py
```

**Windows PowerShell**

```powershell
.\.venv\Scripts\Activate.ps1
python main.py
```

Keep this terminal running. Check its output for the backend address and any startup errors.

### Terminal 2 — Frontend

Open another terminal at the project root:

```bash
cd romania_frontend
npm run dev
```

Open the URL printed in the frontend terminal, typically:

```text
http://localhost:3000
```

Use the application's **Back to Home** link or visit `/main_page` to open the main page.

To stop the application, press `Ctrl+C` in each terminal.

## Using the Application

1. Open the frontend in your browser.
2. Register an account or log in to use account-related features.
3. Choose a starting city and a destination.
4. Select an available algorithm or comparison option.
5. Run the calculation and review the displayed route and results.
6. Compare path cost, execution time, and memory usage.
7. Save a completed run while signed in, then use the history page to review it.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `next: command not found` | Run `npm install` inside `romania_frontend`, then retry `npm run dev`. |
| npm cannot find `package.json` | Make sure the terminal is inside `romania_frontend`. |
| Python reports a missing module | Activate `.venv` and run `python -m pip install -r requirements.txt` from the project root. |
| `python` is not found on macOS | Create the environment with `python3`, then activate it before running the backend. |
| `Failed to fetch` during a calculation | Check that the backend is running, the frontend API address is correct, and the backend permits the frontend origin if requests are cross-origin. |
| Login or registration fails | Check the Supabase configuration and the error returned by the authentication API. |
| Saving or loading history fails | Confirm that the user is signed in, the migrations are applied, and the relevant database policies allow the operation. |
| The frontend uses a different port | Open the URL printed by Next.js and update any origin-dependent configuration if required. |
| Environment changes have no effect | Restart the backend or frontend after editing its environment file. |
| Clicking the Google icon does nothing | The supplied HTML contains only an image. Google OAuth must be connected and configured before Google sign-in is available. |

## Development Notes

- Run the main frontend from `romania_frontend`; the older instructions for `route_saving_test_frontend` are not part of this setup.
- Keep both development servers running while testing pathfinding features.
- Commit dependency manifests and database migrations so teammates can reproduce the setup.
- Do not commit `.env`, `.env.local`, `.venv/`, `node_modules/`, or `.next/`.
- Use the scripts listed in `romania_frontend/package.json` for any additional build or validation commands.