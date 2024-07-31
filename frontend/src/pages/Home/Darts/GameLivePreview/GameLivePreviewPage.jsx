import GameLivePreview from '@/components/Home/Darts/GameLivePreview/GameLivePreview';
import JoiningLiveGame from '@/components/Home/Darts/GameLivePreview/JoiningLiveGame';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { socket } from '@/lib/socketio';
import React, { useEffect, useState } from 'react';

function GameLivePreviewPage() {
  const [liveGame, setLiveGame] = useState(null);

  useEffect(() => {
    const updateLiveGameClient = (data) => {
      const gameData = JSON.parse(data);
      setLiveGame(gameData);
    }

    const joinLiveGameFromQrCodeClient = (data) => {
      const joinData = JSON.parse(data);
      console.log(joinData);
      if (joinData.socketId === socket.id) {
        socket.emit("joinLiveGamePreview", JSON.stringify({
          socketId: socket.id,
          gameCode: joinData.game.gameCode
        }));

        setLiveGame(joinData.game);
      }
    }

    const playAgainButtonClient = (data) => {
      const gameData = JSON.parse(data);

      socket.emit("joinLiveGamePreview", JSON.stringify({
        socketId: socket.id,
        gameCode: gameData.gameCode
      }));

      ShowNewToast("Live Game Preview", "Host clicked play again button and started a new game!")
    }

    socket.on("updateLiveGameClient", updateLiveGameClient);
    socket.on("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
    socket.on("playAgainButtonClient", playAgainButtonClient);

    return () => {
      socket.off("updateLiveGameClient", updateLiveGameClient);
      socket.off("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
      socket.off("playAgainButtonClient", playAgainButtonClient);
    }
  }, []);

  const joinGameProps = {
    setLiveGame,
  }
  return (
    <>
      {liveGame ? (
        <GameLivePreview liveGame={liveGame} setLiveGame={setLiveGame} />
      ) : (
        <JoiningLiveGame props={joinGameProps} />
      )}
    </>
  )
}

export default GameLivePreviewPage