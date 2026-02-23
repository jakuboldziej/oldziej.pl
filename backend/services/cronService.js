const cron = require('node-cron');
const Chore = require('../models/chores/chore');
const {
  shouldResetChore,
  resetChoreForNextInterval
} = require('../lib/intervalUtils');
const { logger } = require('../middleware/logging');
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
      const repeatableChores = await Chore.find({ isRepeatable: true });

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
          logger.info('CronService: Reset chore for new interval', {
            choreId: chore._id,
            title: chore.title
          });
        }
      }

      if (resetCount > 0) {
        logger.info(`CronService: Reset ${resetCount} repeatable chores`);
      }

      return resetCount;
    } catch (error) {
      logger.error('CronService: Error resetting chores', { error: error.message });
      throw error;
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