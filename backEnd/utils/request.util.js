const { UnauthorizedError } = require('../errors');

const getRequestUserId = (req) => {
  const userId = req?.user?.user_id;

  if (!userId) {
    throw new UnauthorizedError(
      'Authenticated user is required'
    );
  }

  return userId;
};

module.exports = {
  getRequestUserId,
};