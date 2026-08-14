// config/core.js
module.exports = {
  // Token settings
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    }
  },
  
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  },

  // Security settings
  security: {
    bcryptRounds: 10,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined
  }
};