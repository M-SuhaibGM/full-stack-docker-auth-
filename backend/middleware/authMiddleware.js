const TokenUtils = require('../utils/tokenUtils');

function authMiddleware(req, res, next) {
  // Try to get token from multiple sources
  let token = null;
  
  // 1. Check cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  // 2. Check Authorization header (Bearer token)
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  // 3. Check query parameter (optional, for testing)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ 
      msg: 'No token, authorization denied',
      expired: false 
    });
  }

  try {
    // Verify access token
    const decoded = TokenUtils.verifyAccessToken(token);
    req.user = { userId: decoded.userId };

    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        msg: 'Access token expired', 
        expired: true 
      });
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = authMiddleware;