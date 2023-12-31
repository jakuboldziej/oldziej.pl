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
        setOverthrow(false);
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [overthrow]);

  const usersContainerRef = useRef(null);

  useEffect(() => {
    const userWithTurn = users.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn.uid}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [users, game.turn]);

  useEffect(() => {
    const updatedUsers = [...users];
    updatedUsers[0].turn = true;
    setUsers(updatedUsers);
  }, []);

  const keyboardParams = {
    handleRound, 
    users, 
    game, 
    handleShow, 
    setUsers, 
    specialState, 
    setSpecialState
  }

  const userDynamicStyle = (user) => {
    return {
      borderLeft: `15px solid ${user.turn ? 'lightgreen' : 'lightgrey'}`,
      backgroundColor: `${user.points === 0 ? 'gold' : 'transparent'}`,
    }
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
          {users.map((user) => (
            <Row className="user" data-userid={user.uid} style={userDynamicStyle(user)} key={user.uid}>
              <Col sm>
                <Row>
                  <b>{user.points}</b>
                  <span className="darts-thrown">
                    <img width="12" height="12" src="https://img.icons8.com/external-kosonicon-solid-kosonicon/12/external-dart-sports-equipment-kosonicon-solid-kosonicon.png" alt="external-dart-sports-equipment-kosonicon-solid-kosonicon"/>
                    {Object.values(user.throws).reduce((acc, val) => acc + val, 0)}
                  </span>
                </Row>
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
                <Row>Ø {user.avgPointsPerThrow}</Row>
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