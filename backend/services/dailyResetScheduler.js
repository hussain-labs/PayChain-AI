import cron from 'node-cron';
import User from '../models/User.js';

/**
 * Resets transactionCount to 0 for ALL users on the 1st of every month.
 * - Free plan: resets their 3/month limit
 * - Pro plan: resets their 10,000/month limit (safety net alongside Stripe webhook)
 * - Pro Plus: unlimited so no practical effect, but keeps data clean
 * Runs at 01:00 AM UTC on the 1st of every month.
 */
const startDailyResetScheduler = () => {
  // Cron: "0 1 1 * *" = 01:00 AM UTC on the 1st of every month
  cron.schedule('0 1 1 * *', async () => {
    try {
      console.log(`[CRON] Running monthly transaction reset at ${new Date().toISOString()}`);

      const result = await User.updateMany(
        {},
        {
          $set: {
            transactionCount: 0,
            historyLookups: 0,
            lastResetAt: new Date(),
          },
        }
      );

      console.log(`[CRON] Monthly reset done. Updated ${result.modifiedCount} users.`);
    } catch (err) {
      console.error('[CRON] Monthly reset failed:', err.message);
    }
  });

  console.log('[CRON] Monthly transaction reset scheduler started (fires on 1st of every month at 01:00 AM UTC).');
};

export default startDailyResetScheduler;
