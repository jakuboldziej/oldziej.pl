import { useContext, useEffect, useState } from "react"
import { DartsGameContext } from "../../context/DartsGameContext"
import { Col, Row } from "react-bootstrap";
import Keyboard from "./Keyboard";
import RedDot from "../../images/red_dot.png";
import GreenDot from "../../images/green_dot.png";
import GameSummary from "./GameSummary";

function DartsGame() {
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }

  const { game } = useContext(DartsGameContext);
  const [users, setUsers] = useState(game.users);

  useEffect(() => {
    // first round
    const updatedUsers = [...users];
    updatedUsers[0].turn = true;
    setUsers(updatedUsers);
  }, [game.round]);

  useEffect(() => {
    console.log(users)
  }, [users]);

  const handlePoints = (currentUser) => {
    currentUser.points -= currentUser.turns[currentUser.currentTurn];
    const initialUserPoints = parseInt(currentUser.points) + currentUser.turns["1"] + currentUser.turns["2"] + currentUser.turns["3"];

    if (currentUser.points < 0) {
      currentUser.points = initialUserPoints;
      currentUser.turns = {1: null, 2: null, 3: null}
      currentUser.turnsSum = 0;
      currentUser.currentTurn = 3;

      console.log('Overthrow.')
    } else if (currentUser.points === 0) {
      game.userWon = currentUser;
      handleShow();
    }
  }

  const handleUsersState = (currentUser, value) => {
    // current user
    currentUser.turns[currentUser.currentTurn] = value;
    currentUser.turnsSum = currentUser.turns["1"] + currentUser.turns["2"] + currentUser.turns["3"]
    handlePoints(currentUser);

    if (currentUser.currentTurn === 3) {
      currentUser.currentTurn = 1;
      currentUser.turn = false;
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user =>
          user.uid === currentUser.uid ? currentUser : user
        );
        return updatedUsers;
      });
      // next user
      const nextUserIndex = (users.findIndex(user => user.uid === currentUser.uid) + 1) % users.length;
      const nextUser = users[nextUserIndex]
      nextUser.turn = true;
      nextUser.turns = {1: null, 2: null, 3: null}
      nextUser.turnsSum = 0;
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user =>
          user.uid === nextUser.uid ? nextUser : user
          );
          return updatedUsers;
        });
      // game info
      game.turn = nextUser.displayName;
      nextUserIndex === 0 ? game.round += 1 : null

      return;
    }
    currentUser.currentTurn += 1;
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.uid === currentUser.uid ? currentUser : user
      );
      return updatedUsers;
    });
  }

  const handleRound = (value) => {
    const currentUser = users.find(user => user.turn);
    if (Number.isInteger(value)){
      handleUsersState(currentUser, value);
    } else if (!Number.isInteger(value)) {
      console.log('addon');
    }
  }

  return (
    <div className="darts-wrapper">
      <div className="darts-game">
        <div className="info">
          <h2>Round: {game.round}</h2>
          <h2>Turn: {game.turn}</h2>
          <h2>{game.active ? 'In Progress' : 'Ended'} <img src={game.active ? GreenDot : RedDot}/></h2>
        </div>
        <div className="users">
          {game.users.map((user) => (
            <Row className="user" style={{borderLeft: `15px solid ${user.turn ? 'lightgreen' : 'lightgrey'}`}} key={user.uid}>
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
        <Keyboard handleRound={handleRound} />
      </div>
      <GameSummary show={show} fullscreen={fullscreen} setShow={setShow}/>
    </div>
  )
}

export default DartsGame