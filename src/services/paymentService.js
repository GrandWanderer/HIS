const { PaymentValidationError } = require("../utils/errors");

/**
 * Вимоги (під unit-тести):
 * - amountUah > 0
 * - method ∈ {CASH, CARD}
 * - якщо method == CARD -> posTxId обовʼязковий і довжина 6..64
 * - якщо method == CASH -> posTxId має бути порожнім/undefined/null
 */
function validatePayment(amountUah, method, posTxId) {
  if (amountUah === null || amountUah === undefined || Number(amountUah) <= 0) {
    throw new PaymentValidationError("AMOUNT_INVALID");
  }
  if (!["CASH", "CARD"].includes(method)) {
    throw new PaymentValidationError("METHOD_INVALID");
  }

  if (method === "CARD") {
    if (!posTxId || String(posTxId).length < 6 || String(posTxId).length > 64) {
      throw new PaymentValidationError("POS_TX_REQUIRED");
    }
  } else { // CASH
    if (posTxId !== null && posTxId !== undefined && posTxId !== "" && posTxId !== "-") {
      throw new PaymentValidationError("POS_TX_NOT_ALLOWED_FOR_CASH");
    }
  }
}

module.exports = { validatePayment };
