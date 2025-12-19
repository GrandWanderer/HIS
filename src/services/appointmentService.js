const { AppointmentError } = require("../utils/errors");
const { intervalsOverlap, addMinutes } = require("../utils/timeUtils");

/**
 * Перевірка можливості запису (R1.3).
 *
 * AppointmentDTO:
 * { patientId, doctorUser, roomId, serviceCode, startAt: Date, durationMin: number, status: string }
 *
 * Вимоги (під unit-тести):
 * - durationMin: 5..240
 * - startAt не може бути в минулому (startAt < now -> заборонено)
 * - конфлікт, якщо перетинається інтервал з існуючим appointment того ж doctorUser
 * - конфлікт, якщо перетинається інтервал з існуючим appointment того ж roomId
 * - appointment зі статусом Cancelled не враховується
 *
 * @returns {{ok: boolean, reason: string|null}}
 */
function canSchedule(newAppt, existing, now) {
  if (newAppt.durationMin < 5 || newAppt.durationMin > 240) return { ok: false, reason: "INVALID_DURATION" };
  if (newAppt.startAt < now) return { ok: false, reason: "PAST_START" };

  const newEnd = addMinutes(newAppt.startAt, newAppt.durationMin);

  for (const appt of existing) {
    if (appt.status === "Cancelled") continue;
    const apptEnd = addMinutes(appt.startAt, appt.durationMin);

    if (appt.doctorUser === newAppt.doctorUser && intervalsOverlap(newAppt.startAt, newEnd, appt.startAt, apptEnd)) {
      return { ok: false, reason: "DOCTOR_BUSY" };
    }
    if (appt.roomId === newAppt.roomId && intervalsOverlap(newAppt.startAt, newEnd, appt.startAt, apptEnd)) {
      return { ok: false, reason: "ROOM_BUSY" };
    }
  }

  return { ok: true, reason: null };
}

function scheduleOrThrow(newAppt, existing, now) {
  const { ok, reason } = canSchedule(newAppt, existing, now);
  if (!ok) throw new AppointmentError(reason || "CANNOT_SCHEDULE");
}

module.exports = { canSchedule, scheduleOrThrow };
