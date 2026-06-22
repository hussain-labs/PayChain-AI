import User from '../models/User.js';
import SupportMessage from '../models/SupportMessage.js';
import { notifyUser } from '../utils/notify.js';

const API = 'http://localhost:5000';

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ error: 'Cannot delete an admin user' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

// @desc    Toggle user admin role
// @route   PUT /api/admin/users/:id/role
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isAdmin = !user.isAdmin;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, isAdmin: updated.isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating user role' });
  }
};

// @desc    Toggle user active/inactive
// @route   PUT /api/admin/users/:id/active
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ error: 'Cannot deactivate an admin' });
    user.isActive = !user.isActive;
    const updated = await user.save();
    res.json({ _id: updated._id, isActive: updated.isActive });
  } catch (error) {
    res.status(500).json({ error: 'Server error toggling user active status' });
  }
};

// @desc    Update user plan
// @route   PUT /api/admin/users/:id/plan
export const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'pro_plus'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating plan' });
  }
};

// @desc    Update user transaction limit (manually set count)
// @route   PUT /api/admin/users/:id/limit
export const updateUserLimit = async (req, res) => {
  try {
    const { transactionCount } = req.body;
    if (transactionCount === undefined || isNaN(transactionCount)) {
      return res.status(400).json({ error: 'Invalid transaction count' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { transactionCount: Number(transactionCount) },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating limit' });
  }
};

// @desc    Update user profile fields
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating user' });
  }
};

// @desc    Add or remove bonus transactions
// @route   PUT /api/admin/users/:id/bonus
export const addBonusTransactions = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) === 0) return res.status(400).json({ error: 'Invalid bonus amount' });

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newBonus = Math.max(0, (user.bonusTransactions || 0) + Number(amount));
    const difference = newBonus - (user.bonusTransactions || 0);

    if (difference === 0) return res.status(400).json({ error: 'No changes made to bonus' });

    user.bonusTransactions = newBonus;

    const message = difference > 0
      ? `You received a bonus of ${difference} transactions from PayChain Admin!`
      : `PayChain Admin has revoked ${Math.abs(difference)} bonus transactions from your account.`;

    user.notifications.push({
      message,
      isRead: false,
      createdAt: new Date()
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating bonus' });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const freeUsers = await User.countDocuments({ plan: 'free', isAdmin: false });
    const proUsers = await User.countDocuments({ plan: 'pro', isAdmin: false });
    const proPlusUsers = await User.countDocuments({ plan: 'pro_plus', isAdmin: false });
    const activeUsers = await User.countDocuments({ isActive: true, isAdmin: false });
    const inactiveUsers = await User.countDocuments({ isActive: false, isAdmin: false });

    // Total transactions across all users
    const txAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$transactionCount' } } }]);
    const totalTransactions = txAgg[0]?.total || 0;

    // Support ticket stats
    const openTickets = await SupportMessage.countDocuments({ status: 'open' });
    const closedTickets = await SupportMessage.countDocuments({ status: 'closed' });
    const totalTickets = await SupportMessage.countDocuments();

    // Recent 5 sign-ups
    const recentUsers = await User.find({ isAdmin: false })
      .select('name email plan isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers, freeUsers, proUsers, proPlusUsers,
      activeUsers, inactiveUsers, totalTransactions,
      openTickets, closedTickets, totalTickets,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};

// @desc    Get all support messages
// @route   GET /api/admin/support
export const getSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching support messages' });
  }
};

// @desc    Update support message status
// @route   PUT /api/admin/support/:id/status
export const updateSupportMessageStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const message = await SupportMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    let isChanged = false;
    if (status && message.status !== status) {
      message.status = status;
      isChanged = true;
    }
    if (adminComment !== undefined && message.adminComment !== adminComment) {
      message.adminComment = adminComment;
      isChanged = true;
    }

    const updated = await message.save();
    await updated.populate('user', 'name email');

    if (isChanged) {
      const notifyText = adminComment
        ? `Your support ticket "${updated.subject}" has a new update from Admin.`
        : `Your support ticket "${updated.subject}" status changed to ${updated.status}.`;
      await notifyUser(updated.user._id, notifyText, '/support');
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating support message status' });
  }
};
