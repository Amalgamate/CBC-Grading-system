# SchoolId Flow (Frontend)

- Context storage: currentSchoolId in localStorage is the canonical key.
- Headers: API layers add X-School-Id/X-Branch-Id from currentSchoolId.
- Page components:
  - Prefer user?.school?.id or user?.schoolId first.
  - Fallback to localStorage.getItem('currentSchoolId').
- Usage patterns:
  - Reads: pass :schoolId in path for endpoints that require it (e.g., grading systems).
  - Writes: include schoolId in request body if the API expects it (e.g., performance scales).
- Consistency: selected school in Academic Settings updates currentSchoolId; components should not read legacy 'schoolId' key.
