## What The Terminal Messages Mean
- no-unused-vars: Variables or imports are declared but never used. They add noise and can hide real issues. Examples:
  - SummaryReportPage.jsx: reportData assigned but never used
  - UserManagement.jsx: UserCheck imported but unused
  - DownloadReportButton.jsx: FileText imported but unused
  - BulkOperationsModal.jsx: API_BASE_URL imported but unused
  - AssignClassModal.jsx: Users icon imported but unused; fetchingWorkload variable never used
  - AddEditParentModal.jsx: handleLearnerToggle defined but unused

- react-hooks/exhaustive-deps: useEffect depends on values that are used inside the effect but missing from the dependency array. This can cause stale closures or inconsistent behavior.
  - AcademicSettings.jsx: uses loadConfigs inside useEffect but doesn’t include it in deps
  - AssignClassModal.jsx: uses fetchTeacherWorkload inside useEffect but missing in deps
  - SummativeTestForm.jsx: uses loadGrades inside useEffect but missing in deps

- import/no-anonymous-default-export: Exporting an anonymous object/function as default makes stack traces and tooling less helpful.
  - academicYear.js, simplePdfGenerator.js: Should export a named const (or function) and then default-export that name

- Webpack dev server deprecation warnings: onAfterSetupMiddleware / onBeforeSetupMiddleware are deprecated. They come from react‑scripts/webpack‑dev‑server internals and are benign. Upgrading to the latest CRA or switching to Vite would remove them.

- Port 3000 in use: Occurred when the frontend dev server was already running. The unified dev script now kills ports 3000/5001 up front.

## Plan to Fix
- Remove unused imports/variables across affected files
- Stabilize useEffect dependencies:
  - Wrap functions used in effects with useCallback and include them in deps, or inline logic inside useEffect to avoid extra deps
- Refactor anonymous default exports:
  - e.g., const academicYearConfig = { ... }; export default academicYearConfig;
  - e.g., const simplePdf = { ... }; export default simplePdf;
- Add npm script: "lint:fix" (already present) and run it; manually fix remaining hook warnings that autofix cannot handle
- Optional: upgrade dev server to suppress deprecation warnings later; not required for functionality

## Execution Steps
1. Apply lint fixes:
   - Remove unused imports/vars; refactor anonymous default exports
2. Fix useEffect deps with useCallback or inlining logic
3. Run npm run lint:fix and verify clean compile
4. Validate unified dev start: npm run dev (backend 5001; frontend 3000)

## Expected Outcome
- Clean dev compile (zero ESLint warnings in terminal)
- Stable effects without stale closures
- Unified dev startup consistently launching backend and frontend