# Route Saving Test Frontend

This application is an isolated copy used only to test the Route Saving System.
The existing `../romania_frontend` application remains on its original `main`
implementation and does not contain the Route Saving integration.

## Run locally

Start the FastAPI service from the repository root:

```powershell
python main.py
```

In a second terminal, start this test frontend:

```powershell
cd route_saving_test_frontend
npm install
npm run dev
```

Open `http://localhost:3000/main_page`, sign in, select a route and algorithm,
enable **Save this run**, and run the search. Confirm that execution time,
peak memory, path cost, workflow steps, History, and Load route all work.

Do not run `romania_frontend` at the same time on the default port.
