\
const { ValidationError } = require("./errors");

/**
 * Нормалізація телефону до E.164 (Україна).
 *
 * Вимоги (під unit-тести):
 * - Дозволяються пробіли, дужки, дефіси — вони прибираються.
 * - Підтримка: +380XXXXXXXXX (9 цифр після 380), або 0XXXXXXXXX (перетворюється в +380...).
 * - Інакше -> ValidationError.
 */
function normalizePhoneUA(phone) {
  if (phone === null || phone === undefined) throw new ValidationError("phone is required");
  const raw0 = String(phone).trim();
  const raw = raw0.replace(/[\s\-\(\)]/g, "");

  let normalized = raw;
  if (normalized.startsWith("0") && normalized.length === 10) {
    normalized = "+38" + normalized;
  }

  if (!normalized.startsWith("+380")) {
    throw new ValidationError("phone must start with +380 or 0XXXXXXXXX");
  }
  if (!/^\+380\d{9}$/.test(normalized)) {
    throw new ValidationError("phone must be +380 followed by 9 digits");
  }
  return normalized;
}

/**
 * Вимоги:
 * - 2..200 символів
 * - не може складатися лише з пробілів
 */
function validateFullName(fullName) {
  if (fullName === null || fullName === undefined) throw new ValidationError("full_name is required");
  const v = String(fullName).trim();
  if (v.length < 2 || v.length > 200) {
    throw new ValidationError("full_name length must be 2..200");
  }
}

/**
 * Вимоги:
 * - дата народження не в майбутньому
 * - не раніше 1900-01-01
 *
 * Параметр dobIso: рядок YYYY-MM-DD
 */
function parseAndValidateDob(dobIso, nowDate = new Date()) {
  if (!dobIso) throw new ValidationError("dob is required");
  const d = new Date(dobIso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) throw new ValidationError("dob invalid format");

  const todayUtc = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate()));
  if (d.getTime() > todayUtc.getTime()) throw new ValidationError("dob cannot be in the future");

  const min = new Date("1900-01-01T00:00:00Z");
  if (d.getTime() < min.getTime()) throw new ValidationError("dob is too old / invalid");
  return d;
}

module.exports = { normalizePhoneUA, validateFullName, parseAndValidateDob };
