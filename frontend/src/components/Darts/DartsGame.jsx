/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useContext, useEffect, useRef, useState } from "react"
import { DartsGameContext } from "../../context/DartsGameContext"
import { Col, Row } from "react-bootstrap";
import Keyboard from "./Keyboard";
import RedDot from "../../images/red_dot.png";
import GreenDot from "../../images/green_dot.png";
import GameSummary from "./GameSummary";
import { handleRound } from "./utils";
import { Link } from "react-router-dom";
import { ToastsContext } from "../../context/ToastsContext";
import MyToasts from "../MyToasts";
import MyAccordion from "../MyAccordion";

function DartsGame() {
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }
  
  const { game } = useContext(DartsGameContext);
  const { showNewToast } = useContext(ToastsContext);

  if (!game) {
    return (
    <div className="d-flex flex-column gap-3 justify-content-center align-items-center vh-100 text-light">
      <h1>You are not currently in a game.</h1>
      <Link className="btn btn-outline-danger glow-button" to="/darts">Create New One</Link>
    </div>
    )
  }

  const [users, setUsers] = useState(game?.users || null);
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
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn._id}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    if (game) {
      game.users = users;
      localStorage.setItem('dartsGame', JSON.stringify(game));
    }
  }, [users, game.turn]);

  useEffect(() => {
    if (!game?.active) {
      localStorage.setItem('dartsGame', null);
    }
  }, [game?.active]);

  const keyboardParams = { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState, showNewToast, setOverthrow }

  const userDynamicStyle = (user) => {
    return {
      borderLeft: `17px solid ${user.turn ? '#E00000' : '#FFF'}`,
      backgroundColor: `${user.points === 0 ? 'gold' : '#00B524'}`,
      color: overthrow === user.displayName ? 'red' : 'white',
      boxShadow: overthrow === user.displayName ? '0 0 30px #E00000' : null,
    }
  }

  return (
    <div className="darts-wrapper">
      <div className="stats">
      </div>
      <div className="darts-game">
        <div className="info">
          <h2>Round: {game.round}</h2>
          <h5 style={{color: '#E00000'}}>L: {game.legs}</h5>
          <h2 style={{color: '#E00000'}}>Turn: {game.turn}</h2>
          <h5 style={{color: '#E00000'}}>S: {game.sets}</h5>
          <h2>{game.active ? 'In Progress' : 'Ended'} <img src={game.active ? GreenDot : RedDot}/></h2>
        </div>
        <div className="users" ref={usersContainerRef}>
          {users.map((user) => (
            <Row className="user" data-userid={user._id} style={userDynamicStyle(user)} key={user._id}>
              <Col className="main-col" sm={4} xs={4}>
                <Row>
                  <b>{user.points}</b>
                  <span className="darts-thrown">
                    <img width="12" height="12" src="https://img.icons8.com/external-kosonicon-solid-kosonicon/12/external-dart-sports-equipment-kosonicon-solid-kosonicon.png" alt="external-dart-sports-equipment-kosonicon-solid-kosonicon"/>
                    {Object.values(user.throws).reduce((acc, val) => acc + val, 0)}
                  </span>
                </Row>
                <Row style={{color: '#F3F0D2'}}>{user.displayName}</Row>
              </Col>
              <Col className="main-col" sm={4} xs={4}>
                <Row className="turns">
                  {Object.entries(user.turns).map((turn) => {
                    return (<Col className="turn" key={turn[0]}>{turn[1]}</Col>);
                  })}
                </Row>
                <Row>{user.turnsSum}</Row>
              </Col>
              <Col className="main-col" sm={4} xs={4}>
                <Row className="legs-sets">
                  <Col className="legs">
                    {user.legs}
                    <span className="SL">L</span>
                  </Col>
                  <Col className="sets">
                    {user.sets}
                    <span className="SL">S</span>
                  </Col>
                </Row>
                <Row className="avg">Ø {user.avgPointsPerThrow}</Row>
              </Col>
            </Row>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <MyAccordion users={users} game={game} />
        {game.training && <span className="text-white fs-2 text-center">Training</span>}

        <Keyboard params={keyboardParams} />
      </div>
      <GameSummary show={show} fullscreen={fullscreen} setShow={setShow}/>
      <MyToasts />
    </div>
  )
}

export default DartsGame