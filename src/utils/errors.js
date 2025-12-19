class ValidationError extends Error {}
class AuthorizationError extends Error {}
class AppointmentError extends Error {}
class PaymentValidationError extends Error {}

module.exports = {
  ValidationError,
  AuthorizationError,
  AppointmentError,
  PaymentValidationError,
};
