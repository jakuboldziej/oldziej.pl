/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { Button, Modal } from 'react-bootstrap'
import { DartsGameContext } from '../../context/DartsGameContext';
import { Link } from 'react-router-dom';

function GameSummary({ show, fullscreen, setShow }) {
  const { game } = useContext(DartsGameContext);

  return (
    <Modal show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Game Summary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {game.userWon && game.userWon.displayName} won!
        <Link className="btn btn-outline-dark" to="/darts">Create New Game</Link>
      </Modal.Body>
    </Modal>
  )
}

export default GameSummary