## Current Status
- Backend derives schoolId from JWT → req.user and tenant resolver fallback (headers/body/query), then passes into controllers/services. See: [jwt.util.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/utils/jwt.util.ts), [auth.middleware.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/middleware/auth.middleware.ts), [tenant.middleware.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/middleware/tenant.middleware.ts), [express.d.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/types/express.d.ts).
- Routes use :schoolId for reads (config/grading/school). See: [config.routes.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/routes/config.routes.ts), [grading.routes.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/routes/grading.routes.ts), [school.routes.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/routes/school.routes.ts).
- Controllers/services consistently read/require schoolId via params/body and apply it in queries. See: [config.controller.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/controllers/config.controller.ts), [config.service.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/services/config.service.ts), [learner.controller.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/controllers/learner.controller.ts), [grading.controller.ts](file:///c:/Amalgamate/Projects/WebApps/server/src/controllers/grading.controller.ts).
- Frontend persists currentSchoolId and always sets X-School-Id; APIs use path params for reads and body for upserts. See: [LoginForm.jsx](file:///c:/Amalgamate/Projects/WebApps/src/components/auth/LoginForm.jsx), [api/index.js](file:///c:/Amalgamate/Projects/WebApps/src/services/api/index.js), [api.js](file:///c:/Amalgamate/Projects/WebApps/src/services/api.js), [AcademicSettings.jsx](file:///c:/Amalgamate/Projects/WebApps/src/components/CBCGrading/pages/settings/AcademicSettings.jsx).

## Gaps to Address
- Legacy "schoolId" localStorage key appears in some components; standard should be "currentSchoolId".
- Potential mismatch risks between JWT schoolId, path param :schoolId, and X-School-Id header are not explicitly cross-validated.
- Minor query-param usages of schoolId could be standardized to header/param consistently.

## Proposed Changes
- Add middleware to enforce consistency: if req.user.schoolId exists, require match with header and :schoolId when provided; return 400 on mismatch.
- Normalize frontend context: replace any use of localStorage "schoolId" with "currentSchoolId" and ensure interceptors and API calls read one canonical key.
- Standardize endpoints: prefer path param for reads and header/JWT for context; keep body.schoolId only for bulk upserts where needed.

## Verification & Tests
- Add unit/integration tests for config/grading/learner endpoints covering: JWT-only, header-only, param-only, and mismatch scenarios.
- Add frontend smoke test to assert X-School-Id header is present on authenticated requests and that context selection updates it.
- Validate grading systems fetch aligns with the agreed standard path `/grading/school/:schoolId` and client usage of `getSystems(schoolId)` <mccoremem id="03fgnzcn7bp6n71hwve0rbbxu" />.

## Documentation
- Document the canonical schoolId flow (JWT → req.user → tenant → controllers/services), fallback order, and frontend storage/header conventions in a short developer guide.
- Note that Phase 1 config routes are mounted and protected; schoolId is required for these flows <mccoremem id="03fgfssq066c91yq26cowm1d2" />.

## Outcome
- Confirm implementation is correct and consistent; harden against cross-tenant mismatches; ensure frontend uses a single canonical context source; provide tests and docs to prevent regressions.