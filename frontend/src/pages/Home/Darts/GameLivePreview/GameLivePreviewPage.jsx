import GameLivePreview from '@/components/Home/Darts/GameLivePreview/GameLivePreview';
import JoiningLiveGame from '@/components/Home/Darts/GameLivePreview/JoiningLiveGame';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { socket } from '@/lib/socketio';
import React, { useEffect, useState } from 'react';

function GameLivePreviewPage() {
  const [liveGame, setLiveGame] = useState(null);
  const [overthrow, setOverthrow] = useState(false);

  // Overthrow effect
  useEffect(() => {
    let timer;

    if (overthrow) {
      timer = setTimeout(() => {
        setOverthrow(false);
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [overthrow]);

  // Socket.io
  useEffect(() => {
    socket.connect();

    const updateLiveGameClient = (data) => {
      const gameData = JSON.parse(data);
      setLiveGame(gameData);
    }

    const joinLiveGameFromQrCodeClient = (data) => {
      const joinData = JSON.parse(data);
      if (joinData.socketId === socket.id) {
        socket.emit("joinLiveGamePreview", JSON.stringify({
          gameCode: joinData.game.gameCode
        }));

        setLiveGame(joinData.game);
      }
    }

    const playAgainButtonClient = (data) => {
      const gameData = JSON.parse(data);

      socket.emit("joinLiveGamePreview", JSON.stringify({
        gameCode: gameData.gameCode
      }));

      ShowNewToast("Live Game Preview", "Host clicked play again button and started a new game!")
    }

    const handleOverthrowEffect = (userDisplayName) => {
      setOverthrow(userDisplayName);
    }

    const hostDisconnectedFromGameClient = (disconnected) => {
      if (disconnected) {
        setLiveGame(null);
        ShowNewToast("Live Game Preview", "Host disconnected from the game.")
      }
    }

    socket.on("updateLiveGameClient", updateLiveGameClient);
    socket.on("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
    socket.on("playAgainButtonClient", playAgainButtonClient);
    socket.on("userOverthrowClient", handleOverthrowEffect);
    socket.on("hostDisconnectedFromGameClient", hostDisconnectedFromGameClient);

    return () => {
      socket.off("updateLiveGameClient", updateLiveGameClient);
      socket.off("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
      socket.off("playAgainButtonClient", playAgainButtonClient);
      socket.off("hostDisconnectedFromGameClient", hostDisconnectedFromGameClient);
    }
  }, []);

  const componentsProps = {
    liveGame,
    setLiveGame,
    overthrow
  }
  return (
    <>
      {liveGame ? (
        <GameLivePreview props={componentsProps} />
      ) : (
        <JoiningLiveGame props={componentsProps} />
      )}
    </>
  )
}

export default GameLivePreviewPage