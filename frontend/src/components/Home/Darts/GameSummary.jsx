import { useContext, useEffect, useState } from 'react';
import { DartsGameContext } from '@/context/DartsGameContext';
import { Link } from 'react-router-dom';
import UserDataTable from './UserDataTable';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button, buttonVariants } from '@/components/ui/shadcn/button';
import { postDartsGame } from '@/fetch';
import lodash from 'lodash';
import { handleRecord, setGameState } from './utils';

function GameSummary({ show, setShow }) {
  const { game, setGame } = useContext(DartsGameContext);
  const [timePlayed, setTimePlayed] = useState(0);

  const handleTimePlayed = () => {
    const date = new Date(game.created_at);
    const currentDate = new Date();

    const timeDifference = currentDate.getTime() - date.getTime();

    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    const formattedTimeDifference = `${hoursDifference.toString().padStart(2, '0')}:${minutesDifference.toString().padStart(2, '0')}`;
    setTimePlayed(formattedTimeDifference);
  }

  const handlePlayAgain = async () => {
    const previousSettings = JSON.parse(localStorage.getItem("gameSettings"));

    const updatedUsers = game.users.map((user) => {
      user.points = game.startPoints
      user.allGainedPoints = 0
      user.turn = false
      user.turnsSum = 0
      user.currentTurn = 1
      user.place = 0
      user.turns = {
        1: null,
        2: null,
        3: null
      }
      user.throws = {
        doors: 0,
        doubles: 0,
        triples: 0,
        normal: 0,
        overthrows: 0,
      }
      user.legs = 0
      user.sets = 0
      user.avgPointsPerTurn = 0
      user.highestTurnPoints = 0
      user.highestCheckout = 0

      return user;
    });
    game.users = updatedUsers.sort(() => Math.random() - 0.5);
    game.users[0].turn = true;
    const firstUser = lodash.cloneDeep(game.users[0]);
    const gameCopy = lodash.cloneDeep(game);
    const gameData = {
      active: true,
      podium: {
        1: null,
        2: null,
        3: null
      },
      userWon: "",
      turn: firstUser.displayName,
      round: 1,
      record: [{
        game: {
          round: 1,
          turn: firstUser.displayName
        },
        user: firstUser
      }],
    }
    const gameDataMerged = { ...gameCopy, ...gameData }

    if (!previousSettings.training) {
      game.training = false;
      const { record, userWon, ...gameWithoutRecordAndUserWon } = gameDataMerged;
      const gameData = await postDartsGame(gameWithoutRecordAndUserWon);
      gameDataMerged._id = gameData._id;
      setGame(gameDataMerged);
    } else {
      game.training = true;
      setGame(gameDataMerged);
    }
    localStorage.setItem("dartsGame", JSON.stringify(gameDataMerged))
    setShow(false);
  }

  const handleSummaryBackButton = () => {
    const updatedUsers = game.users.map((user) => {
      user.place = 0;
      return user;
    })
    const gameDataBack = {
      ...game,
      userWon: "",
      podium: { 1: null, 2: null, 3: null },
      active: true,
      users: updatedUsers
    }
    if (game.userWon) {
      setGame(gameDataBack)
      setGameState(gameDataBack);
    }
    setShow(false);
    handleRecord("back", true);
  }

  const handleDisabledBack = () => {
    const lsGame = JSON.parse(localStorage.getItem("dartsGame"));
    if (game.record.length > 1 && lsGame) {
      return false;
    } else {
      return true;
    }
  }

  const handleDisabledPlayAgain = () => {

  }

  const deleteLSGame = () => {
    localStorage.setItem("dartsGame", null);
  }

  useEffect(() => {
    if (show) {
      handleTimePlayed();
    }
  }, [show]);

  return (
    <Dialog open={show}>
      <DialogContent className='game-summary-modal'>
        <DialogTitle className='text-center text-2xl'>Game Summary</DialogTitle>
        <hr />
        <div className='text-white'>
          {!game.training ?
            <div className='summary flex flex-col items-center gap-5'>
              <div className="podium">
                <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
                <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
                <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
              </div>
              <div>
                Time played: {timePlayed}
              </div>
            </div>
            :
            <div className="training-stats flex flex-col items-center gap-5">
              <span className='text-lg font-bold'>Training Stats</span>
              <div className="podium">
                <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
                <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
                <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
              </div>
              <div className="flex gap-4">
                <span>Time played: {timePlayed}</span>
                <span>StartPoints: {game.startPoints}</span>
              </div>
              <UserDataTable users={game.users} game={game} />
            </div>
          }
          <span className='flex flex-col items-center gap-5 mt-5'>
            <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts" onClick={deleteLSGame}>Create New Game</Link>
            <Link className={`${buttonVariants({ variant: "outline_green" })} glow-button-green`} to="/darts" onClick={deleteLSGame}>Back to Darts</Link>
            <Button variant="outline_white" className="glow-button-white" onClick={handlePlayAgain} disabled={handleDisabledPlayAgain()}>Play Again</Button>
            <Button variant="outline_red" className="glow-button-red" onClick={handleSummaryBackButton} disabled={handleDisabledBack()}>Back</Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GameSummary