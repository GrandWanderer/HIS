const { AuthorizationError } = require("../utils/errors");

// Простий RBAC (R1.9): роль -> дозволені дії
const ROLE_PERMISSIONS = {
  ADMIN: new Set(["patients.read", "patients.write", "appointments.write", "payments.write", "reports.read"]),
  DOCTOR: new Set(["patients.read", "appointments.write", "records.write"]),
  ACCOUNTANT: new Set(["payments.write", "reports.read"]),
  MANAGER: new Set(["reports.read"]),
};

/**
 * Вимоги:
 * - якщо роль невідома або permission відсутній -> AuthorizationError
 * - інакше -> OK
 */
function requirePermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms || !perms.has(permission)) {
    throw new AuthorizationError(`Role ${role} has no permission ${permission}`);
  }
}

module.exports = { ROLE_PERMISSIONS, requirePermission };
