const test = require("node:test");
const assert = require("node:assert/strict");

const { requirePermission } = require("../src/services/authzService");
const { AuthorizationError } = require("../src/utils/errors");

test("requirePermission: ADMIN has patients.write", () => {
  assert.doesNotThrow(() => requirePermission("ADMIN", "patients.write"));
});

test("requirePermission: unknown role -> AuthorizationError", () => {
  assert.throws(() => requirePermission("UNKNOWN", "patients.read"), AuthorizationError);
});

test("requirePermission: role without permission -> AuthorizationError", () => {
  assert.throws(() => requirePermission("ACCOUNTANT", "patients.write"), AuthorizationError);
});
