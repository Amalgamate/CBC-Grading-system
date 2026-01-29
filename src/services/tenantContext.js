/**
 * Tenant Context (Client)
 *
 * Centralized storage helpers for:
 * - Portal tenant (tenant-first URL context: /t/:schoolId/...)
 * - Super-admin switched tenant context (used for admin tooling)
 * - Optional branch context
 *
 * IMPORTANT:
 * - For normal users, tenant is authoritative from JWT on the server.
 * - Portal tenant is used for branding + mismatch detection only.
 */
export const TENANT_STORAGE_KEYS = Object.freeze({
  PORTAL_SCHOOL_ID: 'tenantSchoolId',
  ADMIN_SCHOOL_ID: 'currentSchoolId',
  BRANCH_ID: 'currentBranchId',
  USER: 'user',
});

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(TENANT_STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredUserRole() {
  return getStoredUser()?.role || null;
}

export function isStoredUserSuperAdmin() {
  return getStoredUserRole() === 'SUPER_ADMIN';
}

// ---------------------------
// Portal tenant (tenant-first)
// ---------------------------
export function getPortalSchoolId() {
  return localStorage.getItem(TENANT_STORAGE_KEYS.PORTAL_SCHOOL_ID) || null;
}

export function setPortalSchoolId(schoolId) {
  if (!schoolId) return;
  localStorage.setItem(TENANT_STORAGE_KEYS.PORTAL_SCHOOL_ID, schoolId);
}

export function clearPortalSchoolId() {
  localStorage.removeItem(TENANT_STORAGE_KEYS.PORTAL_SCHOOL_ID);
}

// ---------------------------
// Admin switched tenant
// ---------------------------
export function getAdminSchoolId() {
  return localStorage.getItem(TENANT_STORAGE_KEYS.ADMIN_SCHOOL_ID) || null;
}

export function setAdminSchoolId(schoolId) {
  if (!schoolId) return;
  localStorage.setItem(TENANT_STORAGE_KEYS.ADMIN_SCHOOL_ID, schoolId);
}

export function clearAdminSchoolId() {
  localStorage.removeItem(TENANT_STORAGE_KEYS.ADMIN_SCHOOL_ID);
}

// ---------------------------
// Branch context
// ---------------------------
export function getBranchId() {
  return localStorage.getItem(TENANT_STORAGE_KEYS.BRANCH_ID) || null;
}

export function setBranchId(branchId) {
  if (!branchId) return;
  localStorage.setItem(TENANT_STORAGE_KEYS.BRANCH_ID, branchId);
}

export function clearBranchId() {
  localStorage.removeItem(TENANT_STORAGE_KEYS.BRANCH_ID);
}

