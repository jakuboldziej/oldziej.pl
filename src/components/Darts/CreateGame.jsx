/* eslint-disable react/prop-types */
import { Button, Card, Form, Modal } from "react-bootstrap"
import { useContext, useEffect, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router";
import { v4 as uuid } from "uuid";
import { DartsGameContext } from "../../context/DartsGameContext";

function CreateGame({ show, fullscreen, setShow }) {
  const [usersNotPlaying, setUsersNotPlaying] = useState([]);
  const [usersPlaying, setUsersPlaying] = useState([]);
  const [userPodiumsCount, setUserPodiumsCount] = useState([]);
  const [randomizePlayers, setRandomizePlayers] = useState(true);
  const [selectGameMode, setSelectGameMode] = useState('X01');
  const [selectStartPoints, setSelectStartPoints] = useState('501');
  const [selectCheckOut, setSelectCheckOut] = useState('Straight Out');
  const [selectSets, setSelectSets] = useState('1');
  const [selectLegs, setSelectLegs] = useState('1');
  const [usersPodium, setUsersPodium] = useState(0);

  const { setGame } = useContext(DartsGameContext);

  const navigate = useNavigate();

  const numbersLegsSets = [];
  for (let i = 1; i <= 21; i++) numbersLegsSets.push(<option key={i}>{i}</option>);

  useEffect(() => {
    const podiumOptions = [];
    if (usersPlaying) {
      for (let i = 1; i <= usersPlaying.length; i++) {
        podiumOptions.push(<option key={i}>{i}</option>);
      }
      setUserPodiumsCount(podiumOptions);
    }
  }, [usersPlaying]);

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

  const randomizeList = (list) => {
    return list.slice().sort(() => Math.random() - 0.5);
  };

  const handleGameStart = async () => {
    const gameId = uuid();
    let updatedUsers = usersPlaying.map((user) => ({
      ...user,
      points: selectStartPoints,
      turn: false,
      turnsSum: 0,
      currentTurn: 1,
      place: 0,
      turns: {
        1: null,
        2: null,
        3: null
      },
      throws: {
        drzwi: 0,
        doubles: 0,
        triples: 0,
        normal: 0,
      },
      legs: 0,
      sets: 0,
      avgPointsPerThrow: 0,
    }));
    if (randomizePlayers) {
      updatedUsers = randomizeList(updatedUsers);
    }
    const game = {
      id: gameId,
      created_at: serverTimestamp(),
      users: updatedUsers,
      podiums: usersPodium,
      podium: {
        1: null,
        2: null,
        3: null
      },
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
      <Modal className="create-game-modal" show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="outline-info" onClick={handleGameStart}>Start</Button>
          <div className="settings">
            <Card bg="dark" text="light" className="usersCard" style={{ width: '18rem'}}>
              <Card.Header>Add Users</Card.Header>
              <Card.Body>
                <Card.Title>Not Playing</Card.Title>
                <hr />
                <div className="users">
                  {usersNotPlaying.length > 0 ? usersNotPlaying.map((user) => (
                    <div onClick={()=>handleSelect(user, 'add')} className="user" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : <Card.Text>None</Card.Text>}
                </div>
                <Card.Title className="mt-3 d-flex justify-content-between">
                  <span>Playing</span>
                  <Form.Check id="checkbox" label="Random" inline checked={randomizePlayers} onChange={()=>setRandomizePlayers(prev=>!prev)}/>
                </Card.Title>
                <hr />
                <div className="users">
                  {usersPlaying.length > 0 ? usersPlaying.map((user) => (
                    <div onClick={()=>handleSelect(user, 'del')} className="user playing" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : <Card.Text>None</Card.Text>}
                </div>
              </Card.Body>
            </Card>
            <Card className="settingsCard" bg="dark" text="light" style={{ width: '18rem'}}>
              <Card.Header>Settings</Card.Header>
              <Card.Body>
                <Card.Title>Podium</Card.Title>
                <hr />
                <Form.Select value={usersPodium} onChange={(e)=> setUsersPodium(e.target.value)}>
                  {usersPlaying.length > 0 ? userPodiumsCount : <option disabled>None</option>}
                </Form.Select>
                <br />
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
                  <option>201</option>
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
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CreateGame