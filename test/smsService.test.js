const test = require("node:test");
const assert = require("node:assert/strict");

const { computeSmsSendAt } = require("../src/services/smsService");

test("computeSmsSendAt: appointmentStart <= now -> null", () => {
  const now = new Date("2026-03-10T10:00:00Z");
  const start = new Date("2026-03-10T10:00:00Z");
  assert.equal(computeSmsSendAt(start, now), null);
});

test("computeSmsSendAt: normal case -> start - 24h", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const start = new Date("2026-03-10T10:00:00Z");
  const sendAt = computeSmsSendAt(start, now, 24);
  assert.ok(sendAt instanceof Date);
  assert.equal(sendAt.toISOString(), "2026-03-09T10:00:00.000Z");
});

test("computeSmsSendAt: sendAt < now but start > now -> now + 1 min", () => {
  const now = new Date("2026-03-10T09:59:00Z");
  const start = new Date("2026-03-10T10:30:00Z");
  const sendAt = computeSmsSendAt(start, now, 24);
  assert.equal(sendAt.toISOString(), "2026-03-10T10:00:00.000Z");
});

test("computeSmsSendAt: leadHours=0 makes sendAt==start -> null", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const start = new Date("2026-03-10T10:00:00Z");
  assert.equal(computeSmsSendAt(start, now, 0), null);
});
