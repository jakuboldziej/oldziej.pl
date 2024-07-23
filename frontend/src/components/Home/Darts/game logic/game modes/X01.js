import { currentUser, game } from "../game";
import { calculatePoints, setCurrentUserState } from "../userUtils";

export const handlePodiumX01 = () => {
  currentUser.place = 1;
  game.podium[1] = currentUser.displayName;
  game.userWon = currentUser.displayName;
  game.active = false;
  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (usersWithoutPodium.length > 0) {
    const sortedUsers = usersWithoutPodium.sort((a, b) => b.allGainedPoints - a.allGainedPoints);
    if (sortedUsers[0]) { game.podium[2] = sortedUsers[0].displayName; sortedUsers[0].place = 2 }
    if (sortedUsers[1]) { game.podium[3] = sortedUsers[1].displayName; sortedUsers[1].place = 3 }
  }
}

export const handlePointsX01 = (setOverthrow) => {
  const { turns } = currentUser;
  const currentTurnValue = turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  const initialPoints = parseInt(currentUser.points) + calculatePoints(turns["1"]) + calculatePoints(turns["2"]) + calculatePoints(turns["3"]);

  if (currentUser.points < 0) {
    currentUser.points = initialPoints;
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;
    currentUser.turns = { 1: null, 2: null, 3: null };
    currentUser.throws["overthrows"] += 1;
    setCurrentUserState();
    setOverthrow(currentUser.displayName);
  } else if (currentUser.points === 0) {
    return true;
  }
}