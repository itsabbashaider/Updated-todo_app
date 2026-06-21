const AppError = require('./app.error');

class InternalServerError extends AppError {
  constructor(message = 'Something went wrong') {
    super(message, 500);
  }
}

module.exports = InternalServerError;