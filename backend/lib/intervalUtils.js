function calculateNextDueDate(intervalType, customDays = 1, fromDate = new Date()) {
  const nextDate = new Date(fromDate);

  switch (intervalType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case 'custom':
      if (customDays && customDays > 0) {
        nextDate.setDate(nextDate.getDate() + customDays);
      } else {
        nextDate.setDate(nextDate.getDate() + 1); // Default to daily
      }
      break;

    default:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }

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

  // Calculate when the current interval started
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

  // Check if last completed date is within current interval
  return lastCompleted >= intervalStart && lastCompleted < nextDue;
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
    new Date(updatedChore.nextDueDate)
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

module.exports = {
  calculateNextDueDate,
  isChoreOverdue,
  isCompletedInCurrentInterval,
  resetChoreForNextInterval,
  getChoreStatus,
  validateIntervalData
};