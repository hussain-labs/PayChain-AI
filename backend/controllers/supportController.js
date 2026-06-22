import SupportMessage from '../models/SupportMessage.js';
import { notifyAdmins } from '../utils/notify.js';

// @desc    Create a support message
// @route   POST /api/support
// @access  Private (or Public if we allow guests later)
export const createSupportMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Please provide both subject and message' });
    }

    const supportMessage = new SupportMessage({
      user: req.userId,
      subject,
      message,
    });

    const createdMessage = await supportMessage.save();
    
    // Notify admins
    await notifyAdmins(`New Support Ticket: ${subject}`, `/admin/support?ticketId=${createdMessage._id}`);

    res.status(201).json(createdMessage);
  } catch (error) {
    console.error('Error creating support message:', error);
    res.status(500).json({ error: 'Server error creating support message' });
  }
};
