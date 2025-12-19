const test = require("node:test");
const assert = require("node:assert/strict");

const { validatePayment } = require("../src/services/paymentService");
const { PaymentValidationError } = require("../src/utils/errors");

test("validatePayment: amount must be > 0", () => {
  assert.throws(() => validatePayment(0, "CASH", null), (e) => e instanceof PaymentValidationError && e.message === "AMOUNT_INVALID");
});

test("validatePayment: method must be CASH or CARD", () => {
  assert.throws(() => validatePayment(10, "CRYPTO", null), (e) => e instanceof PaymentValidationError && e.message === "METHOD_INVALID");
});

test("validatePayment: CARD requires posTxId length 6..64", () => {
  assert.throws(() => validatePayment(10, "CARD", "123"), (e) => e instanceof PaymentValidationError && e.message === "POS_TX_REQUIRED");
  assert.doesNotThrow(() => validatePayment(10, "CARD", "POS-123456"));
});

test("validatePayment: CASH forbids posTxId", () => {
  assert.throws(() => validatePayment(10, "CASH", "POS-123456"), (e) => e instanceof PaymentValidationError && e.message === "POS_TX_NOT_ALLOWED_FOR_CASH");
  assert.doesNotThrow(() => validatePayment(10, "CASH", null));
});
