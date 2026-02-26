const cron = require('node-cron');
const Chore = require('../models/chores/chore');
const {
  shouldResetChore,
  resetChoreForNextInterval
} = require('../lib/intervalUtils');
const { logger } = require('../middleware/logging');
const ChoresUser = require('../models/chores/choresUser');
const { io } = require('../server');

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
    // '*/10 * * * * *' 10 seconds | '0 0 * * *' every day at midnight
    const job = cron.schedule('*/10 * * * * *', async () => {
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
      const affectedUsers = new Set();

      for (const chore of repeatableChores) {
        if (shouldResetChore(chore, currentDate)) {
          const resetData = resetChoreForNextInterval(chore.toObject(), currentDate);

          await Chore.findByIdAndUpdate(chore._id, {
            usersList: resetData.usersList,
            finished: resetData.finished,
            lastResetDate: resetData.lastResetDate
          });

          chore.usersList.forEach(user => {
            affectedUsers.add(user.userId.toString());
          });

          resetCount++;
        }
      }

      const affectedUsersArray = Array.from(affectedUsers);

      io.emit("dailyChoresReset", {
        message: "Daily chores reset",
        date: currentDate,
        affectedUsers: affectedUsersArray
      });

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