import User from '../models/User.js';
import SupportMessage from '../models/SupportMessage.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({ error: 'Cannot delete an admin user' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

// @desc    Toggle user admin role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = !user.isAdmin;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error updating user role' });
  }
};

// @desc    Get all support messages
// @route   GET /api/admin/support
// @access  Private/Admin
export const getSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    res.status(500).json({ error: 'Server error fetching support messages' });
  }
};

// @desc    Update support message status
// @route   PUT /api/admin/support/:id/status
// @access  Private/Admin
export const updateSupportMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await SupportMessage.findById(req.params.id);

    if (message) {
      message.status = status || message.status;
      const updatedMessage = await message.save();
      
      // Populate user info before returning
      await updatedMessage.populate('user', 'name email');
      res.json(updatedMessage);
    } else {
      res.status(404).json({ error: 'Support message not found' });
    }
  } catch (error) {
    console.error('Error updating support message status:', error);
    res.status(500).json({ error: 'Server error updating support message status' });
  }
};
