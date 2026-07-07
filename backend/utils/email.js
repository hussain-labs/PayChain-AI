import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
// It uses SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from .env
// If not provided, it falls back to a dummy setup (e.g. ethereal or just console log)
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail', // defaults to gmail if service not specified
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Just log to console if no SMTP configured
    return {
      sendMail: async (mailOptions) => {
        console.log('----------------------------------------------------');
        console.log(`[EMAIL MOCK] To: ${mailOptions.to}`);
        console.log(`[EMAIL MOCK] Subject: ${mailOptions.subject}`);
        console.log(`[EMAIL MOCK] Body: ${mailOptions.text || mailOptions.html}`);
        console.log('----------------------------------------------------');
        console.log('NOTE: Please configure SMTP_USER and SMTP_PASS in .env to send real emails.');
        return { messageId: 'mock-id' };
      }
    };
  }
};

const transporter = createTransporter();

export const sendPasswordResetEmail = async (toEmail, code) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"PayChain Support" <noreply@paychain.com>',
    to: toEmail,
    subject: 'PayChain - Your Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #7B3FBF; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your PayChain account.</p>
        <p>Please use the following 6-digit verification code to reset your password:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        <br/>
        <p>Best regards,<br/>The PayChain Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
