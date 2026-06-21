const AppError = require('./app.error');
const ValidationError = require('./validation.error');
const BadRequestError = require('./bad-request.error');
const UnauthorizedError = require('./unauthorized.error');
const ForbiddenError = require('./forbidden.error');
const NotFoundError = require('./not-found.error');
const InternalServerError = require('./internal-server.error');

module.exports = {
  AppError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};