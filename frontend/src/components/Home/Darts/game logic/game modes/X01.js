import { socket } from "@/lib/socketio";
import { calculatePoints } from "../userUtils";
import { handleWLEDOverthrow } from "../wledController";

export const handlePodiumX01 = (game, currentUser) => {
  currentUser.place = 1;
  game.podium[1] = currentUser.displayName;
  game.userWon = currentUser.displayName;
  game.active = false;
  game.finished_at = Date.now();

  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (usersWithoutPodium.length > 0) {
    const sortedUsers = usersWithoutPodium.sort((a, b) => b.allGainedPoints - a.allGainedPoints);
    if (sortedUsers[0]) { game.podium[2] = sortedUsers[0].displayName; sortedUsers[0].place = 2 }
    if (sortedUsers[1]) { game.podium[3] = sortedUsers[1].displayName; sortedUsers[1].place = 3 }
  }
}

export const handlePointsX01 = (setOverthrow, game, currentUser) => {
  const { turns } = currentUser;
  const currentTurnValue = turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  currentUser.allGainedPoints = game.startPoints - currentUser.points;
  const initialPoints = parseInt(currentUser.points) + calculatePoints(turns["1"]) + calculatePoints(turns["2"]) + calculatePoints(turns["3"]);

  if (currentUser.points < 0) {
    currentUser.allGainedPoints -= currentUser.turnsSum;

    currentUser.points = initialPoints;
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;
    currentUser.turns = { 1: null, 2: null, 3: null };
    currentUser.throws["overthrows"] += 1;
    currentUser.currentThrows["overthrows"] += 1;

    // Effects
    handleWLEDOverthrow();
    setOverthrow(currentUser.displayName);
    socket.emit("userOverthrow", JSON.stringify({
      userDisplayName: currentUser.displayName,
      gameCode: game.gameCode
    }));
  } else if (currentUser.points === 0) {
    return true;
  }
}

export const handleNextLeg = (users, game) => {
  const legCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3]);
  if (legCheckout > currentUser.gameCheckout) currentUser.gameCheckout = legCheckout;
  currentUser.legs += 1;

  let endGame = false;
  if (currentUser.legs === game.legs) endGame = true;

  users.map((user) => {
    if (user.avgPointsPerTurn > user.highestGameAvg) user.highestGameAvg = user.avgPointsPerTurn;
    if (endGame) return;
    user.points = game.startPoints;
    user.avgPointsPerTurn = "0.00";
    user.turnsSum = 0;
    user.turns = {
      1: null,
      2: null,
      3: null
    }
    user.currentThrows = {
      doors: 0,
      doubles: 0,
      triples: 0,
      normal: 0,
      overthrows: 0,
    }

    return user;
  });

  if (endGame) return true;
  else return false;
}