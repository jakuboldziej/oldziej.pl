import GameLivePreview from '@/components/Home/Darts/GameLivePreview/GameLivePreview';
import JoiningLiveGame from '@/components/Home/Darts/GameLivePreview/JoiningLiveGame';
import { getDartsGame } from '@/lib/fetch';
import { socket, trackRoom, untrackRoom } from '@/lib/socketio';
import React, { useEffect, useState, useRef } from 'react';

function GameLivePreviewPage() {
  const [liveGame, setLiveGame] = useState(null);
  const [overthrow, setOverthrow] = useState(false);
  const joinedRoomRef = useRef(null);

  const handleInitialJoin = (game) => {
    if (!game?.gameCode) return;

    if (joinedRoomRef.current === game.gameCode) {
      setLiveGame(game);
      return;
    }

    if (joinedRoomRef.current) {
      socket.emit("leaveLiveGamePreview", JSON.stringify({ gameCode: joinedRoomRef.current }));
      untrackRoom(joinedRoomRef.current);
    }

    socket.emit("joinLiveGamePreview", JSON.stringify({ gameCode: game.gameCode }));
    trackRoom(game.gameCode);
    joinedRoomRef.current = game.gameCode;

    setLiveGame(game);
  };

  useEffect(() => {
    let timer;
    if (overthrow) timer = setTimeout(() => setOverthrow(false), 1000);
    return () => clearTimeout(timer);
  }, [overthrow]);

  useEffect(() => {
    socket.connect();

    const handleUpdate = (data) => {
      const game = typeof data === 'string' ? JSON.parse(data) : data;

      if (joinedRoomRef.current && game.gameCode !== joinedRoomRef.current) {
        console.warn("Ignored update for different game:", game.gameCode);
        return;
      }

      setLiveGame(game);
    };

    const handleTransition = (data) => {
      const game = typeof data === 'string' ? JSON.parse(data) : data;
      handleInitialJoin(game);
    };

    const overthrowHandler = (userDisplayName) => setOverthrow(userDisplayName);

    const hostDisconnect = (disconnected) => {
      if (disconnected && joinedRoomRef.current) {
        socket.emit("leaveLiveGamePreview", JSON.stringify({ gameCode: joinedRoomRef.current }));
        untrackRoom(joinedRoomRef.current);
        joinedRoomRef.current = null;
      }
      setLiveGame(null);
    };

    socket.on("updateLiveGamePreviewClient", handleUpdate);
    socket.on("gameCreated", handleTransition);
    socket.on("playAgainButtonClient", handleTransition);
    socket.on("userOverthrowClient", overthrowHandler);
    socket.on("hostDisconnectedFromGameClient", hostDisconnect);
    socket.on("joinLiveGameFromQrCodeClient", (data) => {
      const joinData = JSON.parse(data);
      if (joinData.socketId === socket.id) handleInitialJoin(joinData.game);
    });
    socket.on("tournament:nextGame", (data) => {
      if (data?.nextGame) handleInitialJoin(data.nextGame);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const urlGameCode = urlParams.get("gameCode");

    if (urlGameCode) {
      getDartsGame(urlGameCode).then((game) => {
        if (game) {
          handleInitialJoin(game);

          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      });
    }

    return () => {
      socket.off("updateLiveGamePreviewClient", handleUpdate);
      socket.off("gameCreated", handleTransition);
      socket.off("playAgainButtonClient", handleTransition);
      socket.off("userOverthrowClient", overthrowHandler);
      socket.off("hostDisconnectedFromGameClient", hostDisconnect);
      socket.off("joinLiveGameFromQrCodeClient");
      socket.off("tournament:nextGame");
    };
  }, []);

  return liveGame ? (
    <GameLivePreview props={{ liveGame, setLiveGame, overthrow }} />
  ) : (
    <JoiningLiveGame props={{ liveGame, setLiveGame, overthrow }} />
  );
}

export default GameLivePreviewPage;