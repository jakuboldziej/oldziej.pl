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
  const firstTurn = currentUser.turns["1"];
  const secondTurn = currentUser.turns["2"];
  const thirdTurn = currentUser.turns["3"];
  currentUser.turnsSum = firstTurn + secondTurn + thirdTurn; 

  if (firstTurn === "DOUBLE")  {
    console.log(firstTurn)
  }
}

export const handlePoints = (currentUser) => {
  currentUser.points -= currentUser.turns[currentUser.currentTurn];
  const initialUserPoints = parseInt(currentUser.points) + currentUser.turns["1"] + currentUser.turns["2"] + currentUser.turns["3"];
  // handleDartsUserStats(users);

  if (currentUser.points < 0) {
    currentUser.points = initialUserPoints;
    currentUser.turns = {1: null, 2: null, 3: null}
    currentUser.turnsSum = 0;
    currentUser.currentTurn = 3;

    console.log('Overthrow.')
  } else if (currentUser.points === 0) {
    game.userWon = currentUser;
    game.active = false;
    handleShow();
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
    handleUsersState(currentUser, 0, users, setUsers);
    currentUser.shots["drzwi"] += 1;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
      );
      return updatedUsers;
    });
    return;
  } else if (value === "DOUBLE") {
    setSpecialState([true, "DOUBLE"]);
  } else if (value === "TRIPLE") {
    setSpecialState([true, "TRIPLE"]);
  }
}

const handleUsersState = (currentUser, value, users, setUsers, specialState, setSpecialState) => {
  // current user
  if (specialState[0]) {
    if (specialState[1] === "DOUBLE") {
      currentUser.turns[currentUser.currentTurn] = value * 2;
      console.log(currentUser.turns)
    } else if (specialState[1] === "TRIPLE") {
      currentUser.turns[currentUser.currentTurn] = value * 3;
    }
    setSpecialState([false, ""])
  } else {
    console.log('normal')
    currentUser.turns[currentUser.currentTurn] = value;
  }
  handleTurnsSum(currentUser);
  handlePoints(currentUser, game);
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