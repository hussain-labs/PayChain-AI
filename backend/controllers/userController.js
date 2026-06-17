import User from '../models/User.js';
import bcrypt from 'bcrypt';
import cloudinary, { uploadBufferToCloudinary } from '../config/cloudinary.js';

// @desc    Get user connected accounts
// @route   GET /api/user/accounts
// @access  Private
export const getUserAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('connectedAccounts');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user.connectedAccounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Add a connected account
// @route   POST /api/user/accounts
// @access  Private
export const addUserAccount = async (req, res) => {
  const { name, address, bgColor, color, type, balance, wallets } = req.body;
  if (!name || !address) return res.status(400).json({ error: 'Name and address are required' });
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.connectedAccounts.push({ name, address, bgColor: bgColor || '#4B1D8F', color: color || '#fff', type: type || 'wallet', balance: balance || '$0.00', wallets: wallets || 1 });
    await user.save();
    res.status(201).json(user.connectedAccounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get full profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -connectedAccounts');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update profile (name, email, phone, avatar, currency, language)
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, email, phone, avatar, currency, language } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check email uniqueness if changed
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ error: 'Email already in use by another account.' });
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (currency) user.currency = currency;
    if (language) user.language = language;

    await user.save();

    res.status(200).json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      currency: user.currency,
      language: user.language,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Upload avatar to Cloudinary
// @route   POST /api/user/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Upload buffer directly to Cloudinary
    const secureUrl = await uploadBufferToCloudinary(req.file.buffer);

    user.avatar = secureUrl;
    await user.save();
    res.status(200).json({ avatar: secureUrl });
  } catch (error) {
    console.error('Avatar upload error:', JSON.stringify(error));
    res.status(500).json({ error: error.message || 'Upload failed.' });
  }
};

// @desc    Change password
// @route   PUT /api/user/password
// @access  Private
export const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'New password is required.' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
