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

export const handlePoints = (currentUser, action, value) => {
  let firstTurn = currentUser.turns["1"];
  let secondTurn = currentUser.turns["2"];
  let thirdTurn = currentUser.turns["3"];
  const isNumericRegex = (str) => {
    return /^\d+$/.test(str);
  };
  currentUser.points -= currentUser.turns[currentUser.currentTurn];
  
  // optimize
  if(!isNumericRegex(firstTurn) && firstTurn) {
    if(firstTurn[0] === "D") {
      firstTurn = parseInt(firstTurn.slice(1));
      firstTurn *= 2;
    }
    if(firstTurn[0] === "T") {
      firstTurn = parseInt(firstTurn.slice(1));
      firstTurn *= 3;
    }
  }
  if(!isNumericRegex(secondTurn) && secondTurn) {
    if(secondTurn[0] === "D") {
      secondTurn = parseInt(secondTurn.slice(1));
      secondTurn *= 2;
    }
    if(secondTurn[0] === "T") {
      secondTurn = parseInt(secondTurn.slice(1));
      secondTurn *= 3;
    }
  }
  if(!isNumericRegex(thirdTurn) && thirdTurn) {
    if(thirdTurn[0] === "D") {
      thirdTurn = parseInt(thirdTurn.slice(1));
      thirdTurn *= 2;
    }
    if(thirdTurn[0] === "T") {
      thirdTurn = parseInt(thirdTurn.slice(1));
      thirdTurn *= 3;
    }
  }
  const initialUserPoints = parseInt(currentUser.points) + firstTurn + secondTurn + thirdTurn;
  console.log(firstTurn, secondTurn, thirdTurn, initialUserPoints);
  // handleDartsUserStats(users);

  if (currentUser.points < 0) {
    currentUser.points = initialUserPoints;
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;
    currentUser.turns = {1: null, 2: null, 3: null};
    
    console.log('Overthrow.');
  } else if (currentUser.points === 0) {
    game.userWon = currentUser;
    game.active = false;
    handleShow();
  } else {
    if(action) {
      if (action === 'DOUBLE'){
        currentUser.turns[currentUser.currentTurn] = `D${value}`;
      } else if (action === 'TRIPLE'){
        currentUser.turns[currentUser.currentTurn] = `T${value}`;
      }
    }
  }
}

export const handleDartsUserStats = (users) => {
  // statistics
  users.map(async(user) => {
    const dartUser = (await getDoc(doc(db, "dartUsers", user.uid))).data();
    console.log(dartUser)
    await updateDoc(doc(db, "dartUsers", user.uid), {
    });
    // console.log(user)
  })
}

export const handleSpecialValue = async (currentUser, value, users, setUsers, specialState, setSpecialState) => {
  if(value === "DRZWI") {
    handleUsersState(currentUser, 0, users, setUsers, specialState);
    currentUser.throws["drzwi"] += 1;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
      );
      return updatedUsers;
    });
    console.log(currentUser)
    return;
  } else if (value === "DOUBLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, "DOUBLE"]);
  } else if (value === "TRIPLE") {
    specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, "TRIPLE"]);
  }
}

const handleUsersState = (currentUser, value, users, setUsers, specialState, setSpecialState) => {
  // current user
  if (specialState[0]) {
    if (specialState[1] === "DOUBLE") {
      currentUser.turns[currentUser.currentTurn] = value * 2;
      handleTurnsSum(currentUser);
      handlePoints(currentUser, 'DOUBLE', value);
    } else if (specialState[1] === "TRIPLE") {
      currentUser.turns[currentUser.currentTurn] = value * 3;
      handleTurnsSum(currentUser);
      handlePoints(currentUser, 'TRIPLE', value);
    }
    setSpecialState([false, ""])
  } else {
    currentUser.turns[currentUser.currentTurn] = value;
    handleTurnsSum(currentUser);
    handlePoints(currentUser);
  }
  
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
    const nextUserIndex = (users.findIndex(user => user.uid === currentUser.uid) + 1) % users.length;
    const nextUser = users[nextUserIndex]
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