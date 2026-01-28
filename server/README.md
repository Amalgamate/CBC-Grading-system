# SchoolId Flow (Backend)

- Source of truth: JWT payload (req.user.schoolId) when present; otherwise X-School-Id header; optionally body/query for upserts.
- Middleware:
  - authenticate: attaches req.user from JWT.
  - tenantResolver: derives tenant.schoolId from JWT/header/body/query.
  - enforceSchoolConsistency: rejects mismatches between JWT, header, and :schoolId param; sets tenant.schoolId canonically (param → JWT → header → body/query).
- Routes:
  - Reads use :schoolId in path for clarity (e.g., /config/term/:schoolId, /grading/school/:schoolId, /schools/:schoolId/...).
  - Writes/upserts accept schoolId in body when needed.
- Controllers/services consistently consume tenant.schoolId to scope data access.

Recommended client behavior:
- Always set X-School-Id header.
- Ensure :schoolId path values match the selected school context to avoid 400 errors.
