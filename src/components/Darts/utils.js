import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import _ from 'lodash';

let game;
let handleShow;
let currentUser;
let users;
let setUsers;
let showNewToast;

export const handleRound = (value, usersP, gameP, handleShowP, setUsersP, specialState, setSpecialState, showNewToastP) => {
  handleShow = handleShowP;
  game = gameP;
  users = usersP;
  setUsers = setUsersP;
  showNewToast = showNewToastP;
  currentUser = users.find(user => user.turn);
  if (Number.isInteger(value)) {
    handleUsersState(value, specialState, setSpecialState);
  } else if (!Number.isInteger(value)) {
    handleSpecialValue(value, specialState, setSpecialState);
  }
}

export const handleTurnsSum = () => {
  const currentTurn = currentUser.turns[currentUser.currentTurn];
  currentUser.turnsSum += currentTurn;
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
};

export const handlePodium = () => {
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
    handleDartsData();
    handleShow();
    return;
  }
  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (currentUser.place == game.podiums) {
    game.userWon = game.podium[1];
    game.active = false;
    handleDartsData();
    handleShow();
    return;
  }
  if (usersWithoutPodium.length === 1 ) {
    const user = game.users.find(user => user === usersWithoutPodium[0]);
    game.podium[game.podiums] = user.displayName;
    game.userWon = game.podium[1];
    game.active = false;
    handleDartsData();
    handleShow();
    return;
  }
}

export const handleGameEnd = () => {
  if (game.legs === 1 && game.sets === 1){
    handlePodium();
  } else {
    currentUser.legs += 1;
    currentUser.avgPointsPerThrow = 0.00;
    currentUser.turn = false;
    if (currentUser.legs == game.legs) {
      game.users.map((user) => {
        user.legs = 0;
      });
      currentUser.sets += 1;
      if (currentUser.sets == game.sets) {
        handlePodium();
      }
    }
    handleDartsData();
    game.users.map((user) => {
      if (user.place === 0) {
        user.points = game.startPoints;
        user.turns = {1: null, 2: null, 3: null};
        user.throws = {doors: 0, doubles: 0, triples: 0, normal: 0};
        user.turnsSum = 0;
        user.avgPointsPerThrow = 0.00;
        user.currentTurn = 1;
      }
    });
    const nextUser = handleNextUser();
    currentUser = nextUser;
    currentUser.currentTurn = 0;
  }
}

export const handlePoints = (action, value) => {
  const { turns } = currentUser;
  const currentTurnValue = turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  const initialPoints = parseInt(currentUser.points) + calculatePoints(turns["1"]) + calculatePoints(turns["2"]) + calculatePoints(turns["3"]);

  if (currentUser.points < 0) {
    currentUser.points = initialPoints;
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;
    currentUser.turns = { 1: null, 2: null, 3: null };
    console.log('Overthrow.');
  } else if (currentUser.points === 0) {
    handleGameEnd();
  }
  if (action) {
    if (action === 'DOUBLE') {
      turns[currentUser.currentTurn] = `D${value}`;
    } else if (action === 'TRIPLE') {
      turns[currentUser.currentTurn] = `T${value}`;
    }
  }
};

export const handleAvgPointsPerThrow = () => {
  const pointsThrown = game.startPoints - currentUser.points;
  const dartsThrown = Object.values(currentUser.throws).reduce((acc, val) => acc + val, 0);
  const avg = pointsThrown / dartsThrown * 3;
  currentUser.avgPointsPerThrow = (avg).toFixed(2);
  if (isNaN(avg)) currentUser.avgPointsPerThrow = 0;
}

export const convertRecord = (record) => {
  const userTurns = record.user.turns;
  const userThrows = Object.values(record.user.throws).reduce((acc, val) => acc + val, 0);
  record.user = {
    turns: userTurns,
    throws: userThrows
  }
}

export const handleDartsData = async () => {
  users.map(async (user) => {
    const dartUser = (await getDoc(doc(db, "dartUsers", user.uid))).data();

    user.place === 1 ? dartUser.podiums["firstPlace"] += 1 : null;
    user.place === 2 ? dartUser.podiums["secondPlace"] += 1 : null;
    user.place === 3 ? dartUser.podiums["thirdPlace"] += 1 : null;
    dartUser.throws["doors"] += user.throws["doors"];
    dartUser.throws["doubles"] += user.throws["doubles"];
    dartUser.throws["triples"] += user.throws["triples"];
    dartUser.throws["normal"] += user.throws["normal"];
    dartUser.overAllPoints += game.startPoints - user.points;
    !game.active ? dartUser.gamesPlayed += 1 : null;
    
    if (parseFloat(user.avgPointsPerThrow) > parseFloat(dartUser.highestEndingAvg)) dartUser.highestEndingAvg = parseFloat(user.avgPointsPerThrow);

    if(!game.training) await updateDoc(doc(db, "dartUsers", user.uid), {
      ...dartUser
    });
  })

  game.podium = {
    1: game.podium[1],
    2: game.podium[2],
    3: game.podium[3],
  }
  if (!game.active) delete game.record;
  
  if(!game.training) await updateDoc(doc(db, "dartGames", game.id), {
    ...game
  });
}

export const handleSpecialValue = async (value, specialState, setSpecialState) => {
  if (value === "DOORS") {
    currentUser.throws["doors"] += 1;
    handleUsersState(0, specialState, "DOORS");
  } else if (value === "BACK") {
    if (game.record.length > 1) currentUser.turn = false;
    setUserState();
    handleRecord("back");
    setUserState();
  } else if (value === "DOUBLE" || value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
  }
}

export const handleNextUser = () => {
  const remainingUsers = users.filter(user => user.place === 0 && user.points > 0);

  if (remainingUsers.length === 0) {
    return;
  }

  let nextUserIndex = (users.findIndex(user => user.uid === currentUser.uid) + 1) % users.length;
  let nextUser = users[nextUserIndex];

  while (nextUser.place !== 0 || nextUser.points === 0) {
    nextUserIndex = (nextUserIndex + 1) % users.length;
    nextUser = users[nextUserIndex];
  }

  const isLastUser = remainingUsers[remainingUsers.length - 1].uid === currentUser.uid;

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
};

const handleUsersState = (value, specialState, setSpecialState) => {
  if (specialState[0]) {
    const multiplier = specialState[1] === "DOUBLE" ? 2 : 3;
    currentUser.turns[currentUser.currentTurn] = value * multiplier;
    specialState[1] === "DOUBLE" ? currentUser.throws["doubles"] += 1 : currentUser.throws["triples"] += 1;
    handleTurnsSum();
    handlePoints(specialState[1], value);
    handleAvgPointsPerThrow();
    setSpecialState([false, ""]);
  } else {
    if (setSpecialState !== "DOORS") currentUser.throws["normal"] += 1;
    currentUser.turns[currentUser.currentTurn] = value;
    handleTurnsSum();
    handlePoints();
    handleAvgPointsPerThrow();
  }

  if (game.userWon || !currentUser.turn) return;
  

  if (currentUser.currentTurn === 3 || currentUser.points == 0 ) {
    currentUser.currentTurn = 1;
    currentUser.turn = false;
    const nextUser = handleNextUser();
    nextUser.previousUserPlace = currentUser.place;
    nextUser.turn = true;
    currentUser = nextUser;
  } else {
    currentUser.currentTurn += 1;
  }
  console.log(currentUser);
  setUserState();
  handleRecord("save");
}

const handleRecord = (action) => {
  if (!game.active) return;
  if (action === "save") {
    const currentUserCopy = _.cloneDeep(currentUser);
    currentUserCopy.turn = true;
    const gameCopy = _.pick(game, ['round', 'turn', 'record']);
    game.record.push({
      game: {
        round: gameCopy.round,
        turn: gameCopy.turn
      },
      user: currentUserCopy,
    });
    console.log(game.record);
  } else if (action === "back") {
    if (game.record.length >= 2) {
      console.log(game.record);
      game.record.splice(-1);
      const restoredState = game.record[game.record.length - 1];

      if (restoredState) {
        const currentUserCopy = { ...restoredState.user };

        if (currentUser.previousUserPlace !== 0 && currentUser.currentTurn === 1) {
          game.podium[currentUser.previousUserPlace] = null;
        }

        currentUser = {
          ...currentUserCopy,
          turns: { ...currentUserCopy.turns },
          throws: { ...currentUserCopy.throws },
        };
        game.round = restoredState.game.round;
        game.turn = restoredState.game.turn;
      }
    } else {
      showNewToast("Back button", "This is the start of the game")
    }
  }
};

const setUserState = () => {
  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user =>
      user.uid === currentUser.uid ? currentUser : user
    );
    return updatedUsers;
  });
}