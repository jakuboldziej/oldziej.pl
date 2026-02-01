import { createContext, useEffect, useMemo, useState, useRef } from 'react';
import {
  subscribeToGameUpdates,
  subscribeToOverthrows,
  subscribeToGameEnd,
  subscribeToPlayAgain,
  subscribeToCreateNewGame,
  joinGameRoom,
  leaveGameRoom,
  sendThrow,
  sendBack
} from '@/lib/dartsGameSocket';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(() => {
    const storedGame = localStorage.getItem('dartsGame');
    if (!storedGame) return null;

    const parsedGame = JSON.parse(storedGame);

    if (parsedGame && !parsedGame.record) {
      if (parsedGame.lastRecord) {
        parsedGame.record = [parsedGame.lastRecord];
      } else {
        parsedGame.record = [{
          game: {
            round: parsedGame.round,
            turn: parsedGame.turn
          },
          users: parsedGame.users.map(user => ({ ...user }))
        }];
      }
    }

    return parsedGame;
  });
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);
  const subscribedGameCode = useRef(null);
  const handleShowRef = useRef(null);

  const currentUser = useMemo(() => {
    if (!game || !game.users) return null;
    return game.users.find(user => user.turn);
  }, [game]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedGame = localStorage.getItem('dartsGame');
      if (!storedGame || storedGame === 'null') {
        setGame(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const storedGame = localStorage.getItem('dartsGame');
      if (!storedGame || storedGame === 'null') {
        if (game !== null) {
          setGame(null);
        }
      } else {
        try {
          const parsedStoredGame = JSON.parse(storedGame);
          if (parsedStoredGame && parsedStoredGame._id !== game?._id) {
            if (!parsedStoredGame.record) {
              if (parsedStoredGame.lastRecord) {
                parsedStoredGame.record = [parsedStoredGame.lastRecord];
              } else {
                parsedStoredGame.record = [{
                  game: {
                    round: parsedStoredGame.round,
                    turn: parsedStoredGame.turn
                  },
                  users: parsedStoredGame.users.map(user => ({ ...user }))
                }];
              }
            }
            setGame(parsedStoredGame);
          }
        } catch (e) {
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [game]);

  useEffect(() => {
    const gameCode = game?.gameCode;

    if (!gameCode || subscribedGameCode.current === gameCode) return;

    subscribedGameCode.current = gameCode;

    // Join game room
    joinGameRoom(gameCode);

    const unsubscribeUpdates = subscribeToGameUpdates(gameCode, (updatedGame) => {
      if (!updatedGame.record) {
        if (updatedGame.lastRecord) {
          updatedGame.record = [updatedGame.lastRecord];
        } else {
          updatedGame.record = [{
            game: {
              round: updatedGame.round,
              turn: updatedGame.turn
            },
            users: updatedGame.users.map(user => ({ ...user }))
          }];
        }
      }
      setGame(updatedGame);
      localStorage.setItem("dartsGame", JSON.stringify(updatedGame));
    });

    const unsubscribeOverthrows = subscribeToOverthrows((userDisplayName) => {
      setOverthrow(userDisplayName);
      setTimeout(() => setOverthrow(false), 2000);
    });

    const unsubscribeGameEnd = subscribeToGameEnd((endedGame) => {
      setGame(endedGame);
      localStorage.setItem("dartsGame", JSON.stringify(endedGame));
      if (handleShowRef.current) handleShowRef.current();
    });

    const unsubscribeToPlayAgain = subscribeToPlayAgain((newGame) => {
      if (!newGame.record) {
        if (newGame.lastRecord) {
          newGame.record = [newGame.lastRecord];
        } else {
          newGame.record = [{
            game: {
              round: newGame.round,
              turn: newGame.turn
            },
            users: newGame.users.map(user => ({ ...user }))
          }];
        }
      }
      setGame(newGame);
      localStorage.setItem("dartsGame", JSON.stringify(newGame));
    });

    const unsubscribeToCreateNewGame = subscribeToCreateNewGame((newGame) => {

    });

    return () => {
      unsubscribeToCreateNewGame();
      unsubscribeToPlayAgain();
      unsubscribeUpdates();
      unsubscribeOverthrows();
      unsubscribeGameEnd();
      leaveGameRoom(gameCode);
      subscribedGameCode.current = null;
    };
  }, [game?.gameCode]);

  const handleRound = async (value, handleShowP) => {
    handleShowRef.current = handleShowP;

    if (!game?.gameCode) {
      ShowNewToast("Error", "No active game", "error");
      return;
    }

    try {
      let action = null;
      let throwValue = value;

      if (value === "DOUBLE" || value === "TRIPLE") {
        if (specialState[0]) {
          setSpecialState([false, ""]);
        } else {
          setSpecialState([true, value]);
        }
        return;
      }

      if (value === "BACK") {
        await sendBack(game.gameCode);
        return;
      }

      // Handle DOORS
      if (value === "DOORS") {
        throwValue = "DOORS";
      } else if (specialState[0]) {
        action = specialState[1];
        throwValue = value;
        setSpecialState([false, ""]);
      }

      // Send throw to backend
      const result = await sendThrow(game.gameCode, throwValue, action);

      if (result.gameEnd && handleShowP) {
        handleShowP();
      }
    } catch (error) {
      console.error("Error handling throw:", error);
      ShowNewToast("Error", error.message, "error");
    }
  };

  const updateGameState = (gameP) => {
    setGame(gameP);
    localStorage.setItem("dartsGame", JSON.stringify(gameP));
  };

  const setHandleShow = (handleShowFn) => {
    handleShowRef.current = handleShowFn;
  };

  const contextParams = {
    game,
    setGame: updateGameState,
    currentUser,
    handleRound,
    overthrow,
    setOverthrow,
    specialState,
    updateGameState,
    setHandleShow,
  }

  return (
    <DartsGameContext.Provider value={contextParams}>
      {children}
    </DartsGameContext.Provider>
  );
};