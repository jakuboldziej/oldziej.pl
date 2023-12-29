import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

let game;
let handleShow;

export const handleRound = (value, users, gameP, handleShowP, setUsers, specialState, setSpecialState) => {
  handleShow = handleShowP;
  game = gameP;
  const currentUser = users.find(user => user.turn);
  if (Number.isInteger(value)){
    handleUsersState(currentUser, value, users, setUsers, specialState, setSpecialState);
  } else if (!Number.isInteger(value)) {
    handleSpecialValue(currentUser, value, users, setUsers, specialState, setSpecialState);
  }
}

export const handleTurnsSum = (currentUser) => {
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

export const handleGameEnd = (currentUser) => {
  if (game.podiums > 1) {
    let usersPodiums = [];
    game.users.map((user) => {
      if (user.place !== 0) usersPodiums.push([user, user.place])
    })
    if (usersPodiums.length > 0) {
      const lastPodiumUser = usersPodiums[usersPodiums.length - 1];
      const winner = usersPodiums[0][0];
      currentUser.place = lastPodiumUser[1] + 1;
      console.log(winner);
      if (currentUser.place == game.podiums) {
        game.userWon = winner;
        game.active = false;
        handleShow();
      }
    } else {
      currentUser.place = 1;
    }
  } else {
    game.userWon = currentUser;
    game.active = false;
    handleShow();
  }
}

export const handlePoints = (currentUser, action, value) => {
  const { turns, currentTurn } = currentUser;
  const currentTurnValue = turns[currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  const initialPoints = parseInt(currentUser.points) + calculatePoints(turns["1"]) + calculatePoints(turns["2"]) + calculatePoints(turns["3"]);

  if (currentUser.points < 0) {
    currentUser.points = initialPoints;
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;
    currentUser.turns = { 1: null, 2: null, 3: null };
    console.log('Overthrow.');
  } else if (currentUser.points === 0) {
    handleGameEnd(currentUser);
  }
  if (action) {
    if (action === 'DOUBLE') {
      turns[currentTurn] = `D${value}`;
    } else if (action === 'TRIPLE') {
      turns[currentTurn] = `T${value}`;
    }
  }
};

export const handleAvgPointsPerThrow = (currentUser) => {
  const throws = Object.values(currentUser.throws).reduce((acc, val) => acc + val, 0);
  currentUser.avgPointsPerThrow = ((game.startPoints - currentUser.points) / throws).toFixed(2);
}

export const handleDartsUserStats = (users) => {
  // statistics
  users.map(async(user) => {
    const dartUser = (await getDoc(doc(db, "dartUsers", user.uid))).data();
    console.log(dartUser)
    await updateDoc(doc(db, "dartUsers", user.uid), {
    });
  })
}

export const handleSpecialValue = async (currentUser, value, users, setUsers, specialState, setSpecialState) => {
  if(value === "DRZWI") {
    currentUser.throws["drzwi"] += 1;
    handleUsersState(currentUser, 0, users, setUsers, specialState, "DRZWI");
  } else if (value === "DOUBLE" || value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
  }
}

const handleUsersState = (currentUser, value, users, setUsers, specialState, setSpecialState) => {
  if (specialState[0]) {
    const multiplier = specialState[1] === "DOUBLE" ? 2 : 3;
    currentUser.turns[currentUser.currentTurn] = value * multiplier;
    specialState[1] === "DOUBLE" ? currentUser.throws["doubles"] += 1 : currentUser.throws["triples"] += 1;
    handleTurnsSum(currentUser);
    handlePoints(currentUser, specialState[1], value);
    handleAvgPointsPerThrow(currentUser);
    setSpecialState([false, ""]);
  } else {
    if (setSpecialState !== "DRZWI") currentUser.throws["normal"] += 1;
    currentUser.turns[currentUser.currentTurn] = value;
    handleTurnsSum(currentUser);
    handlePoints(currentUser);
    handleAvgPointsPerThrow(currentUser);
  }
  // console.log(currentUser.avgPointsPerThrow);
  
  if (currentUser.currentTurn === 3) {
    currentUser.currentTurn = 1;
    currentUser.turn = false;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
      );
      return updatedUsers;
    });
    // next user
    let nextUserIndex = (users.findIndex(user => user.uid === currentUser.uid) + 1) % users.length;
    let nextUser = users[nextUserIndex]
    if (nextUser.place !== 0) {
      nextUserIndex = (users.findIndex(user => user.uid === currentUser.uid) + 2) % users.length;
      nextUser = users[nextUserIndex];
      console.log(nextUser);
    }
    nextUser.turn = true;
    nextUser.turns = {1: null, 2: null, 3: null}
    nextUser.turnsSum = 0;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === nextUser.uid ? nextUser : user
        );
        return updatedUsers;
      });
    // game info
    game.turn = nextUser.displayName;
    nextUserIndex === 0 ? game.round += 1 : null
    return;
  }
  currentUser.currentTurn += 1;
  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user =>
      user.uid === currentUser.uid ? currentUser : user
    );
    return updatedUsers;
  });
}