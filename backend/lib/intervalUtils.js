function shouldResetChore(chore, currentDate = new Date()) {
  if (!chore.isRepeatable) return false;

  const startOfToday = new Date(currentDate);
  startOfToday.setHours(0, 0, 0, 0);

  switch (chore.intervalType) {
    case 'daily':
      // Resets every single day at midnight
      return true;

    case 'weekly':
      // Resets on Monday (which means Sunday at 24:00)
      return startOfToday.getDay() === 1;

    case 'monthly':
      // Resets on the 1st of every month
      return startOfToday.getDate() === 1;

    case 'custom':
      if (!chore.lastResetDate) return true;
      const lastReset = new Date(chore.lastResetDate);
      lastReset.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(startOfToday - lastReset);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= (chore.customDays || 1);

    default:
      return false;
  }
}

function resetChoreForNextInterval(chore, currentDate = new Date()) {
  const updatedChore = { ...chore };

  updatedChore.usersList = updatedChore.usersList.map(user => ({
    ...user,
    finished: false
  }));

  updatedChore.finished = false;
  updatedChore.lastResetDate = currentDate;

  return updatedChore;
}

function validateIntervalData(choreData) {
  if (!choreData.isRepeatable) return { isValid: true };
  if (!choreData.intervalType) return { isValid: false, error: 'Interval type is required' };

  if (choreData.intervalType === 'custom') {
    if (!choreData.customDays || choreData.customDays < 1 || choreData.customDays > 365) {
      return { isValid: false, error: 'Custom days must be between 1 and 365' };
    }
  }
  return { isValid: true };
}

module.exports = {
  shouldResetChore,
  resetChoreForNextInterval,
  validateIntervalData
};