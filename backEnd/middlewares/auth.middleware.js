const authService = require('../services/auth.service');
const { UnauthorizedError } = require('../utils/errors-classes.util');
const asyncHandler = require('./async-handler.middleware');

module.exports = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = await authService.verifyToken(token);

  req.user = decoded;
  next();
});