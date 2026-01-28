## Goal
Fetch all users and save them into a text document at the project root, and mark that document so it is not removed in future cleanups.

## Proposed Implementation
- Create a server-side export script that queries the database directly (using existing Prisma client) to avoid login/auth token requirements.
- The script outputs a human-readable snapshot to a root file named: USERS_SNAPSHOT__PROTECTED__.txt
- Include a clear header, timestamp, and selected fields: id, firstName, lastName, email, phone, role, status (plus school/branch if present).
- Update root .gitignore with a visible comment/tag indicating this file is protected and should not be removed. (Gitignore doesn’t delete files; this acts as an explicit marker for developers to keep it.)
- Optionally add a root .cleanup-protect.json listing protected files for any future automated cleanup tooling.

## Script Details
- Location: server/scripts/export-users.ts
- Logic:
  - Import prisma from server/src/config/database
  - Query prisma.user.findMany({ select: { id, firstName, lastName, email, phone, role, status, schoolId, branchId } })
  - Format lines as CSV-like text or tab-separated; include a header and ISO timestamp
  - Write to ../../USERS_SNAPSHOT__PROTECTED__.txt (project root) and print a summary

## Project Markers
- Root .gitignore: add comment block
  - # PROTECTED: USERS_SNAPSHOT__PROTECTED__.txt (do not remove during cleanup)
- Optional: add .cleanup-protect.json with ["USERS_SNAPSHOT__PROTECTED__.txt"] so future maintenance scripts can respect it

## Usage
- Run once (with backend off or on, doesn’t matter):
  - npx ts-node server/scripts/export-users.ts
- Or add npm script at root: "export:users": "npx ts-node server/scripts/export-users.ts"

## Verification
- Confirm file exists at project root: USERS_SNAPSHOT__PROTECTED__.txt
- Open it and check header, timestamp, and entries.
- Re-run the export after user changes to refresh snapshot.

## Note on Alternatives
- If you prefer fetching via HTTP with auth, I can provide an alternative script that calls GET /api/users using an AUTH_TOKEN env var; the Prisma approach is simpler and avoids token management.
