function calculateNextDueDate(intervalType, customDays = 1, fromDate = new Date(), isInitialCreation = false) {
  const nextDate = new Date(fromDate);

  nextDate.setHours(0, 0, 0, 0);

  switch (intervalType) {
    case 'daily':
      if (!isInitialCreation) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;

    case 'weekly':
      if (!isInitialCreation) {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;

    case 'monthly':
      if (!isInitialCreation) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;

    case 'custom':
      const daysToAdd = customDays && customDays > 0 ? customDays : 1;
      if (!isInitialCreation) {
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        if (daysToAdd === 1) {
          // Due today
        } else {
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
      }
      break;

    default:
      if (!isInitialCreation) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
  }

  nextDate.setHours(23, 59, 59, 999);

  return nextDate;
}

function isChoreOverdue(chore, currentDate = new Date()) {
  if (!chore.isRepeatable || !chore.nextDueDate) {
    return false;
  }

  return new Date(chore.nextDueDate) <= currentDate;
}

function isCompletedInCurrentInterval(chore, currentDate = new Date()) {
  if (!chore.isRepeatable || !chore.lastCompletedDate || !chore.nextDueDate) {
    return false;
  }

  const lastCompleted = new Date(chore.lastCompletedDate);
  const nextDue = new Date(chore.nextDueDate);

  let intervalStart = new Date(nextDue);

  switch (chore.intervalType) {
    case 'daily':
      intervalStart.setDate(intervalStart.getDate() - 1);
      break;
    case 'weekly':
      intervalStart.setDate(intervalStart.getDate() - 7);
      break;
    case 'monthly':
      intervalStart.setMonth(intervalStart.getMonth() - 1);
      break;
    case 'custom':
      intervalStart.setDate(intervalStart.getDate() - (chore.customDays || 1));
      break;
    default:
      intervalStart.setDate(intervalStart.getDate() - 1);
      break;
  }

  intervalStart.setHours(0, 0, 0, 0);

  return lastCompleted >= intervalStart && lastCompleted <= nextDue;
}

function resetChoreForNextInterval(chore) {
  const updatedChore = { ...chore };

  updatedChore.usersList = updatedChore.usersList.map(user => ({
    ...user,
    finished: false
  }));

  updatedChore.finished = false;

  updatedChore.nextDueDate = calculateNextDueDate(
    updatedChore.intervalType,
    updatedChore.customDays,
    new Date(updatedChore.nextDueDate),
    false
  );

  return updatedChore;
}

function getChoreStatus(chore, currentDate = new Date()) {
  if (!chore.isRepeatable) {
    return {
      status: chore.finished ? 'completed' : 'pending',
      isOverdue: false,
      completedInInterval: false
    };
  }

  const completedInInterval = isCompletedInCurrentInterval(chore, currentDate);
  const overdue = isChoreOverdue(chore, currentDate);

  let status = 'pending';
  if (completedInInterval) {
    status = 'completed_in_interval';
  } else if (overdue) {
    status = 'overdue';
  }

  return {
    status,
    isOverdue: overdue,
    completedInInterval,
    nextDueDate: chore.nextDueDate,
    lastCompletedDate: chore.lastCompletedDate
  };
}

function validateIntervalData(choreData) {
  if (!choreData.isRepeatable) {
    return { isValid: true };
  }

  if (!choreData.intervalType) {
    return {
      isValid: false,
      error: 'Interval type is required for repeatable chores'
    };
  }

  const validIntervalTypes = ['daily', 'weekly', 'monthly', 'custom'];
  if (!validIntervalTypes.includes(choreData.intervalType)) {
    return {
      isValid: false,
      error: 'Invalid interval type'
    };
  }

  if (choreData.intervalType === 'custom') {
    if (!choreData.customDays || choreData.customDays < 1 || choreData.customDays > 365) {
      return {
        isValid: false,
        error: 'Custom days must be between 1 and 365'
      };
    }
  }

  return { isValid: true };
}

function getStartOfDay(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

function getEndOfDay(date = new Date()) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

module.exports = {
  calculateNextDueDate,
  isChoreOverdue,
  isCompletedInCurrentInterval,
  resetChoreForNextInterval,
  getChoreStatus,
  validateIntervalData,
  getStartOfDay,
  getEndOfDay
};