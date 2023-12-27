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
  const [overthrow, setOverthrow] = useState(false);

  useEffect(() => {
    let timer;

    if (overthrow) {
      timer = setTimeout(() => {
        setOverthrow(false); // Set overthrow to false after 3 seconds
      }, 3000);
    }

    return () => {
      clearTimeout(timer); // Clear the timer if component unmounts before 3 seconds
    };
  }, [overthrow]);

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
    const updatedUsers = [...users];
    updatedUsers[0].turn = true;
    setUsers(updatedUsers);
  }, [game.round]);

  const keyboardParams = {
    handleRound, 
    users, 
    game, 
    handleShow, 
    setUsers, 
    specialState, 
    setSpecialState
  }
  return (
    <div className="darts-wrapper">
      <div className="stats">
      </div>
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
                <Row>Ø {user.avgPointsPerSet}</Row>
              </Col>
            </Row>
          ))}
        </div>
      </div>
      <Keyboard params={keyboardParams} />
      <GameSummary show={show} fullscreen={fullscreen} setShow={setShow}/>
    </div>
  )
}

export default DartsGame