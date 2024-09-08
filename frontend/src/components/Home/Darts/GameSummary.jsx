import { useContext, useEffect, useState } from 'react';
import { DartsGameContext } from '@/context/Home/DartsGameContext';
import { Link } from 'react-router-dom';
import UserDataTable from './UserDataTable';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button, buttonVariants } from '@/components/ui/shadcn/button';
import { postDartsGame } from '@/fetch';
import lodash from 'lodash';
import { socket } from '@/lib/socketio';
import { handleTimePlayed } from './game logic/gameUtils';

function GameSummary({ show, setShow }) {
  const { game, updateGameState } = useContext(DartsGameContext);
  const [timePlayed, setTimePlayed] = useState(0);

  const handlePlayAgain = async () => {
    const previousSettings = JSON.parse(localStorage.getItem("gameSettings"));

    const throwsData = {
      doors: 0,
      doubles: 0,
      triples: 0,
      normal: 0,
      overthrows: 0,
    }
    const updatedUsers = game.users.map((user) => {
      user.points = game.startPoints;
      user.allGainedPoints = 0;
      user.turn = false;
      user.turnsSum = 0;
      user.currentTurn = 1;
      user.place = 0;
      user.turns = {
        1: null,
        2: null,
        3: null
      };
      user.throws = { ...throwsData };
      user.currentThrows = { ...throwsData };
      user.legs = 0;
      user.sets = 0;
      user.avgPointsPerTurn = "0.00";
      user.highestGameAvg = "0.00";
      user.highestGameTurnPoints = 0;
      user.gameCheckout = 0;

      return user;
    });
    game.users = updatedUsers.sort(() => Math.random() - 0.5);
    game.users[0].turn = true;
    const usersCopy = lodash.cloneDeep(game.users);
    const gameCopy = lodash.cloneDeep(game);
    const gameData = {
      created_at: Date.now(),
      active: true,
      podium: {
        1: null,
        2: null,
        3: null
      },
      userWon: "",
      turn: usersCopy[0].displayName,
      round: 1,
      record: [{
        game: {
          round: 1,
          turn: usersCopy[0].displayName
        },
        users: usersCopy
      }],
    }
    const gameDataMerged = { ...gameCopy, ...gameData }

    if (!previousSettings.training) {
      game.training = false;
      const { record, userWon, ...gameWithoutRecordAndUserWon } = gameDataMerged;
      const gameData = await postDartsGame(gameWithoutRecordAndUserWon);

      gameDataMerged._id = gameData._id;
      gameDataMerged["gameCode"] = gameData.gameCode;
      updateGameState(gameDataMerged);

      socket.emit("playAgainButtonServer", JSON.stringify({
        oldGameCode: gameCopy.gameCode,
        newGame: gameDataMerged
      }));
      socket.emit("joinLiveGamePreview", JSON.stringify({
        gameCode: gameDataMerged.gameCode
      }));
    } else {
      game.training = true;
      updateGameState(gameDataMerged);
    }
    setShow(false);
  }

  const handleSummaryBackButton = () => {

  }

  const handleDisabledBack = () => {
    return true;
  }

  const handleBackToDarts = () => {
    socket.emit("hostDisconnectedFromGame", JSON.stringify({
      gameCode: game.gameCode
    }));

    localStorage.setItem("dartsGame", null);
  }

  useEffect(() => {
    if (show) {
      const formattedTime = handleTimePlayed(game.created_at, game.finished_at);
      setTimePlayed(formattedTime);
    }
  }, [show]);

  useEffect(() => {
    const externalKeyboardPlayAgainClient = (data) => {
      const gameCode = JSON.parse(data);

      if (gameCode === game.gameCode) {
        handlePlayAgain();
      }
    }

    socket.on("externalKeyboardPlayAgainClient", externalKeyboardPlayAgainClient);

    return () => {
      socket.off("externalKeyboardPlayAgainClient", externalKeyboardPlayAgainClient);
    }
  }, [game]);

  return (
    <Dialog open={show}>
      <DialogContent className='game-summary-modal'>
        <DialogTitle className='text-center text-2xl'>Game Summary</DialogTitle>
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
                <div className="training-stats flex flex-col items-center gap-5">
                  <span className='text-lg font-bold'>Training Stats</span>
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
                  <UserDataTable users={game.users} game={game} />
                </div>
              )
          ) : (
            <span className='text-xl text-red-500'>This game was abandoned</span>
          )}
          <span className='flex flex-col items-center gap-5 mt-5'>
            <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts" onClick={handleBackToDarts}>Create New Game</Link>
            <Link className={`${buttonVariants({ variant: "outline_green" })} glow-button-green`} to="/darts" onClick={handleBackToDarts}>Back to Darts</Link>
            <Button variant="outline_white" className="glow-button-white" onClick={handlePlayAgain}>Play Again</Button>
            <Button variant="outline_red" className="glow-button-red" onClick={handleSummaryBackButton} disabled={handleDisabledBack()}>Back</Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GameSummary