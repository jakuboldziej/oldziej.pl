import { calculatePoints } from "../userUtils";

export const doorsValueReverseX01 = 40;
export const zeroValueReverseX01 = 20;

export const handlePodiumReverseX01 = (game) => {
  const reverseUser = game.users.find((user) => user.displayName !== currentUser.displayName);
  reverseUser.place = 1;
  game.podium[1] = reverseUser.displayName;
  game.userWon = reverseUser.displayName;
  game.active = false;
  game.finished_at = Date.now();

  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (usersWithoutPodium.length > 0) {
    const sortedUsers = usersWithoutPodium.sort((a, b) => a.allGainedPoints - b.allGainedPoints);
    if (sortedUsers[0]) { game.podium[2] = sortedUsers[0].displayName; sortedUsers[0].place = 2 }
    if (sortedUsers[1]) { game.podium[3] = sortedUsers[1].displayName; sortedUsers[1].place = 3 }
  }
}

export const handlePointsReverseX01 = (currentUser) => {
  const { turns } = currentUser;
  const currentTurnValue = turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  currentUser.allGainedPoints = game.startPoints - currentUser.points;

  if (currentUser.points <= 0) {
    return true;
  } else {
    return false;
  }
}