const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TokenUtils = require('../utils/tokenUtils');
const core = require('../config/core');

// Register
// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'All fields are required'  // Changed from 'msg' to 'message'
    });
  }

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'  // Changed from 'msg' to 'message'
      });
    }

    const hashedPassword = await bcrypt.hash(password, core.security.bcryptRounds);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const { accessToken, refreshToken } = TokenUtils.generateTokens(newUser._id);

    newUser.refreshToken = refreshToken;
    newUser.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await newUser.save();

    TokenUtils.setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'User created successfully',  // Changed from 'msg' to 'message'
      userId: newUser._id,
      accessToken,
      refreshToken,
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({
      message: 'Server error',  // Changed from 'msg' to 'message'
      error: err.message
    });
  }
});
// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = TokenUtils.generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Set cookies
    TokenUtils.setTokenCookies(res, accessToken, refreshToken);

    res.json({
      accessToken, // Send in response body
      refreshToken, // Send in response body
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  // Get refresh token from cookie or request body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Verify refresh token
    const decoded = TokenUtils.verifyRefreshToken(refreshToken);

    // Find user with matching refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken,
      refreshTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      TokenUtils.clearTokenCookies(res);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = TokenUtils.generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Set new cookies
    TokenUtils.setTokenCookies(res, accessToken, newRefreshToken);

    res.json({
      accessToken, // Send in response body
      refreshToken: newRefreshToken // Send in response body
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      TokenUtils.clearTokenCookies(res);
      return res.status(403).json({ message: 'Refresh token expired, please login again' });
    }
    TokenUtils.clearTokenCookies(res);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        // Clear refresh token from database
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        await user.save();
      }
    }

    // Clear cookies
    TokenUtils.clearTokenCookies(res);

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;