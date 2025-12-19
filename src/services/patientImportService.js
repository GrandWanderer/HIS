const { normalizePhoneUA, validateFullName, parseAndValidateDob } = require("../utils/validators");
const { ValidationError } = require("../utils/errors");

const REQUIRED_COLUMNS = new Set(["full_name", "dob", "phone", "email"]);

/**
 * Простий CSV line parser з підтримкою лапок.
 * Не повністю RFC4180, але достатньо для лабораторного прикладу.
 */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Імпорт пацієнтів з CSV (R1.13).
 *
 * Вимоги (під unit-тести):
 * - CSV має містити колонки: full_name,dob,phone,email (порядок неважливий)
 * - dob у форматі YYYY-MM-DD
 * - телефон нормалізується в +380...
 * - якщо рядок невалідний -> він не додається в patients, а йде в results з ok=false
 * - дублікати за phone (після нормалізації) відкидаються (перший виграє)
 *
 * @returns {{patients: Array<object>, results: Array<object>}}
 */
function parsePatientsCsv(csvText, nowDate = new Date()) {
  if (csvText === null || csvText === undefined) throw new Error("csvText required");

  const lines = String(csvText)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);

  if (lines.length === 0) throw new Error("CSV має містити заголовок");

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const cols = new Set(header);
  const missing = [...REQUIRED_COLUMNS].filter((c) => !cols.has(c));
  if (missing.length) throw new Error(`Відсутні колонки: ${JSON.stringify(missing)}`);

  const idx = {};
  header.forEach((name, i) => {
    idx[name] = i;
  });

  const patients = [];
  const results = [];
  const seenPhones = new Set();

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const raw = parseCsvLine(lines[rowIndex]);
    try {
      const fullName = (raw[idx["full_name"]] || "").trim();
      const dobStr = (raw[idx["dob"]] || "").trim();
      const phoneRaw = (raw[idx["phone"]] || "").trim();
      const email = ((raw[idx["email"]] || "").trim()) || null;

      validateFullName(fullName);
      const dob = parseAndValidateDob(dobStr, nowDate);
      const phone = normalizePhoneUA(phoneRaw);

      if (seenPhones.has(phone)) {
        results.push({ rowIndex, ok: false, error: "DUPLICATE_PHONE", patient: null });
        continue;
      }
      seenPhones.add(phone);

      const patient = { full_name: fullName, dob, phone, email };
      patients.push(patient);
      results.push({ rowIndex, ok: true, error: null, patient });
    } catch (e) {
      const msg = e instanceof ValidationError ? e.message : String(e.message || e);
      results.push({ rowIndex, ok: false, error: msg, patient: null });
    }
  }

  return { patients, results };
}

module.exports = { parsePatientsCsv, parseCsvLine };
