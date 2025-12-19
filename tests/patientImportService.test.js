const test = require("node:test");
const assert = require("node:assert/strict");

const { parsePatientsCsv } = require("../src/services/patientImportService");

const fixedNow = new Date("2026-03-01T00:00:00Z");

test("parsePatientsCsv: missing required column -> throws", () => {
  const csv = "full_name,dob,email\nJohn Doe,1990-01-01,john@example.com\n";
  assert.throws(() => parsePatientsCsv(csv, fixedNow), /Відсутні колонки/);
});

test("parsePatientsCsv: valid rows parsed; phone normalized", () => {
  const csv = [
    "dob,full_name,phone,email",
    "1990-01-01,Іван Петренко,067 111-22-33,ivan@example.com",
    "2000-05-05,О'Гара Марія,(093)123-45-67,maria@example.com",
    ""
  ].join("\n");

  const { patients, results } = parsePatientsCsv(csv, fixedNow);
  assert.equal(patients.length, 2);
  assert.equal(results.length, 2);
  assert.equal(results[0].ok, true);
  assert.equal(patients[0].phone, "+380671112233");
  assert.equal(patients[1].phone, "+380931234567");
});

test("parsePatientsCsv: invalid future dob -> row rejected", () => {
  const csv = [
    "full_name,dob,phone,email",
    "Test Future,2099-01-01,0671112233,future@example.com",
    "Valid Person,1990-01-01,0672223344,valid@example.com",
  ].join("\n");

  const { patients, results } = parsePatientsCsv(csv, fixedNow);
  assert.equal(patients.length, 1);
  assert.equal(results.length, 2);
  assert.equal(results[0].ok, false);
  assert.match(results[0].error, /dob cannot be in the future/);
  assert.equal(results[1].ok, true);
});

test("parsePatientsCsv: duplicate phone after normalization -> second rejected", () => {
  const csv = [
    "full_name,dob,phone,email",
    "P1,1990-01-01,0671112233,p1@example.com",
    "P2,1991-01-01,+380671112233,p2@example.com",
  ].join("\n");

  const { patients, results } = parsePatientsCsv(csv, fixedNow);
  assert.equal(patients.length, 1);
  assert.equal(results[0].ok, true);
  assert.equal(results[1].ok, false);
  assert.equal(results[1].error, "DUPLICATE_PHONE");
});

test("parsePatientsCsv: invalid phone -> row rejected with validation message", () => {
  const csv = [
    "full_name,dob,phone,email",
    "BadPhone,1990-01-01,12345,bad@example.com",
  ].join("\n");

  const { patients, results } = parsePatientsCsv(csv, fixedNow);
  assert.equal(patients.length, 0);
  assert.equal(results[0].ok, false);
  assert.match(results[0].error, /phone must start/);
});
