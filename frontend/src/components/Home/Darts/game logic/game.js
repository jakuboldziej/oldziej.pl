import lodash from 'lodash';
import { getDartsUser, putDartsGame, putDartsUser } from "@/fetch";
import { calculatePoints, handleAvgPointsPerTurn, handleTurnsSum, setCurrentUserState, totalThrows } from './userUtils';
import { handlePodiumX01, handlePointsX01 } from './game modes/X01';
import { doorsValueReverseX01, handlePodiumReverseX01, handlePointsReverseX01, zeroValueReverseX01 } from './game modes/Reverse X01';

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

const handlePodium = () => {
  if (game.gameMode === "X01") {
    handlePodiumX01();
    handleDartsData();
  }
  else if (game.gameMode === "Reverse X01") handlePodiumReverseX01();
  handleShow();
}

const handleGameEnd = () => {
  currentUser.gameCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3]);
  currentUser.allGainedPoints = game.startPoints - currentUser.points;
  handlePodium();
}

const handlePoints = (action, value) => {
  const { turns } = currentUser;

  if (action) {
    if (action === 'DOUBLE') {
      turns[currentUser.currentTurn] = `D${value}`;
    } else if (action === 'TRIPLE') {
      turns[currentUser.currentTurn] = `T${value}`;
    }
  }
  let end = false;
  if (game.gameMode === "X01") end = handlePointsX01(setOverthrow);
  if (game.gameMode === "Reverse X01") end = handlePointsReverseX01();
  if (end) handleGameEnd();
}

const handleDartsData = async () => {
  if (!game.training) {
    users.map(async (user) => {
      if (user.temporary) return;
      const dartUser = await getDartsUser(user.displayName);

      user.place === 1 ? dartUser.podiums["firstPlace"] += 1 : null;
      user.place === 2 ? dartUser.podiums["secondPlace"] += 1 : null;
      user.place === 3 ? dartUser.podiums["thirdPlace"] += 1 : null;

      dartUser.throws["doors"] += user.throws["doors"];
      dartUser.throws["doubles"] += user.throws["doubles"];
      dartUser.throws["triples"] += user.throws["triples"];
      dartUser.throws["normal"] += user.throws["normal"];

      if (game.gameMode === "X01") {
        dartUser.throws["overthrows"] += user.throws["overthrows"];
        dartUser.overAllPoints += game.startPoints - user.points;

        if (parseFloat(user.highestGameTurnPoints) > parseFloat(dartUser.highestTurnPoints)) dartUser.highestTurnPoints = parseFloat(user.highestGameTurnPoints);
        if (parseFloat(user.avgPointsPerTurn) > parseFloat(dartUser.highestEndingAvg)) dartUser.highestEndingAvg = parseFloat(user.avgPointsPerTurn);
        if (user.gameCheckout > dartUser.highestCheckout) dartUser.highestCheckout = user.gameCheckout;
      }

      !game.active ? dartUser.gamesPlayed += 1 : null;

      await putDartsUser(dartUser);
    });
  }

  game.podium = {
    1: game.podium[1],
    2: game.podium[2],
    3: game.podium[3],
  }

  setGameState(game);
}

const handleSpecialValue = async (value, specialState, setSpecialState) => {
  if (value === "DOORS") {
    currentUser.throws["doors"] += 1;
    if (game.gameMode === "Reverse X01") {
      handleUsersState(doorsValueReverseX01, specialState);
    } else {
      handleUsersState(0, specialState, "DOORS");
    }
  } else if (value === "BACK") {
    handleRecord("back");
  } else if (value === "DOUBLE" || value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
  }
}

const handleNextUser = () => {
  const remainingUsers = users.filter(user => user.place === 0);

  if (remainingUsers.length === 0) {
    return;
  }

  let nextUserIndex = (users.findIndex(user => user._id === currentUser._id) + 1) % users.length;
  let nextUser = users[nextUserIndex];

  while (nextUser.place !== 0) {
    nextUserIndex = (nextUserIndex + 1) % users.length;
    nextUser = users[nextUserIndex];
  }

  const isLastUser = remainingUsers[remainingUsers.length - 1]._id === currentUser._id;

  nextUser.turn = true;
  nextUser.turns = { 1: null, 2: null, 3: null };
  nextUser.turnsSum = 0;

  setCurrentUserState();

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
    if (game.gameMode === "Reverse X01" && value === 0) {
      currentUser.turns[currentUser.currentTurn] = zeroValueReverseX01;
    } else {
      currentUser.turns[currentUser.currentTurn] = value;
    }
    handleTurnsSum();
    handlePoints();
    handleAvgPointsPerTurn();
  }

  if (game.userWon || !currentUser.turn || !game.active) {
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
  setCurrentUserState();
  handleRecord("save");
}

export const handleRecord = (action, backSummary = false) => {
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
    if (!backSummary) game.record.splice(-1);
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
  }
  setCurrentUserState();
  setGameState(game);
}

export const setGameState = async (gameP) => {
  const { record, userWon, ...gameWithoutRecordAndUserWon } = gameP;
  if (!gameP.training) await putDartsGame(gameWithoutRecordAndUserWon);
  setGame(gameP);
  localStorage.setItem("dartsGame", JSON.stringify(gameP));
}

export { game, setUsers, currentUser };