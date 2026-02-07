import { useContext, useEffect, useState, useRef } from 'react';
import { DartsGameContext } from '@/context/Home/DartsGameContext';
import { Link } from 'react-router-dom';
import UserDataTable from './UserDataTable';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button, buttonVariants } from '@/components/ui/shadcn/button';
import { getESP32Availability, postESP32JoinGame, postESP32LeaveGame } from '@/lib/fetch';
import lodash from 'lodash';
import { socket } from '@/lib/socketio';
import { handleTimePlayed } from './utils/gameUtils';
import { isInitialGameState } from '@/lib/recordUtils';

function GameSummary({ show, setShow }) {
  const { game, updateGameState, handleRound } = useContext(DartsGameContext);
  const [timePlayed, setTimePlayed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    const handlePlayAgainResponse = async (data) => {
      const newGame = JSON.parse(data);
      const currentGame = gameRef.current;

      if (currentGame && currentGame.gameCode && currentGame.gameCode !== newGame.gameCode) {
        socket.emit("leaveLiveGamePreview", JSON.stringify({ gameCode: currentGame.gameCode }));
      }

      updateGameState(newGame);
      localStorage.setItem("dartsGame", JSON.stringify(newGame));

      socket.emit("joinLiveGamePreview", JSON.stringify({ gameCode: newGame.gameCode }));

      (async () => {
        try {
          const esp32Availability = await getESP32Availability();
          if (esp32Availability.available) {
            await postESP32JoinGame(newGame.gameCode);
          }
        } catch (err) {
          console.error("ESP32 error:", err);
        }
      })();

      setIsLoading(false);
      setShow(false);
    };

    socket.on("playAgainButtonClient", handlePlayAgainResponse);

    return () => {
      socket.off("playAgainButtonClient", handlePlayAgainResponse);
    };
  }, [updateGameState, setShow]);

  function handleShow() {
    setShow(true);
  }

  const handlePlayAgain = async () => {
    setIsLoading(true);

    try {
      socket.emit("playAgainRequest", JSON.stringify({
        gameData: game
      }));
    } catch (err) {
      console.error('Play Again error:', err);
      setIsLoading(false);
    }
  }

  const handleDisabledBack = () => {
    if (game.training || game.podium[1] === null || isInitialGameState(game)) return true;
  }

  const handleSummaryBackButton = async () => {
    // Backend now handles all state restoration via handleBack
    await handleRound("BACK", handleShow);

    setShow(false);
  }

  const handleBackToDarts = async () => {
    try {
      socket.emit("hostDisconnectedFromGame", JSON.stringify({
        gameCode: game.gameCode
      }));

      localStorage.setItem("dartsGame", null);

      await postESP32LeaveGame(game.gameCode);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (show && game.finished_at) {
      const formattedTime = handleTimePlayed(game.created_at, game.finished_at);
      setTimePlayed(formattedTime);
    }
  }, [show, game?.finished_at]);

  return (
    <Dialog open={show}>
      <DialogContent className='game-summary-modal'>
        <DialogTitle className='text-center text-2xl'>Game Summary</DialogTitle>
        <DialogDescription className='text-center hidden'>Summary of the game results and statistics.</DialogDescription>
        <hr />
        <div className='text-white summary flex flex-col items-center'>
          {game.podium[1] !== null ? (
            !game.training ? (
              <div className='flex flex-col items-center gap-5'>
                <div className="podium">
                  <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
                  <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
                  <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
                </div>
                <div className="flex gap-4">
                  <span>Time played: {timePlayed}</span>
                  <span>Start Points: {game.startPoints}</span>
                </div>
                <span>
                  Gamemode: {game.gameMode}
                  {game.gameMode === "X01" && <span> | Legs: {game.legs} | Sets: {game.sets}</span>}
                </span>
              </div>
            )
              : (
                <div className="training-stats flex flex-col items-center gap-5 w-full px-2">
                  <span className='text-lg font-bold'>Training Stats</span>
                  <div className="podium">
                    <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
                    <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
                    <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center text-center">
                    <span>Time played: {timePlayed}</span>
                    <span>Start Points: {game.startPoints}</span>
                  </div>
                  <span className="text-center">
                    Gamemode: {game.gameMode}
                    {game.gameMode === "X01" && <span> | Legs: {game.legs} | Sets: {game.sets}</span>}
                  </span>
                  <UserDataTable users={game.users} game={game} />
                </div>
              )
          ) : (
            <span className='text-xl text-red-500'>This game was abandoned</span>
          )}
          <span className='flex flex-col items-center gap-5 mt-5'>
            <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts" onClick={handleBackToDarts}>Create New Game</Link>
            <Link className={`${buttonVariants({ variant: "outline_green" })} glow-button-green`} to="/darts" onClick={handleBackToDarts}>Back to Darts</Link>
            <Button variant="outline_white" className="glow-button-white" onClick={handlePlayAgain} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Play Again'}
            </Button>
            <Button variant="outline_red" className="glow-button-red" onClick={handleSummaryBackButton} disabled={handleDisabledBack()}>Back</Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GameSummary