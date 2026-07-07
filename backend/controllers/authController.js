import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { notifyUser, notifyAdmins } from '../utils/notify.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpaychainkey_replace_me_in_production';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Notify user and admins
    await notifyUser(newUser._id, 'Welcome to PayChain! Your borderless payment journey begins here.', '/dashboard');
    await notifyAdmins(`New user registered: ${name} (${email})`, `/admin/users/${newUser._id}`);

    res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact customer support for assistance.' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.connectedAccounts;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: userObj._id,
        ...userObj
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Forgot Password (Generate and send code)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, code);

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Verify Reset Code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    res.status(200).json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.lastResetAt = Date.now();
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
