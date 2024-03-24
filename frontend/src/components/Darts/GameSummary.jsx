import { useContext, useEffect, useState } from 'react';
import { DartsGameContext } from '../../context/DartsGameContext';
import { Link } from 'react-router-dom';
import UserDataTable from './UserDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button, buttonVariants } from '../ui/button';
import { postDartsGame } from '@/fetch';

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
    game.users.map((user) => {
      user.points = game.startPoints
      user.allGainedPoints = 0
      user.turn = game.turn === user.displayName ? true : false
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
      user.avgPointsPerThrow = 0
      user.highestRoundPoints = 0
    })
    game.active = true;
    game.podium = {
      1: null,
      2: null,
      3: null
    }
    game.userWon = "";
    game.round = 1;
    game.record = [{
      game: {
        round: game.round,
        turn: game.turn
      },
      user: game.users[0]
    }];
    setShow(false);

    if (!previousSettings.training) {
      game.training = false;
      const gameData = await postDartsGame(game);
      game._id = gameData._id;
      setGame(game);
    } else {
      game.training = true;
      setGame(game)
    }
  }

  useEffect(() => {
    if (show) {
      handleTimePlayed();
    }
  }, [show]);

  return (
    <>
      <Dialog open={show}>
        <DialogContent className='game-summary-modal'>
          <DialogHeader>
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
                <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts">Create New Game</Link>
                <Link className={`${buttonVariants({ variant: "outline_green" })} glow-button-green`} to="/darts">Back to Darts</Link>
                <Button variant="outline_white" className="glow-button-white" onClick={handlePlayAgain}>Play Again</Button>
              </span>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>

    // <Modal data-bs-theme="dark" className='game-summary-modal' backdrop="static" show={show} fullscreen={fullscreen} onShow={handleTimePlayed} onHide={() => setShow(false)}>
    //   <Modal.Header>
    //     <Modal.Title>Game Summary</Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    //     {!game.training ?
    //       <div className='summary d-flex flex-column align-items-center gap-2'>
    //         <div className="podium">
    //           <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
    //           <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
    //           <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
    //         </div>
    //         <div>
    //           Time played: {timePlayed}
    //         </div>
    //       </div>
    //       :
    //       <div className="training-stats d-flex flex-column align-items-center gap-2">
    //         <h5>Training Stats</h5>
    //         <div className="podium">
    //           <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
    //           <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
    //           <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
    //         </div>
    //         <div className="d-flex gap-2">
    //           <span>Time played: {timePlayed}</span>
    //           <span>StartPoints: {game.startPoints}</span>
    //         </div>
    //         <UserDataTable users={game.users} game={game}/>
    //       </div>
    //     }
    //     <Link className="btn btn-outline-danger glow-button" to='/darts' state={{ createNewGame: true }} >Create New Game</Link>
    //     <Link className="btn btn-outline-success glow-button" to='/darts'>Back to Darts</Link>
    //   </Modal.Body>
    // </Modal>
  )
}

export default GameSummary