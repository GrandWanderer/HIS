const test = require("node:test");
const assert = require("node:assert/strict");

const { canSchedule } = require("../src/services/appointmentService");

function appt(overrides = {}) {
  return {
    patientId: 1,
    doctorUser: "U-DR-01",
    roomId: "R-101",
    serviceCode: "S-01",
    startAt: new Date("2026-03-10T10:00:00Z"),
    durationMin: 20,
    status: "Scheduled",
    ...overrides,
  };
}

test("canSchedule: invalid duration -> INVALID_DURATION", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const res = canSchedule(appt({ durationMin: 4 }), [], now);
  assert.equal(res.ok, false);
  assert.equal(res.reason, "INVALID_DURATION");
});

test("canSchedule: start in past -> PAST_START", () => {
  const now = new Date("2026-03-10T10:00:00Z");
  const res = canSchedule(appt({ startAt: new Date("2026-03-10T09:59:00Z") }), [], now);
  assert.equal(res.ok, false);
  assert.equal(res.reason, "PAST_START");
});

test("canSchedule: doctor overlap -> DOCTOR_BUSY", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const existing = [
    appt({ startAt: new Date("2026-03-10T10:00:00Z"), durationMin: 30, doctorUser: "U-DR-01", roomId: "R-102" }),
  ];
  const res = canSchedule(appt({ startAt: new Date("2026-03-10T10:10:00Z"), doctorUser: "U-DR-01", roomId: "R-101" }), existing, now);
  assert.equal(res.ok, false);
  assert.equal(res.reason, "DOCTOR_BUSY");
});

test("canSchedule: room overlap -> ROOM_BUSY", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const existing = [
    appt({ startAt: new Date("2026-03-10T10:00:00Z"), durationMin: 30, roomId: "R-101", doctorUser: "U-DR-02" }),
  ];
  const res = canSchedule(appt({ startAt: new Date("2026-03-10T10:05:00Z"), roomId: "R-101", doctorUser: "U-DR-01" }), existing, now);
  assert.equal(res.ok, false);
  assert.equal(res.reason, "ROOM_BUSY");
});

test("canSchedule: cancelled existing appt ignored", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const existing = [
    appt({ startAt: new Date("2026-03-10T10:00:00Z"), durationMin: 60, status: "Cancelled" }),
  ];
  const res = canSchedule(appt({ startAt: new Date("2026-03-10T10:30:00Z") }), existing, now);
  assert.equal(res.ok, true);
  assert.equal(res.reason, null);
});

test("canSchedule: no overlap when one ends exactly when other starts", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const existing = [
    appt({ startAt: new Date("2026-03-10T10:00:00Z"), durationMin: 30 }),
  ];
  const res = canSchedule(appt({ startAt: new Date("2026-03-10T10:30:00Z"), durationMin: 20 }), existing, now);
  assert.equal(res.ok, true);
  assert.equal(res.reason, null);
});
