import GameLivePreview from '@/components/Home/Darts/GameLivePreview/GameLivePreview';
import JoiningLiveGame from '@/components/Home/Darts/GameLivePreview/JoiningLiveGame';
import { socket } from '@/lib/socketio';
import React, { useEffect, useState } from 'react';

function DartsGameLivePreview() {
  const [liveGame, setLiveGame] = useState(null);

  useEffect(() => {
    const updateLiveGame = (data) => {
      const gameData = JSON.parse(data);
      console.log(gameData);
    }

    const joinLiveGameFromQrCodeClient = (data) => {
      const joinData = JSON.parse(data);
      if (joinData.socketId === socket.id) {
        socket.emit("joinLiveGamePreview", JSON.stringify({
          socketId: socket.id,
          gameCode: joinData.game.gameCode
        }));

        setLiveGame(joinData.game);
      }
    }

    socket.on("updateLiveGameClient", updateLiveGame);
    socket.on("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);

    return () => {
      socket.off("updateLiveGameClient", updateLiveGame);
      socket.off("joinLiveGameFromQrCodeClient", joinLiveGameFromQrCodeClient);
    }
  }, []);

  const joinGameProps = {
    liveGame,
    setLiveGame
  }
  return (
    <>
      {liveGame ? (
        <GameLivePreview liveGame={liveGame} />
      ) : (
        <JoiningLiveGame props={joinGameProps} />
      )}
    </>
  )
}

export default DartsGameLivePreview