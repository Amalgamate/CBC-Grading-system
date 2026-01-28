## Goals
- Establish a single, reliable source of truth for tenant identity (schoolId + optional branchId)
- Ensure backend and frontend consistently carry tenant context through login, storage, and every request
- Handle SUPER_ADMIN with no schoolId while enabling tenant-scoped operations

## Proposed Model
- User fields (already present): schoolId nullable, branchId nullable
- Tenancy context (derived per request/session):
  - tenant.schoolId (required for tenant-scoped ops)
  - tenant.branchId (optional)
- SUPER_ADMIN: no schoolId; can specify target school/branch via query/body or by switching context UI

## Backend Changes
- Auth /me: always return { schoolId, branchId, school { id, name }, branch { id, name, code } }
- Tenant resolution middleware (new):
  - If req.user.schoolId present → tenant.schoolId = req.user.schoolId
  - Else, allow override via header X-School-Id or query/body schoolId
  - Validate existence; reject if missing for tenant-scoped routes
- Apply middleware to tenant-scoped routes (config, users, classes, etc.)
- Streams upsert/list/delete: remove reliance on client for schoolId when possible; prefer middleware-provided tenant.schoolId
- SUPER_ADMIN policy: permit operations with explicit schoolId; without schoolId, list schools; default school allowed for demos

## Frontend Changes
- On login, store user { schoolId, branchId, school, branch } in AuthContext
- TenancyContext (new):
  - currentSchoolId, currentBranchId; default from user; allow switching via dropdown (for SUPER_ADMIN)
  - Provide context to API calls
- services/api fetchWithAuth:
  - Attach X-School-Id and X-Branch-Id headers if context set
- Settings pages:
  - Use TenancyContext to load and mutate tenant data
  - If SUPER_ADMIN without context, show school/branch selector banner before actions

## Data Seeding/Defaults
- Keep "Default School" for demo
- SUPER_ADMIN: no schoolId; UI prompts to choose a school before tenant actions

## Rollout Plan
1) Backend: add tenant resolution middleware; wire to config routes
2) Backend: update /auth/me to always return school/branch snapshot
3) Frontend: add TenancyContext; update fetchWithAuth to include headers; prompt selection if missing
4) Verify: login as ADMIN (school-bound) and SUPER_ADMIN (no school) across Streams/Terms

## Expected Outcome
- Streams list appears reliably because schoolId always resolves
- SUPER_ADMIN can operate across schools by selecting context explicitly
- All tenant-scoped operations consistently use the same identity path