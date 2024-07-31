import { currentUser, game, setUsers } from "./game";

export const setUsersState = () => {
  setUsers((prevUsers) => {
    return prevUsers.map((prevUser, i) => game.users[i]);
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

export const handleAvgPointsPerTurn = (user) => {
  const pointsThrown = game.startPoints - user.points;
  const dartsThrown = totalThrows(user);
  const avg = (pointsThrown / dartsThrown) * 3;
  user.avgPointsPerTurn = (avg).toFixed(2);
  if (isNaN(avg)) user.avgPointsPerTurn = 0;

  return (avg).toFixed(2);
}

export const totalThrows = (user) => {
  return Object.values(user.currentThrows).reduce((acc, val) => acc + val, 0) - user.currentThrows["overthrows"];
}