import { createContext, useEffect, useMemo, useState, useRef } from 'react';
import {
  subscribeToGameUpdates,
  subscribeToOverthrows,
  subscribeToGameEnd,
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
    return storedGame ? JSON.parse(storedGame) : null;
  });
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);
  const subscribedGameCode = useRef(null);

  const currentUser = useMemo(() => {
    if (!game || !game.users) return null;
    return game.users.find(user => user.turn);
  }, [game]);

  let handleShow;

  // Subscribe to game updates from backend
  useEffect(() => {
    const gameCode = game?.gameCode;

    if (!gameCode || subscribedGameCode.current === gameCode) return;

    subscribedGameCode.current = gameCode;

    // Join game room
    joinGameRoom(gameCode);

    // Subscribe to game state updates
    const unsubscribeUpdates = subscribeToGameUpdates(gameCode, (updatedGame) => {
      setGame(updatedGame);
      localStorage.setItem("dartsGame", JSON.stringify(updatedGame));
    });

    // Subscribe to overthrow events
    const unsubscribeOverthrows = subscribeToOverthrows((userDisplayName) => {
      setOverthrow(userDisplayName);
      setTimeout(() => setOverthrow(false), 2000);
    });

    // Subscribe to game end events
    const unsubscribeGameEnd = subscribeToGameEnd((endedGame) => {
      setGame(endedGame);
      localStorage.setItem("dartsGame", JSON.stringify(endedGame));
      if (handleShow) handleShow();
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeOverthrows();
      unsubscribeGameEnd();
      leaveGameRoom(gameCode);
      subscribedGameCode.current = null;
    };
  }, [game?.gameCode]);

  // Handle throw - send to backend
  const handleRound = async (value, handleShowP) => {
    handleShow = handleShowP;

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
        // User clicked a number while in DOUBLE/TRIPLE state
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

  const clearDartsUsersBackup = () => {
    // No longer needed - backend handles this
  };

  const restoreUsersSummaryBack = async () => {
    // No longer needed - backend handles this
    return true;
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
    clearDartsUsersBackup,
    restoreUsersSummaryBack
  }

  return (
    <DartsGameContext.Provider value={contextParams}>
      {children}
    </DartsGameContext.Provider>
  );
};