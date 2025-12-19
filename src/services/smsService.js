/**
 * Розрахунок часу відправки SMS-нагадування (R1.4).
 *
 * Вимоги (під unit-тести):
 * - Базово sendAt = appointmentStart - leadHours
 * - Якщо sendAt < now: відправити "якнайшвидше" = now + 1 хв
 * - Якщо appointmentStart <= now: null (візит уже почався/минув)
 * - Якщо sendAt >= appointmentStart: null (некоректна конфігурація)
 */
function computeSmsSendAt(appointmentStart, now, leadHours = 24) {
  if (appointmentStart <= now) return null;
  const sendAt = new Date(appointmentStart.getTime() - leadHours * 3600_000);
  if (sendAt >= appointmentStart) return null;
  if (sendAt < now) return new Date(now.getTime() + 60_000);
  return sendAt;
}

module.exports = { computeSmsSendAt };
