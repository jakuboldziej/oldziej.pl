import lodash from 'lodash';
import { getDartsUser, putDartsGame, putDartsUser } from "../../../fetch";

// Game Logic

let game;
let setGame;
let handleShow;
let currentUser;
let users;
let setUsers;
let setOverthrow;

export const handleRound = (value, usersP, gameP, setGameP, handleShowP, setUsersP, specialState, setSpecialState, setOverthrowP) => {
  handleShow = handleShowP;
  game = gameP;
  setGame = setGameP;
  users = usersP;
  setUsers = setUsersP;
  setOverthrow = setOverthrowP;
  currentUser = users.find(user => user.turn);
  if (Number.isInteger(value)) {
    handleUsersState(value, specialState, setSpecialState);
  } else if (!Number.isInteger(value)) {
    handleSpecialValue(value, specialState, setSpecialState);
  }
}

const handleTurnsSum = () => {
  const currentTurn = currentUser.turns[currentUser.currentTurn];
  currentUser.turnsSum += currentTurn;
  if (currentUser.currentTurn === 3 && currentUser.turnsSum > currentUser.highestTurnPoints) currentUser.highestTurnPoints = currentUser.turnsSum;
}

const isNumericRegex = /^\d+$/;
const calculatePoints = (turnValue) => {
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

const handlePodium = () => {
  if (game.podiums > 1) {
    if (game.podium[1] !== null) {
      let lastNonNullElement = null;
      for (let i = Object.keys(game.podium).length; i >= 0; i--) {
        if (game.podium[i] !== null) {
          lastNonNullElement = [i, game.podium[i]];
          break;
        }
      }
      currentUser.place = lastNonNullElement[0] + 1;
      game.podium[lastNonNullElement[0] + 1] = currentUser.displayName;
    } else {
      currentUser.place = 1;
      game.podium[1] = currentUser.displayName;
    }
  } else {
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
    handleDartsData();
    handleShow();
    return true;
  }
  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (currentUser.place == game.podiums) {
    game.userWon = game.podium[1];
    game.active = false;
    handleDartsData();
    handleShow();
    return true;
  }
  if (usersWithoutPodium.length === 1) {
    const user = game.users.find(user => user === usersWithoutPodium[0]);
    user.place = game.podiums;
    game.podium[game.podiums] = user.displayName;
    game.userWon = game.podium[1];
    game.active = false;
    handleDartsData();
    handleShow();
    return true;
  }
}

const handleGameEnd = () => {
  if (game.legs == 1 && game.sets == 1) {
    currentUser.highestCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3])
    const end = handlePodium();
    if (end) return true;
  } else {
    currentUser.legs += 1;
    currentUser.avgPointsPerTurn = 0.00;
    currentUser.turn = false;
    if (currentUser.legs == game.legs) {
      game.users.map((user) => {
        user.legs = 0;
      });
      currentUser.sets += 1;
      if (currentUser.sets == game.sets) {
        currentUser.highestCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3])
        const end = handlePodium();
        if (end) return true;
      }
    }
    handleDartsData();
    game.users.map((user) => {
      if (user.place === 0) {
        user.points = game.startPoints;
        user.turns = { 1: null, 2: null, 3: null };
        user.throws = { doors: 0, doubles: 0, triples: 0, normal: 0 };
        user.turnsSum = 0;
        user.avgPointsPerTurn = 0.00;
        user.currentTurn = 1;
      }
    });
    const nextUser = handleNextUser();
    currentUser = nextUser;
    currentUser.currentTurn = 0;
  }
}

const handlePoints = (action, value) => {
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
    setUserState();
    setOverthrow(currentUser.displayName);
  } else if (currentUser.points === 0) {
    const end = handleGameEnd();
    if (end) return;
  }
  if (action) {
    if (action === 'DOUBLE') {
      turns[currentUser.currentTurn] = `D${value}`;
    } else if (action === 'TRIPLE') {
      turns[currentUser.currentTurn] = `T${value}`;
    }
  }
}

const handleAvgPointsPerTurn = () => {
  const pointsThrown = game.startPoints - currentUser.points;
  const dartsThrown = totalThrows(currentUser);
  const avg = pointsThrown / dartsThrown * 3;
  currentUser.avgPointsPerTurn = (avg).toFixed(2);
  if (isNaN(avg)) currentUser.avgPointsPerTurn = 0;
}

const handleDartsData = async () => {
  users.map(async (user) => {
    const dartUser = await getDartsUser(user.displayName);

    user.place === 1 ? dartUser.podiums["firstPlace"] += 1 : null;
    user.place === 2 ? dartUser.podiums["secondPlace"] += 1 : null;
    user.place === 3 ? dartUser.podiums["thirdPlace"] += 1 : null;
    dartUser.throws["doors"] += user.throws["doors"];
    dartUser.throws["doubles"] += user.throws["doubles"];
    dartUser.throws["triples"] += user.throws["triples"];
    dartUser.throws["normal"] += user.throws["normal"];
    dartUser.throws["overthrows"] += user.throws["overthrows"];
    dartUser.overAllPoints += game.startPoints - user.points;
    dartUser.highestEndingAvg = user.highestEndingAvg;
    !game.active ? dartUser.gamesPlayed += 1 : null;

    if (parseFloat(user.highestTurnPoints) > parseFloat(dartUser.highestTurnPoints)) dartUser.highestTurnPoints = parseFloat(user.highestTurnPoints);
    if (parseFloat(user.avgPointsPerTurn) > parseFloat(dartUser.highestEndingAvg)) dartUser.highestEndingAvg = parseFloat(user.avgPointsPerTurn);
    if (user.highestCheckout > dartUser.highestCheckout) dartUser.highestCheckout = user.highestCheckout;

    if (!game.training) await putDartsUser(dartUser)
  })

  game.podium = {
    1: game.podium[1],
    2: game.podium[2],
    3: game.podium[3],
  }

  const { record, userWon, ...gameWithoutRecordAndUserWon } = game;
  if (!game.trainnig) await putDartsGame(gameWithoutRecordAndUserWon);
  setGameState(game);
}

const handleSpecialValue = async (value, specialState, setSpecialState) => {
  if (value === "DOORS") {
    currentUser.throws["doors"] += 1;
    handleUsersState(0, specialState, "DOORS");
  } else if (value === "BACK") {
    handleRecord("back");
  } else if (value === "DOUBLE" || value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
  }
}

const handleNextUser = () => {
  const remainingUsers = users.filter(user => user.place === 0 && user.points > 0);

  if (remainingUsers.length === 0) {
    return;
  }

  let nextUserIndex = (users.findIndex(user => user._id === currentUser._id) + 1) % users.length;
  let nextUser = users[nextUserIndex];

  while (nextUser.place !== 0 || nextUser.points === 0) {
    nextUserIndex = (nextUserIndex + 1) % users.length;
    nextUser = users[nextUserIndex];
  }

  const isLastUser = remainingUsers[remainingUsers.length - 1]._id === currentUser._id;

  nextUser.turn = true;
  nextUser.turns = { 1: null, 2: null, 3: null };
  nextUser.turnsSum = 0;

  setUserState();

  game.turn = nextUser.displayName;
  if (isLastUser) {
    game.round += 1;
  } else if (remainingUsers.length === 1) {
    game.round += 1;
  }
  return nextUser;
}

const handleUsersState = (value, specialState, setSpecialState) => {
  if (specialState[0]) {
    const multiplier = specialState[1] === "DOUBLE" ? 2 : 3;
    currentUser.turns[currentUser.currentTurn] = value * multiplier;
    specialState[1] === "DOUBLE" ? currentUser.throws["doubles"] += 1 : currentUser.throws["triples"] += 1;
    handleTurnsSum();
    handlePoints(specialState[1], value);
    handleAvgPointsPerTurn();
    setSpecialState([false, ""]);
  } else {
    if (setSpecialState !== "DOORS") currentUser.throws["normal"] += 1;
    currentUser.turns[currentUser.currentTurn] = value;
    handleTurnsSum();
    handlePoints();
    handleAvgPointsPerTurn();
  }

  if (game.userWon || !currentUser.turn || !game.active) {
    console.log(game);
    console.log(currentUser);
    // handleRecord("save");
    setGameState(game);
    return;
  }

  if (currentUser.currentTurn === 3 || currentUser.points == 0) {
    currentUser.currentTurn = 1;
    currentUser.turn = false;
    currentUser.allGainedPoints = game.startPoints - currentUser.points;

    const nextUser = handleNextUser();
    nextUser.previousUserPlace = currentUser.place;
    nextUser.turn = true;
    currentUser = nextUser;
  } else {
    currentUser.currentTurn += 1;
  }
  setUserState();
  handleRecord("save");
}

export const handleRecord = (action) => {
  if (!game.active) return;
  if (action === "save") {
    const currentUserCopy = lodash.cloneDeep(currentUser);
    currentUserCopy.turn = true;
    game.record.push({
      game: {
        round: game.round,
        turn: game.turn
      },
      user: currentUserCopy,
    });
  } else if (action === "back") {
    game.record.splice(-1);
    const restoredState = game.record[game.record.length - 1];

    if (restoredState) {
      const currentUserCopy = { ...restoredState.user };

      if (currentUser.previousUserPlace !== 0 && currentUser.currentTurn === 1) {
        game.podium[currentUser.previousUserPlace] = null;
      }

      if (restoredState.game["turn"] !== currentUser.displayName) {
        currentUser.turn = false;
      }
      currentUser = {
        ...currentUserCopy,
        turns: { ...currentUserCopy.turns },
        throws: { ...currentUserCopy.throws },
      };
      game.round = restoredState.game.round;
      game.turn = restoredState.game.turn;
    }
    console.log(game);  
  }
  setUserState();
  setGameState(game);
}

const setUserState = () => {
  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user =>
      user._id === currentUser._id ? currentUser : user
    );
    return updatedUsers;
  });
}

export const setGameState = (gameP) => {
  setGame(gameP);
  game = gameP;
  localStorage.setItem("dartsGame", JSON.stringify(gameP));
}

// Global

export const totalThrows = (user) => {
  return Object.values(user.throws).reduce((acc, val) => acc + val, 0) - user.throws["overthrows"]
}