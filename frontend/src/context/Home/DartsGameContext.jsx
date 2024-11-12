import { handlePodiumReverseX01, handlePointsReverseX01 } from '@/components/Home/Darts/game logic/game modes/Reverse X01';
import { handleNextLeg, handlePodiumX01, handlePointsX01 } from '@/components/Home/Darts/game logic/game modes/X01';
import { calculatePoints, handleAvgPointsPerTurn, handleTurnsSum } from '@/components/Home/Darts/game logic/userUtils';
import { getDartsUser, putDartsGame, putDartsUser } from '@/lib/fetch';
import { socket } from '@/lib/socketio';
import { createContext, useMemo, useState } from 'react';
import lodash from 'lodash';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(() => {
    const storedGame = localStorage.getItem('dartsGame');
    return storedGame ? JSON.parse(storedGame) : null;
  });
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);

  const currentUser = useMemo(() => {
    if (!game || !game.users) return null;
    return game.users.find(user => user.turn);
  }, [game]);

  let handleShow;

  const updateGameState = async (gameP) => {
    const gameCopy = { ...gameP };

    setGame(gameCopy);
    if (game?.training) return;

    socket.emit("updateLiveGamePreview", JSON.stringify(gameCopy));
    localStorage.setItem("dartsGame", JSON.stringify(gameCopy));

    const { record, userWon, ...restGameData } = gameCopy;
    await putDartsGame(restGameData);
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
      handleRecord("save", false);
      handlePodium();
      return true;
    } else {
      const endGame = handleNextLeg(game.users, game);

      if (endGame) {
        handleRecord("save", false);
        handlePodium();
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
      } else if (action === 'TRIPLE') {
        turns[currentUser.currentTurn] = `T${value}`;
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
    if (!game.training) {
      game.users.map(async (user) => {
        if (user.temporary || user.verified === false) return;

        const dartUser = await getDartsUser(user.displayName);

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

          if (game.legs === 1 && game.sets === 1) user.highestGameAvg = user.avgPointsPerTurn;
          if (parseFloat(user.highestGameAvg) > parseFloat(dartUser.highestEndingAvg)) dartUser.highestEndingAvg = parseFloat(user.highestGameAvg);
          if (parseFloat(user.highestGameTurnPoints) > parseFloat(dartUser.highestTurnPoints)) dartUser.highestTurnPoints = parseFloat(user.highestGameTurnPoints);
          if (user.gameCheckout > dartUser.highestCheckout) dartUser.highestCheckout = user.gameCheckout;
        }

        dartUser.gamesPlayed += 1;

        await putDartsUser(dartUser);
      });
    }

    game.podium = {
      1: game.podium[1],
      2: game.podium[2],
      3: game.podium[3],
    };

    updateGameState(game);
  };

  const handleSpecialValue = async (value) => {
    if (value === "DOORS") {
      currentUser.throws["doors"] += 1;
      currentUser.currentThrows["doors"] += 1;
      if (game.gameMode === "Reverse X01") {
        handleUsersState(doorsValueReverseX01);
      } else {
        handleUsersState(0);
      }
    } else if (value === "BACK") {
      handleRecord("back", false);
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
    if (isLastUser) {
      game.round += 1;
    }
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
      if (setSpecialState !== "DOORS") currentUser.throws["normal"] += 1;
      if (setSpecialState !== "DOORS") currentUser.currentThrows["normal"] += 1;
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

      const nextUser = handleNextUser();
      nextUser.turn = true;
    } else {
      currentUser.currentTurn += 1;
    }

    handleRecord("save", false);
  };

  const handleRecord = (action, backSummary = false) => {
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
      if (!backSummary) game.record.splice(-1);
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
      }
    }

    updateGameState(game);
  };

  const contextParams = {
    game,
    setGame,
    currentUser,
    handleRound,
    overthrow,
    setOverthrow,
    specialState,
    updateGameState
  }

  return (
    <DartsGameContext.Provider value={contextParams}>
      {children}
    </DartsGameContext.Provider>
  );
};