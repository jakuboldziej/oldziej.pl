import GameLivePreview from '@/components/Home/Darts/GameLivePreview/GameLivePreview';
import JoiningLiveGame from '@/components/Home/Darts/GameLivePreview/JoiningLiveGame';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { socket } from '@/lib/socketio';
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/Home/AuthContext';

function GameLivePreviewPage() {
  const { currentUser } = useContext(AuthContext);

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

    const updateLiveGamePreviewClient = (data) => {
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

    const gameCreated = (data) => {
      const { game, userDisplayNames } = JSON.parse(data);

      if (userDisplayNames.includes(currentUser.displayName)) {
        socket.emit("joinLiveGamePreview", JSON.stringify({
          gameCode: game.gameCode
        }));

        setLiveGame(game);
      }
    }

    const playAgainButtonClient = (data) => {
      const gameData = JSON.parse(data);

      socket.emit("joinLiveGamePreview", JSON.stringify({
        gameCode: gameData.gameCode
      }));

      setLiveGame(gameData);

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

    socket.on("gameCreated", gameCreated);
    socket.on("updateLiveGamePreviewClient", updateLiveGamePreviewClient);
    socket.on("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
    socket.on("playAgainButtonClient", playAgainButtonClient);
    socket.on("userOverthrowClient", handleOverthrowEffect);
    socket.on("hostDisconnectedFromGameClient", hostDisconnectedFromGameClient);

    return () => {
      socket.off("gameCreated", gameCreated);
      socket.off("updateLiveGamePreviewClient", updateLiveGamePreviewClient);
      socket.off("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
      socket.off("playAgainButtonClient", playAgainButtonClient);
      socket.off("userOverthrowClient", handleOverthrowEffect);
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