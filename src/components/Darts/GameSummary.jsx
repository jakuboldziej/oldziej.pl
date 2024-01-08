/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { Modal } from 'react-bootstrap'
import { DartsGameContext } from '../../context/DartsGameContext';
import { Link } from 'react-router-dom';
import UserDataTable from './UserDataTable';

function GameSummary({ show, fullscreen, setShow }) {
  const { game } = useContext(DartsGameContext);
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

  return (
    <Modal data-bs-theme="dark" className='game-summary-modal' backdrop="static" show={show} fullscreen={fullscreen} onShow={handleTimePlayed} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>Game Summary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!game.training ?
          <div className='summary d-flex flex-column align-items-center gap-2'>
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
          <div className="training-stats d-flex flex-column align-items-center gap-2">
            <h5>Training Stats</h5>
            <div className="podium">
              <span className="place seconds-place">{game.podium[2] ? game.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
              <span className="place first-place">{game.podium[1] ? game.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
              <span className="place third-place">{game.podium[3] ? game.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
            </div>
            <div className="d-flex gap-2">
              <span>Time played: {timePlayed}</span>
              <span>StartPoints: {game.startPoints}</span>
            </div>
            <UserDataTable game={game}/>
          </div>
        }
        <Link className="btn btn-outline-danger glow-button" to='/darts' state={{ createNewGame: true }} >Create New Game</Link>
        <Link className="btn btn-outline-success glow-button" to='/darts'>Back to Darts</Link>
      </Modal.Body>
    </Modal>
  )
}

export default GameSummary