## Goal
Run the entire app with one command from the project root: start the backend once, then automatically start the frontend when the backend is healthy.

## Proposed Approach
- Add a single root npm script that:
  - Launches the backend (server directory, nodemon) on PORT=5001.
  - Waits for backend health (http://localhost:5001/api/health) to become ready.
  - Starts the frontend (root `npm start`).
- Use `concurrently` and `wait-on` to orchestrate both processes cleanly in one command.

## Script Changes (root package.json)
- devDependencies: add `concurrently` and `wait-on`.
- Scripts:
  - backend: `npm --prefix server run dev`
  - frontend: `npm start`
  - dev: `concurrently -n back,front -c blue,green "powershell -Command \"$env:PORT=5001; npm --prefix server run dev\"" "wait-on http://localhost:5001/api/health && npm start"`

## Env Alignment
- Confirm `.env` at project root has: `REACT_APP_API_URL=http://localhost:5001/api`.
- Backend uses PORT=5001 (set inline in the script).

## Windows PowerShell Alternative (optional)
- Add `Run-All.ps1` that:
  - Sets `$env:PORT=5001`.
  - Starts backend job in `server`.
  - Polls `/api/health` until OK.
  - Runs `npm start` in root.
- Add `npm run all` to invoke the script.

## How You Will Run
- From the root, run: `npm run dev`.
- This runs backend once and triggers frontend startup automatically.

## Verification Steps
- Open http://localhost:5001/api/health → should be healthy.
- Frontend should open on http://localhost:3000 and load data from backend.

## Stop/Restart
- Use Ctrl+C once to stop both processes.
- Re-run `npm run dev`.

## Next Actions
- I will add `concurrently`/`wait-on`, update root scripts, and validate that one command reliably starts both apps on Windows.
