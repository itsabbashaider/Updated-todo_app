const { UnauthorizedError } = require('../errors');
const { verifyAccessToken } = require('../utils/auth.util');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access Denied: No token credentials provided' }
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyAccessToken(token);
    
    req.user = {
      user_id: decoded.user_id || decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access Denied: Session signature has expired' }
    });
  }
};