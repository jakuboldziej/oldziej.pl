const cron = require('node-cron');
const Chore = require('../models/chores/chore');
const {
  shouldResetChore,
  resetChoreForNextInterval
} = require('../lib/intervalUtils');
const { logger } = require('../middleware/logging');
const ChoresUser = require('../models/chores/choresUser');

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  startAllJobs() {
    this.startChoreResetJob();
    logger.info('CronService: All cron jobs started');
  }

  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`CronService: Stopped job ${name}`);
    });
    this.jobs.clear();
  }

  startChoreResetJob() {
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        await this.resetOverdueRepeatableChores();
      } catch (error) {
        logger.error('CronService: Error in chore reset job', { error: error.message });
      }
    }, {
      scheduled: false
    });

    this.jobs.set('choreReset', job);
    job.start();
    logger.info('CronService: Chore reset job started (runs at midnight every day)');
  }

  async resetOverdueRepeatableChores() {
    const currentDate = new Date();

    try {
      const repeatableChores = await Chore.find({
        isRepeatable: true,
        intervalType: 'daily'
      });

      await this.updateDailyStreaks(repeatableChores);

      let resetCount = 0;

      for (const chore of repeatableChores) {
        if (shouldResetChore(chore, currentDate)) {
          const resetData = resetChoreForNextInterval(chore.toObject(), currentDate);

          await Chore.findByIdAndUpdate(chore._id, {
            usersList: resetData.usersList,
            finished: resetData.finished,
            lastResetDate: resetData.lastResetDate
          });

          resetCount++;
        }
      }

      return resetCount;
    } catch (error) {
      logger.error('CronService: Error resetting chores', { error: error.message });
      throw error;
    }
  }

  async updateDailyStreaks(dailyChores) {
    if (!dailyChores.length) return;

    const userMap = new Map();

    for (const chore of dailyChores) {
      for (const user of chore.usersList) {
        if (!user.userId) continue;

        const userIdStr = user.userId.toString();

        if (!userMap.has(userIdStr)) {
          userMap.set(userIdStr, []);
        }

        userMap.get(userIdStr).push(user.finished);
      }
    }

    for (const [userId, finishedList] of userMap.entries()) {
      const finishedAll = finishedList.every(Boolean);

      if (finishedAll) {
        await ChoresUser.findOneAndUpdate({ authUserId: userId }, {
          $inc: { dailyStreak: 1 }
        });
      } else {
        await ChoresUser.findOneAndUpdate({ authUserId: userId }, {
          $set: { dailyStreak: 0 }
        });
      }
    }
  }

  async triggerChoreReset() {
    return await this.resetOverdueRepeatableChores();
  }

  getJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        scheduled: job.scheduled || false
      };
    });
    return status;
  }
}

// Export singleton instance
const cronService = new CronService();

module.exports = cronService;