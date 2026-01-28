# EDucore V1.0 — Integration Plan

## Objectives
- Introduce a comprehensive multi‑tenant frontend without disrupting existing modules.
- Add landing, registration/trial, and role‑specific authentication flows.
- Maintain current state‑based routing and RBAC; avoid breaking server APIs.

## Fit With Current System
- Routing: integrate pages via currentPage switch in CBCGradingSystem and Sidebar items (optional). No React Router change.
- Auth: reuse existing JWT/RBAC with schoolId/branchId; Super Admin retains system oversight and can see all schools (already present in portal).
- Trial: represent 30‑day trial in UI initially; backend schema/migrations planned, not applied yet to avoid disruption.

## Pages & Components (added)
- EDucoreLanding: marketing/entry page with Login/Get Started.
- Registration: plan selection (modules, branches), starts 30‑day trial (client‑side payload).
- SuperAdminPortal: school selection and trial/payment oversight; no special‑casing for any school.

## Backend Alignment
- Continue using headers and JWT for school context <mccoremem id="03fgnzcn7bp6n71hwve0rbbxu|03fgfssq066c91yq26cowm1d2" />.
- No schema changes applied yet. Planned additions:
  - School: trialStart (DateTime), trialDays (Int), status (ACTIVE/INACTIVE/TRIAL)
  - SubscriptionPlan: id, name, modules (Json), maxBranches (Int)
  - SchoolSubscription: schoolId, planId, startedAt, expiresAt, status

## Trial & Payment Flow (Planned)
- Registration sets trialStart and trialDays=30; UI shows countdown.
- On expiry, status set to INACTIVE; frontend displays payment required notice.
- Super Admin dashboard exposes approve/reactivate actions; server endpoints to be added after schema migration approval.

## Security & UX
- RBAC enforced via existing middleware; session management unchanged.
- Clear trial status indicators; consistent branding; WCAG 2.1 AA styles.

## Testing
- Extend Jest/Cypress: landing navigation, registration submission, Super Admin oversight visibility, mobile responsiveness snapshots.

## Next Steps
- Wire EDucore pages into Sidebar/CBCGradingSystem with a feature flag.
- Implement backend schema migrations (Prisma) after approval.
- Add API endpoints for subscription/trial management.
