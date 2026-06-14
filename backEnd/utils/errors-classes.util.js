// ─── Base Error ───────────────────────────────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);

    this.name        = this.constructor.name;
    this.statusCode  = statusCode;
    this.status      = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details     = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Client Errors ────────────────────────────────────────────────────────────
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, details);
  }
}

class BadRequestError extends AppError {  
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// ─── Server Errors ────────────────────────────────────────────────────────────
class InternalServerError extends AppError {
  constructor(message = 'Something went wrong') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};