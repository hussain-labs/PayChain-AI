import User from '../models/User.js';

export const adminProtect = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Not authorized as an admin' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error verifying admin status' });
  }
};
