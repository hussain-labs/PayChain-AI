import User from '../models/User.js';

/**
 * Send a notification to a specific user.
 * @param {String} userId - The ID of the user to notify.
 * @param {String} message - The notification text.
 * @param {String} link - Optional URL/path to redirect when clicked.
 */
export const notifyUser = async (userId, message, link = null) => {
  try {
    const notification = { message, link, isRead: false, createdAt: new Date() };
    await User.findByIdAndUpdate(userId, {
      $push: { notifications: notification }
    });
  } catch (error) {
    console.error(`Failed to notify user ${userId}:`, error);
  }
};

/**
 * Send a notification to all Admin users.
 * @param {String} message - The notification text.
 * @param {String} link - Optional URL/path to redirect when clicked.
 */
export const notifyAdmins = async (message, link = null) => {
  try {
    const notification = { message, link, isRead: false, createdAt: new Date() };
    await User.updateMany(
      { isAdmin: true },
      { $push: { notifications: notification } }
    );
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};
