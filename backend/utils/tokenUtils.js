// utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const core = require('../config/core');

class TokenUtils {
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      core.accessToken.secret,
      { expiresIn: core.accessToken.expiry }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      core.refreshToken.secret,
      { expiresIn: core.refreshToken.expiry }
    );
    
    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, core.accessToken.secret);
    } catch (error) {
      throw error;
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, core.refreshToken.secret);
    } catch (error) {
      throw error;
    }
  }

  static getCookieOptions(maxAge) {
    return {
      httpOnly: core.cookie.httpOnly,
      secure: core.cookie.secure,
      sameSite: core.cookie.sameSite,
      domain: core.cookie.domain,
      maxAge: maxAge
    };
  }

  static setTokenCookies(res, accessToken, refreshToken) {
    // Set access token cookie
    res.cookie(
      'accessToken',
      accessToken,
      this.getCookieOptions(core.accessToken.cookie.maxAge)
    );

    // Set refresh token cookie
    res.cookie(
      'refreshToken',
      refreshToken,
      this.getCookieOptions(core.refreshToken.cookie.maxAge)
    );
  }

  static clearTokenCookies(res) {
    res.clearCookie('accessToken', {
      httpOnly: core.cookie.httpOnly,
      secure: core.cookie.secure,
      sameSite: core.cookie.sameSite,
      domain: core.cookie.domain
    });
    res.clearCookie('refreshToken', {
      httpOnly: core.cookie.httpOnly,
      secure: core.cookie.secure,
      sameSite: core.cookie.sameSite,
      domain: core.cookie.domain
    });
  }
}

module.exports = TokenUtils;