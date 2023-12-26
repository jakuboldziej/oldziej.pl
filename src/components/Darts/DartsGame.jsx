import { useContext, useEffect, useRef, useState } from "react"
import { DartsGameContext } from "../../context/DartsGameContext"
import { Col, Row } from "react-bootstrap";
import Keyboard from "./Keyboard";
import RedDot from "../../images/red_dot.png";
import GreenDot from "../../images/green_dot.png";
import GameSummary from "./GameSummary";
import { handleRound } from "./utils";

function DartsGame() {
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }

  const { game } = useContext(DartsGameContext);
  const [users, setUsers] = useState(game.users);
  const [specialState, setSpecialState] = useState([false, ""]);

  const usersContainerRef = useRef(null);

  useEffect(() => {
    const userWithTurn = game.users.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn.uid}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [game.users, game.turn]);

  useEffect(() => {
    // first round
    const updatedUsers = [...users];
    updatedUsers[0].turn = true;
    setUsers(updatedUsers);
  }, [game.round]);

  return (
    <div className="darts-wrapper">
      <div className="darts-game">
        <div className="info">
          <h2>Round: {game.round}</h2>
          <h2>Turn: {game.turn}</h2>
          <h2>{game.active ? 'In Progress' : 'Ended'} <img src={game.active ? GreenDot : RedDot}/></h2>
        </div>
        <div className="users" ref={usersContainerRef}>
          {game.users.map((user) => (
            <Row className="user" data-userid={user.uid} style={{borderLeft: `15px solid ${user.turn ? 'lightgreen' : 'lightgrey'}`}} key={user.uid}>
              <Col sm>
                <Row><b>{user.points}</b></Row>
                <Row>{user.displayName}</Row>
              </Col>
              <Col sm>
                <Row className="turns">
                  {Object.entries(user.turns).map((turn) => {
                    return (<Col className="turn" key={turn[0]}>{turn[1]}</Col>);
                  })}
                </Row>
                <Row>{user.turnsSum}</Row>
              </Col>
              <Col sm>
                <Row className="legs-sets">
                  <Col className="legs">{user.legs}</Col>
                  <Col className="sets">{user.sets}</Col>
                </Row>
                <Row>Ø 0</Row>
              </Col>
            </Row>
          ))}
        </div>
        <Keyboard params={{ handleRound, users, game, handleShow, setUsers, specialState, setSpecialState}} />
      </div>
      <GameSummary show={show} fullscreen={fullscreen} setShow={setShow}/>
    </div>
  )
}

export default DartsGame