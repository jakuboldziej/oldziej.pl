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
import { onReconnected, ensureSocketConnection } from '@/lib/socketio';
import { getDartsGame } from '@/lib/fetch';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { ensureGameRecord } from '@/lib/recordUtils';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(() => {
    const storedGame = localStorage.getItem('dartsGame');
    if (!storedGame || storedGame === 'null') return null;

    try {
      const parsedGame = JSON.parse(storedGame);
      return ensureGameRecord(parsedGame);
    } catch (e) {
      return null;
    }
  });
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);
  const subscribedGameCode = useRef(null);
  const handleShowRef = useRef(null);
  const pendingRequest = useRef(false);
  const lastRequestTime = useRef(0);
  const lastSocketUpdate = useRef(0);
  const minRequestInterval = 100;
  const hasFetchedFullGame = useRef(false);

  const currentUser = useMemo(() => {
    if (!game || !game.users) return null;
    return game.users.find(user => user.turn);
  }, [game]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && game?._id) {
        try {
          const freshGame = await getDartsGame(game._id);

          if (freshGame.message || freshGame.error) {
            return;
          }

          if (freshGame) {
            const gameWithRecord = ensureGameRecord(freshGame);

            setGame(gameWithRecord);
            localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));

            await ensureSocketConnection();
            joinGameRoom(game.gameCode);

            import('@/lib/socketio').then(({ socket }) => {
              socket.emit("updateLiveGamePreview", JSON.stringify(gameWithRecord));
            });
          }
        } catch (error) {
          console.error("Failed to sync on visibility change:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [game?._id, game?.gameCode]);

  useEffect(() => {
    const fetchFullGameIfNeeded = async () => {
      if (!game || !game._id || !game.active) return;
      if (hasFetchedFullGame.current) return;

      const needsFullGame = !game.record || game.record.length <= 1;

      if (needsFullGame) {
        hasFetchedFullGame.current = true;
        try {
          const fullGame = await getDartsGame(game._id);
          if (fullGame && fullGame._id) {
            const gameWithRecord = ensureGameRecord(fullGame);
            setGame(gameWithRecord);
            localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));
          }
        } catch (error) {
          console.error('Error fetching full game:', error);
        }
      }
    };

    fetchFullGameIfNeeded();
  }, [game?._id, game?.active]);

  useEffect(() => {
    if (!game) {
      hasFetchedFullGame.current = false;
    }
  }, [game?._id]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedGame = localStorage.getItem('dartsGame');
      if (!storedGame || storedGame === 'null') {
        setGame(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      if (Date.now() - lastSocketUpdate.current < 1000) {
        return;
      }

      const storedGame = localStorage.getItem('dartsGame');
      if (!storedGame || storedGame === 'null') {
        if (game !== null) {
          setGame(null);
        }
      } else {
        try {
          const parsedStoredGame = JSON.parse(storedGame);
          if (parsedStoredGame && parsedStoredGame._id !== game?._id) {
            const gameWithRecord = ensureGameRecord(parsedStoredGame);
            setGame(gameWithRecord);
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
      lastSocketUpdate.current = Date.now();
      const gameWithRecord = ensureGameRecord(updatedGame);
      setGame(gameWithRecord);
      localStorage.setItem("dartsGame", JSON.stringify(gameWithRecord));
    });

    const unsubscribeOverthrows = subscribeToOverthrows((userDisplayName) => {
      setOverthrow(userDisplayName);
      setTimeout(() => setOverthrow(false), 2000);
    });

    const unsubscribeGameEnd = subscribeToGameEnd((endedGame) => {
      lastSocketUpdate.current = Date.now();
      const gameWithRecord = ensureGameRecord(endedGame);
      setGame(gameWithRecord);
      localStorage.setItem("dartsGame", JSON.stringify(gameWithRecord));
      if (handleShowRef.current) handleShowRef.current();
    });

    const unsubscribeToPlayAgain = subscribeToPlayAgain((newGame) => {
      lastSocketUpdate.current = Date.now();
      const gameWithRecord = ensureGameRecord(newGame);
      setGame(gameWithRecord);
      localStorage.setItem("dartsGame", JSON.stringify(gameWithRecord));
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

  useEffect(() => {
    const unsubscribe = onReconnected(async () => {
      if (game?.gameCode) {

        try {
          const freshGame = await getDartsGame(game._id);

          const gameWithRecord = ensureGameRecord(freshGame);

          setGame(gameWithRecord);
          localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));

          joinGameRoom(game.gameCode);

          import('@/lib/socketio').then(({ socket }) => {
            socket.emit("updateLiveGamePreview", JSON.stringify(gameWithRecord));
          });

        } catch (error) {
          console.error('Failed to restore game from database:', error);

          const gameToSync = ensureGameRecord({ ...game });
          joinGameRoom(game.gameCode);
          import('@/lib/socketio').then(({ socket }) => {
            socket.emit("updateLiveGamePreview", JSON.stringify(gameToSync));
          });
        }
      }
    });

    return unsubscribe;
  }, [game]);

  const handleRound = async (value, handleShowP) => {
    const now = Date.now();
    if (pendingRequest.current || (now - lastRequestTime.current) < minRequestInterval) {
      console.warn('Request throttled - too fast');
      return;
    }

    handleShowRef.current = handleShowP;

    if (!game?.gameCode) {
      ShowNewToast("Error", "No active game", "error");
      return;
    }

    try {
      pendingRequest.current = true;
      lastRequestTime.current = now;

      let action = null;
      let throwValue = value;

      if (value === "DOUBLE" || value === "TRIPLE") {
        if (specialState[0]) {
          setSpecialState([false, ""]);
        } else {
          setSpecialState([true, value]);
        }
        pendingRequest.current = false;
        return;
      }

      if (value === "BACK") {
        await sendBack(game.gameCode);
        pendingRequest.current = false;
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
    } finally {
      pendingRequest.current = false;
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