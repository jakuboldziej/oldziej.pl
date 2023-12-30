/* eslint-disable react/prop-types */
import { useContext, useEffect } from 'react';
import { Modal } from 'react-bootstrap'
import { DartsGameContext } from '../../context/DartsGameContext';
import { Link } from 'react-router-dom';

function GameSummary({ show, fullscreen, setShow }) {
  const { game } = useContext(DartsGameContext);

  // useEffect(() => {
  //   console.log(game);
  // }, [game]);

  return (
    <Modal backdrop="static" show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>Game Summary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="podium">
          <span className="place seconds-place">{game.podium[2] ? game.podium[2].displayName : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon"/></span>
          <span className="place first-place">{game.podium[1] ? game.podium[1].displayName : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon"/></span>
          <span className="place third-place">{game.podium[3] ? game.podium[3].displayName : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon"/></span>
        </div>
        <Link className="btn btn-outline-dark" to="/darts">Create New Game</Link>
      </Modal.Body>
    </Modal>
  )
}

export default GameSummary