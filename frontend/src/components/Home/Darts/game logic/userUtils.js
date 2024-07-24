import { currentUser, game, setUsers } from "./game";

export const resetUsersState = () => {
  setUsers(game.users);
}

export const setCurrentUserState = () => {
  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user =>
      user._id === currentUser._id ? currentUser : user
    );
    return updatedUsers;
  });
}

const isNumericRegex = /^\d+$/;
export const calculatePoints = (turnValue) => {
  if (!isNumericRegex.test(turnValue) && turnValue) {
    if (turnValue[0] === "D") {
      return parseInt(turnValue.slice(1)) * 2;
    }
    if (turnValue[0] === "T") {
      return parseInt(turnValue.slice(1)) * 3;
    }
  }
  return turnValue ? parseInt(turnValue) : turnValue;
}

export const handleTurnsSum = () => {
  const currentTurn = currentUser.turns[currentUser.currentTurn];
  currentUser.turnsSum += currentTurn;
  if (currentUser.currentTurn === 3 && currentUser.turnsSum > currentUser.highestGameTurnPoints) currentUser.highestGameTurnPoints = currentUser.turnsSum;
}

export const handleAvgPointsPerTurn = () => {
  const pointsThrown = game.startPoints - currentUser.points;
  const dartsThrown = totalThrows(currentUser);
  const avg = pointsThrown / dartsThrown * 3;
  currentUser.avgPointsPerTurn = (avg).toFixed(2);
  if (isNaN(avg)) currentUser.avgPointsPerTurn = 0;
}

export const totalThrows = (user) => {
  return Object.values(user.throws).reduce((acc, val) => acc + val, 0) - user.throws["overthrows"]
}