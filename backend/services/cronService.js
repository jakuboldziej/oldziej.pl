const cron = require('node-cron');
const Chore = require('../models/chores/chore');
const {
  isChoreOverdue,
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
    const job = cron.schedule('0 * * * *', async () => {
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
    logger.info('CronService: Chore reset job started (runs every hour)');
  }

  async resetOverdueRepeatableChores() {
    const currentDate = new Date();

    try {
      const repeatableChores = await Chore.find({
        isRepeatable: true,
        nextDueDate: { $exists: true, $ne: null }
      });

      let resetCount = 0;

      for (const chore of repeatableChores) {
        if (isChoreOverdue(chore, currentDate)) {
          const resetData = resetChoreForNextInterval(chore);

          await Chore.findByIdAndUpdate(chore._id, {
            usersList: resetData.usersList,
            finished: resetData.finished,
            nextDueDate: resetData.nextDueDate
          });

          resetCount++;
          logger.info('CronService: Reset overdue chore', {
            choreId: chore._id,
            title: chore.title,
            oldDueDate: chore.nextDueDate,
            newDueDate: resetData.nextDueDate
          });
        }
      }

      if (resetCount > 0) {
        logger.info(`CronService: Reset ${resetCount} overdue repeatable chores`);
      }

      return resetCount;
    } catch (error) {
      logger.error('CronService: Error resetting overdue chores', { error: error.message });
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