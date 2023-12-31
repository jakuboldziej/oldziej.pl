import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

let game;
let handleShow;
let currentUser;
let users;

export const handleRound = (value, usersP, gameP, handleShowP, setUsers, specialState, setSpecialState) => {
  handleShow = handleShowP;
  game = gameP;
  users = usersP;
  currentUser = users.find(user => user.turn);
  if (Number.isInteger(value)) {
    handleUsersState(value, setUsers, specialState, setSpecialState);
  } else if (!Number.isInteger(value)) {
    handleSpecialValue(value, setUsers, specialState, setSpecialState);
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

export const handleGameEnd = () => {
  if (game.podiums > 1) {
    if (game.podium[1] !== null) {
      let lastNonNullElement = null;
      for (let i = Object.keys(game.podium).length - 1; i >= 0; i--) {
        if (game.podium[i] !== null) {
          lastNonNullElement = [i, game.podium[i]];
          break;
        }
      }
      currentUser.place = lastNonNullElement[1].place + 1;
      game.podium[lastNonNullElement[0] + 1] = currentUser;
    } else {
      currentUser.place = 1;
      game.podium[1] = currentUser;
    }
  } else {
    currentUser.place = 1;
    game.podium[1] = currentUser;
    game.userWon = currentUser;
    game.active = false;
    handleDartsData();
    handleShow();
    return;
  }
  if (currentUser.place == game.podiums) {
    game.userWon = game.podium[1];
    game.active = false;
    handleDartsData();
    handleShow();
    return;
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
}

export const handleDartsData = async () => {
  // statistics
  users.map(async (user) => {
    const dartUser = (await getDoc(doc(db, "dartUsers", user.uid))).data();
    user.place === 1 ? dartUser.podiums["firstPlace"] += 1 : null;
    user.place === 2 ? dartUser.podiums["secondPlace"] += 1 : null;
    user.place === 3 ? dartUser.podiums["thirdPlace"] += 1 : null;
    dartUser.throws["drzwi"] += user.throws["drzwi"];
    dartUser.throws["doubles"] += user.throws["doubles"];
    dartUser.throws["triples"] += user.throws["triples"];
    dartUser.throws["normal"] += user.throws["normal"];
    dartUser.overAllPoints += game.startPoints - user.points;
    await updateDoc(doc(db, "dartUsers", user.uid), {
      ...dartUser
    });
  })
  await updateDoc(doc(db, "dartGames", game.id), {
    ...game
  });
}

export const handleSpecialValue = async (value, setUsers, specialState, setSpecialState) => {
  if (value === "DRZWI") {
    currentUser.throws["drzwi"] += 1;
    handleUsersState(0, setUsers, specialState, "DRZWI");
  } else if (value === "DOUBLE" || value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
  }
}

export const handleNextUser = (setUsers) => {
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

  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user =>
      user.uid === nextUser.uid ? nextUser : user
      );
      return updatedUsers;
  });

  game.turn = nextUser.displayName;
  if (isLastUser) {
    game.round += 1;
  } else if (remainingUsers.length === 1) {
    game.round += 1;
  }
};

const handleUsersState = (value, setUsers, specialState, setSpecialState) => {
  if (specialState[0]) {
    const multiplier = specialState[1] === "DOUBLE" ? 2 : 3;
    currentUser.turns[currentUser.currentTurn] = value * multiplier;
    specialState[1] === "DOUBLE" ? currentUser.throws["doubles"] += 1 : currentUser.throws["triples"] += 1;
    handleTurnsSum();
    handlePoints(specialState[1], value);
    handleAvgPointsPerThrow();
    setSpecialState([false, ""]);
  } else {
    if (setSpecialState !== "DRZWI") currentUser.throws["normal"] += 1;
    currentUser.turns[currentUser.currentTurn] = value;
    handleTurnsSum();
    handlePoints();
    handleAvgPointsPerThrow();
  }

  if (currentUser.currentTurn === 3 || currentUser.points == 0) {
    currentUser.currentTurn = 1;
    currentUser.turn = false;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
      );
      return updatedUsers;
    });
    handleNextUser(setUsers);
    return;
  } else {
    currentUser.currentTurn += 1;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
        );
      return updatedUsers;
    });
  }
}