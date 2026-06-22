import cron from 'node-cron';
import User from '../models/User.js';

/**
 * Resets transactionCount to 0 for all FREE plan users.
 * Runs every day at 06:00 AM server time.
 * Also records the reset timestamp in lastResetAt.
 */
const startDailyResetScheduler = () => {
  // Cron: "0 1 * * *" = 01:00 AM UTC = 06:00 AM Pakistan Standard Time (UTC+5)
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log(`[CRON] Running daily free plan reset at ${new Date().toISOString()} (06:00 AM PKT)`);

      const result = await User.updateMany(
        { plan: 'free' },
        {
          $set: {
            transactionCount: 0,
            lastResetAt: new Date(),
          },
        }
      );

      console.log(`[CRON] Reset transactionCount for ${result.modifiedCount} free plan users.`);
    } catch (err) {
      console.error('[CRON] Daily reset failed:', err.message);
    }
  });

  console.log('[CRON] Daily free plan reset scheduler started (fires at 06:00 AM every day).');
};

export default startDailyResetScheduler;
