/* eslint-disable react/prop-types */
import { Button, Card, Form, Modal } from "react-bootstrap"
import { useContext, useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router";
import { v4 as uuid } from "uuid";
import { DartsGameContext } from "../../context/DartsGameContext";

function CreateGame({ show, fullscreen, setShow }) {
  const [usersNotPlaying, setUsersNotPlaying] = useState([]);
  const [usersPlaying, setUsersPlaying] = useState([]);
  const [randomizePlayers, setRandomizePlayers] = useState(true);
  const [selectGameMode, setSelectGameMode] = useState('X01');
  const [selectStartPoints, setSelectStartPoints] = useState('501');
  const [selectCheckOut, setSelectCheckOut] = useState('Double Out');
  const [selectSets, setSelectSets] = useState('1');
  const [selectLegs, setSelectLegs] = useState('1');

  const { setGame } = useContext(DartsGameContext);

  const navigate = useNavigate();

  const numbersLegsSets = [];
  for (let i = 1; i <= 21; i++) numbersLegsSets.push(<option key={i}>{i}</option>);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const colRef = collection(db, "dartUsers");
        const querySnapshot = await getDocs(colRef);

        const fetchedUsers = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({...doc.data()});
        });

        setUsersNotPlaying(fetchedUsers);
      } catch (error) {
        console.error("Error getting users: ", error);
      }
    };

    getUsers();
  }, []);

  const handleSelect = (user, action) => {
    if (action === 'add') {
      setUsersPlaying((prevUsersPlaying) => [...prevUsersPlaying, user]);
  
      setUsersNotPlaying((prevUsersNotPlaying) =>
        prevUsersNotPlaying.filter((notPlayingUser) => notPlayingUser.uid !== user.uid)
      );
    } else if (action === 'del') {
      setUsersPlaying((prevUsersPlaying) =>
        prevUsersPlaying.filter((playingUser) => playingUser.uid !== user.uid)
      );
  
      setUsersNotPlaying((prevUsersNotPlaying) => [...prevUsersNotPlaying, user]);
    }
  };

  const handleGameStart = async () => {
    const gameId = uuid();
    const updatedUsers = usersPlaying.map((user) => ({
      ...user,
      points: selectStartPoints,
      turn: false,
      turnsSum: 0,
      currentTurn: 1,
      turns: {
        1: null,
        2: null,
        3: null
      },
      shots: {
        drzwi: 0,
        doubles: 0,
        triples: 0,
        normals: 0,
      },
      legs: 0,
      sets: 0,
      avgPointsPerSet: 0,
    }));
    const game = {
      id: gameId,
      users: updatedUsers,
      userWon: null,
      turn: updatedUsers[0].displayName,
      // randomizePlayers,
      active: true,
      gameMode: selectGameMode,
      startPoints: selectStartPoints,
      checkOut: selectCheckOut,
      sets: selectSets,
      legs: selectLegs,
      round: 1,
    }
    await setDoc(doc(db, "dartGames", gameId), game);
    setGame(game);
    navigate("game");
  }

  return (
    <>
      <Modal show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="settings">
            <Card bg="dark" text="light" style={{ width: '18rem', minHeight: 650  }}>
              <Card.Header>Add Users</Card.Header>
              <Card.Body>
                <Card.Title>Not Playing</Card.Title>
                <hr />
                <div className="users">
                  {usersNotPlaying.map((user) => (
                    <div onClick={()=>handleSelect(user, 'add')} className="user" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  ))}
                </div>
                <Card.Title className="mt-3 d-flex justify-content-between">
                  <span>Playing</span>
                  <Form.Check id="checkbox" label="Random" inline checked={randomizePlayers} onChange={()=>setRandomizePlayers((prevState) => !prevState)}/>
                </Card.Title>
                <hr />
                <div className="users">
                  {usersPlaying.map((user) => (
                    <div onClick={()=>handleSelect(user, 'del')} className="user playing" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            <Card bg="dark" text="light" style={{ width: '18rem', minHeight: 650 }}>
              <Card.Header>Settings</Card.Header>
              <Card.Body>
                <Card.Title>Gamemode</Card.Title>
                <hr />
                <Form.Select value={selectGameMode} onChange={(e)=> setSelectGameMode(e.target.value)}>
                  <option>X01</option>
                  <option>Cricket</option>
                  <option>Around the Clock</option>
                  <option>Shanghai</option>
                  <option>Elimination</option>
                  <option>Highscore</option>
                  <option>Killer</option>
                  <option>Splitscore</option>
                </Form.Select>
                <br />
                <Card.Title>Startpoints</Card.Title>
                <hr />
                <Form.Select value={selectStartPoints} onChange={(e)=> setSelectStartPoints(e.target.value)}>
                  <option>101</option>
                  <option>301</option>
                  <option>501</option>
                  <option>601</option>
                  <option>701</option>
                  <option>901</option>
                  <option>1001</option>
                  <option>Custom</option>
                </Form.Select>
                <br />
                <Card.Title>Check-Out</Card.Title>
                <hr />
                <Form.Select value={selectCheckOut} onChange={(e)=> setSelectCheckOut(e.target.value)}>
                  <option>Straight Out</option>
                  <option>Double Out</option>
                  <option>Triple Out</option>
                  <option>Master Out</option>
                  <option>Splitscore</option>
                </Form.Select>
                <br />
                <Card.Title>Sets</Card.Title>
                <hr />
                <Form.Select value={selectSets} onChange={(e)=> setSelectSets(e.target.value)}>
                  {numbersLegsSets}
                </Form.Select>
                <br />
                <Card.Title>Legs</Card.Title>
                <hr />
                <Form.Select value={selectLegs} onChange={(e)=> setSelectLegs(e.target.value)}>
                  {numbersLegsSets}
                </Form.Select>
              </Card.Body>
            </Card>
          </div>
          <Button variant="outline-info" onClick={handleGameStart}>Start</Button>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CreateGame