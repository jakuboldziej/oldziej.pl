import { doorsValueReverseX01, handlePodiumReverseX01, handlePointsReverseX01, zeroValueReverseX01 } from '@/components/Home/Darts/game logic/game modes/Reverse X01';
import { handleNextLeg, handlePodiumX01, handlePointsX01 } from '@/components/Home/Darts/game logic/game modes/X01';
import { calculatePoints, handleAvgPointsPerTurn, handleTurnsSum } from '@/components/Home/Darts/game logic/userUtils';
import { getDartsUser, patchDartsGame, patchDartsUser } from '@/lib/fetch';
import { socket } from '@/lib/socketio';
import { createContext, useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { handleWLEDGameEnd, handleWLEDThrow180, handleWLEDThrowD25, handleWLEDThrowDoors, handleWLEDThrowT20 } from '@/components/Home/Darts/game logic/wledController';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(() => {
    const storedGame = localStorage.getItem('dartsGame');
    return storedGame ? JSON.parse(storedGame) : null;
  });
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);

  const [dartsUsersBeforeBack, setDartsUsersBeforeBack] = useState([]);

  const currentUser = useMemo(() => {
    if (!game || !game.users) return null;
    return game.users.find(user => user.turn);
  }, [game]);

  let handleShow;

  const updateGameState = async (gameP) => {
    try {
      const gameCopy = {
        ...gameP,
        users: gameP.users ? gameP.users.map(user => ({ ...user })) : []
      };

      setGame(gameCopy);
      localStorage.setItem("dartsGame", JSON.stringify(gameCopy));

      if (gameCopy?.training) return;

      socket.emit("updateLiveGamePreview", JSON.stringify(gameCopy));

      const { record, userWon, ...restGameData } = gameCopy;
      await patchDartsGame(restGameData);
    } catch (err) {
      console.error("Error updating game", err);
      ShowNewToast("Error updating game", err, "error");
    }
  }

  const handleRound = (value, handleShowP) => {
    handleShow = handleShowP;

    if (Number.isInteger(value)) {
      handleUsersState(value);
    } else if (!Number.isInteger(value)) {
      handleSpecialValue(value);
    }
  };

  const handlePodium = () => {
    if (game.gameMode === "X01") {
      handlePodiumX01(game, currentUser);
      handleDartsData();
    } else if (game.gameMode === "Reverse X01") {
      handlePodiumReverseX01(game);
    }
    handleShow();
  };

  const handleGameEnd = () => {
    if (game.legs === 1) {
      handleRecord("save");
      handlePodium();
      handleWLEDGameEnd(game.gameCode);
      return true;
    } else {
      const endGame = handleNextLeg(game.users, game);

      if (endGame) {
        handleRecord("save");
        handlePodium();
        handleWLEDGameEnd(game.gameCode);
        return true;
      } else {
        if (game.round !== 1) game.round = 0;
        return false;
      }
    }
  };

  const handlePoints = (action, value) => {
    const { turns } = currentUser;

    if (action) {
      if (action === 'DOUBLE') {
        turns[currentUser.currentTurn] = `D${value}`;

        if (turns[currentUser.currentTurn] === "D25") handleWLEDThrowD25(game.gameCode);
      } else if (action === 'TRIPLE') {
        turns[currentUser.currentTurn] = `T${value}`;

        if (turns[currentUser.currentTurn] === "T20" && !(
          turns[1] === "T20" &&
          turns[2] === "T20" &&
          turns[3] === "T20"
        )
        ) handleWLEDThrowT20(game.gameCode);
      }
    }

    let stop = false;
    if (game.gameMode === "X01") stop = handlePointsX01(setOverthrow, game, currentUser);
    if (game.gameMode === "Reverse X01") stop = handlePointsReverseX01(currentUser);

    handleAvgPointsPerTurn(currentUser, game);

    if (stop) {
      const endGame = handleGameEnd();

      if (endGame) return true;
      else return false;
    }
  };

  const handleDartsData = async () => {
    const usersBeforeBack = await handleUsersBeforeBack();

    await updateUsersData(usersBeforeBack);

    game.podium = {
      1: game.podium[1],
      2: game.podium[2],
      3: game.podium[3],
    };


    updateGameState(game);
  };

  const handleUsersBeforeBack = async () => {
    const tempUsers = await Promise.all(
      game.users.map(async (user) => {
        const dartUser = await getDartsUser(user.displayName);
        return JSON.parse(JSON.stringify(dartUser));
      })
    );

    setDartsUsersBeforeBack(JSON.parse(JSON.stringify(tempUsers)));
    return tempUsers;
  };

  const updateUsersData = async (usersBeforeBack) => {
    try {
      await Promise.all(game.users.map(async (user) => {
        if (game.legs === 1 && game.sets === 1) user.highestGameAvg = user.avgPointsPerTurn;

        if (user.temporary || user.verified === false) return;
        if (game.training) return

        const freshDartUser = await getDartsUser(user.displayName);
        const dartUser = JSON.parse(JSON.stringify(freshDartUser));
        const userOriginalData = JSON.parse(JSON.stringify(dartUser));

        if (user.place === 1) dartUser.podiums["firstPlace"] += 1;
        if (user.place === 2) dartUser.podiums["secondPlace"] += 1;
        if (user.place === 3) dartUser.podiums["thirdPlace"] += 1;

        dartUser.throws["doors"] += user.throws["doors"];
        dartUser.throws["doubles"] += user.throws["doubles"];
        dartUser.throws["triples"] += user.throws["triples"];
        dartUser.throws["normal"] += user.throws["normal"];

        if (game.gameMode === "X01") {
          dartUser.throws["overthrows"] += user.throws["overthrows"];
          dartUser.overAllPoints += user.allGainedPoints;
          currentUser.gameCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3]);

          if (parseFloat(user.highestGameAvg) > parseFloat(dartUser.highestEndingAvg)) dartUser.highestEndingAvg = parseFloat(user.highestGameAvg);
          if (parseFloat(user.highestGameTurnPoints) > parseFloat(dartUser.highestTurnPoints)) dartUser.highestTurnPoints = parseFloat(user.highestGameTurnPoints);
          if (user.gameCheckout > dartUser.highestCheckout) dartUser.highestCheckout = user.gameCheckout;
        }

        dartUser.gamesPlayed += 1;

        try {
          const updatedDartsUser = await patchDartsUser(dartUser);

          if (JSON.stringify(userOriginalData) === JSON.stringify(updatedDartsUser)) {
            ShowNewToast("Darts game", `${userOriginalData.displayName}'s data didn't update properly.`);
          }
        } catch (error) {
          console.error("Error updating user.", error);
        }
      }));
    } catch (error) {
      console.error("Error in updateUsersData:", error);
      ShowNewToast("Darts game", `Error updating user data: ${error.message}`, "error");
    }
  }

  const handleSpecialValue = async (value) => {
    if (value === "DOORS") {
      handleWLEDThrowDoors(game.gameCode);
      if (game.gameMode === "Reverse X01") {
        handleUsersState(doorsValueReverseX01);
      } else {
        handleUsersState("DOORS");
      }
    } else if (value === "BACK") {
      handleRecord("back");
    } else if (value === "DOUBLE" || value === "TRIPLE") {
      specialState[0] ? setSpecialState([false, ""]) : setSpecialState([true, value]);
    }
  };

  const handleNextUser = () => {
    const remainingUsers = game.users.filter(user => user.place === 0);

    if (remainingUsers.length === 0) {
      return;
    }

    let nextUserIndex = (game.users.findIndex(user => user._id === currentUser._id) + 1) % game.users.length;
    let nextUser = game.users[nextUserIndex];

    while (nextUser.place !== 0) {
      nextUserIndex = (nextUserIndex + 1) % game.users.length;
      nextUser = game.users[nextUserIndex];
    }

    nextUser.turn = true;
    nextUser.turns = { 1: null, 2: null, 3: null };
    nextUser.turnsSum = 0;

    game.turn = nextUser.displayName;

    const isLastUser = remainingUsers[remainingUsers.length - 1]._id === currentUser._id;

    if (isLastUser) game.round += 1;

    return nextUser;
  };

  const handleUsersState = (value) => {
    if (specialState[0]) {
      const multiplier = specialState[1] === "DOUBLE" ? 2 : 3;
      currentUser.turns[currentUser.currentTurn] = value * multiplier;
      specialState[1] === "DOUBLE" ? currentUser.throws["doubles"] += 1 : currentUser.throws["triples"] += 1;
      specialState[1] === "DOUBLE" ? currentUser.currentThrows["doubles"] += 1 : currentUser.currentThrows["triples"] += 1;
      handleTurnsSum(currentUser);
      handlePoints(specialState[1], value);
      setSpecialState([false, ""]);
    } else {
      if (value === "DOORS") {
        currentUser.turns[currentUser.currentTurn] = 0;
        currentUser.throws["doors"] += 1;
        currentUser.currentThrows["doors"] += 1;
        value = 0;
      }
      else {
        currentUser.throws["normal"] += 1;
        currentUser.currentThrows["normal"] += 1;
      }
      if (game.gameMode === "Reverse X01" && value === 0) {
        currentUser.turns[currentUser.currentTurn] = zeroValueReverseX01;
      } else {
        currentUser.turns[currentUser.currentTurn] = value;
      }
      handleTurnsSum(currentUser);
      handlePoints(null, value);
    }

    if (game.userWon || !currentUser.turn || game.active === false) {
      return;
    }

    if (currentUser.currentTurn === 3) {
      currentUser.currentTurn = 1;
      currentUser.turn = false;

      if (currentUser.turns[1] === "T20" &&
        currentUser.turns[2] === "T20" &&
        currentUser.turns[3] === "T20") handleWLEDThrow180(game.gameCode);

      const nextUser = handleNextUser();
      nextUser.turn = true;
    } else {
      currentUser.currentTurn += 1;
    }

    handleRecord("save");
  };

  const handleRecord = (action) => {
    if (!game.active) return;
    if (action === "save") {
      const usersCopy = lodash.cloneDeep(game.users);

      game.record.push({
        game: {
          round: game.round,
          turn: game.turn,
        },
        users: [...usersCopy],
      });
    } else if (action === "back") {
      game.record.splice(-1);

      const restoredState = game.record[game.record.length - 1];

      if (restoredState) {
        const updatedUsers = restoredState.users.map((user) => {
          const userCopy = { ...user };
          return {
            ...userCopy,
            turns: { ...userCopy.turns },
            throws: { ...userCopy.throws },
            currentThrows: { ...userCopy.currentThrows },
          };
        });

        game.users = updatedUsers;

        game.round = restoredState.game.round;
        game.turn = restoredState.game.turn;

        if (dartsUsersBeforeBack.length > 0) {
          restoreUsersSummaryBack();
          setDartsUsersBeforeBack([]);
        }
      }
    }

    updateGameState(game);
  };

  const restoreUsersSummaryBack = async () => {
    await Promise.all(
      dartsUsersBeforeBack.map(async (user) => {
        await patchDartsUser(user);
      })
    );
  }

  const clearDartsUsersBackup = () => {
    setDartsUsersBeforeBack([]);
  }

  const contextParams = {
    game,
    setGame,
    currentUser,
    handleRound,
    overthrow,
    setOverthrow,
    specialState,
    updateGameState,
    clearDartsUsersBackup
  }

  return (
    <DartsGameContext.Provider value={contextParams}>
      {children}
    </DartsGameContext.Provider>
  );
};