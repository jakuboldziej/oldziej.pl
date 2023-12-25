import { Card, Modal } from "react-bootstrap"
import PropTypes from 'prop-types';

CreateGame.propTypes = {
  show: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  setShow: PropTypes.bool.isRequired
}

function CreateGame({ show, fullscreen, setShow }) {
  return (
    <>
      <Modal show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Card bg="dark" text="light" style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>asdf</Card.Title>
            <hr />
          </Card.Body>
        </Card>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CreateGame