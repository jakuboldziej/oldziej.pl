/* eslint-disable react/prop-types */
import { Button, Card, Form, Modal } from "react-bootstrap"
import { useContext, useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router";
import { v4 as uuid } from "uuid";
import { DartsGameContext } from "../../context/DartsGameContext";
import _ from 'lodash';
import { AuthContext } from "../../context/AuthContext";
import { ToastsContext } from "../../context/ToastsContext";

function CreateGame({ show, setShow }) {
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
  const [showCustomPoints, setShowCustomPoints] = useState(false);
  const [customStartPoints, setCustomStartPoints] = useState('');

  const { setGame } = useContext(DartsGameContext);
  const { currentUser } = useContext(AuthContext);
  const { showNewToast } = useContext(ToastsContext);

  const navigate = useNavigate();

  const numbersLegsSets = [];
  for (let i = 1; i <= 21; i++) numbersLegsSets.push(<option key={i}>{i}</option>);

  useEffect(() => {
    const podiumOptions = [];
    if (usersPlaying) {
      for (let i = 1; i <= usersPlaying.length; i++) {
        podiumOptions.push(<option key={i}>{i}</option>);
        setUsersPodium(i);
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
          fetchedUsers.push({ ...doc.data() });
        });

        setUsersNotPlaying(fetchedUsers);
      } catch (error) {
        console.error("Error getting users: ", error);
      }
    };

    getUsers();

    // get previous settings
    const previousSettings = JSON.parse(localStorage.getItem("gameSettings"));
    if (previousSettings) {
      setSelectGameMode(previousSettings.gamemode)
      setSelectStartPoints(previousSettings.startPoints)
      setSelectCheckOut(previousSettings.checkout)
      setSelectLegs(previousSettings.legs)
      setSelectSets(previousSettings.sets)
    }
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

  const handleSelectStartPoints = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "Custom") {
      setShowCustomPoints(true);
    } else {
      setSelectStartPoints(selectedValue);
    }
  };

  const handleCustomStartPoints = () => {
    setShowCustomPoints(false);
    setSelectStartPoints(customStartPoints);
  }

  const randomizeList = (list) => {
    return list.slice().sort(() => Math.random() - 0.5);
  };

  const handleGameStart = async (training = false) => {
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
        doors: 0,
        doubles: 0,
        triples: 0,
        normal: 0,
      },
      legs: 0,
      sets: 0,
      avgPointsPerThrow: 0,
    }));
    if (usersPlaying.length === 0) return showNewToast("Game settings", "You have to select users to play");
    if (randomizePlayers) updatedUsers = randomizeList(updatedUsers);
    const game = {
      id: gameId,
      created_at: Date.now(),
      created_by: currentUser.displayName,
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
    updatedUsers[0].turn = true;
    const currentUserCopy = _.cloneDeep(updatedUsers[0]);
    const gameCopy = _.pick(game, ['round', 'turn']);
    game.record = [{
      game: {
        round: gameCopy.round,
        turn: gameCopy.turn
      },
      user: currentUserCopy
    }];
    if (training === true) {
      game.training = true;
    } else {
      await setDoc(doc(db, "dartGames", gameId), game);
    }
    setGame(game);
    navigate("game");

    localStorage.setItem("gameSettings", JSON.stringify({
      gamemode: selectGameMode,
      startPoints: selectStartPoints,
      checkout: selectCheckOut,
      sets: selectSets,
      legs: selectLegs,
    }))
  }

  return (
    <>
      <Modal className="create-game-modal" show={show} fullscreen={true} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-info" onClick={handleGameStart}>Start</Button>
            <Button variant="outline-warning" onClick={() => handleGameStart(true)}>Training</Button>
          </div>
          <div className="settings">
            <Card bg="dark" text="light" className="usersCard" style={{ width: '18rem' }}>
              <Card.Header>Add Users</Card.Header>
              <Card.Body>
                <Card.Title>Not Playing</Card.Title>
                <hr />
                <div className="users">
                  {usersNotPlaying.length > 0 ? usersNotPlaying.map((user) => (
                    <div onClick={() => handleSelect(user, 'add')} className="user" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : <Card.Text>None</Card.Text>}
                </div>
                <Card.Title className="mt-3 d-flex justify-content-between">
                  <span>Playing</span>
                  <Form.Check id="checkbox" label="Random" inline checked={randomizePlayers} onChange={() => setRandomizePlayers(prev => !prev)} />
                </Card.Title>
                <hr />
                <div className="users">
                  {usersPlaying.length > 0 ? usersPlaying.map((user) => (
                    <div onClick={() => handleSelect(user, 'del')} className="user playing" key={user.uid}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : <Card.Text>None</Card.Text>}
                </div>
              </Card.Body>
            </Card>
            <Card className="settingsCard" bg="dark" text="light" style={{ width: '18rem' }}>
              <Card.Header>Settings</Card.Header>
              <Card.Body>
                <Card.Title>Podium</Card.Title>
                <hr />
                <Form.Select value={usersPodium} onChange={(e) => setUsersPodium(e.target.value)}>
                  {usersPlaying.length > 0 ? userPodiumsCount : <option disabled>None</option>}
                </Form.Select>
                <br />
                <Card.Title>Gamemode</Card.Title>
                <hr />
                <Form.Select value={selectGameMode} onChange={(e) => setSelectGameMode(e.target.value)}>
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
                <Form.Select value={selectStartPoints} onChange={handleSelectStartPoints}>
                  <option>101</option>
                  <option>201</option>
                  <option>301</option>
                  <option>501</option>
                  <option>601</option>
                  <option>701</option>
                  <option>901</option>
                  <option>1001</option>
                  <option onClick={() => setShowCustomPoints(true)}>Custom</option>
                  <option className="d-none" value={customStartPoints}>{customStartPoints}</option>
                </Form.Select>
                <br />
                <Card.Title>Check-Out</Card.Title>
                <hr />
                <Form.Select value={selectCheckOut} onChange={(e) => setSelectCheckOut(e.target.value)}>
                  <option>Straight Out</option>
                  <option>Double Out</option>
                  <option>Triple Out</option>
                  <option>Master Out</option>
                  <option>Splitscore</option>
                </Form.Select>
                <br />
                <Card.Title>Sets</Card.Title>
                <hr />
                <Form.Select value={selectSets} onChange={(e) => setSelectSets(e.target.value)}>
                  {numbersLegsSets}
                </Form.Select>
                <br />
                <Card.Title>Legs</Card.Title>
                <hr />
                <Form.Select value={selectLegs} onChange={(e) => setSelectLegs(e.target.value)}>
                  {numbersLegsSets}
                </Form.Select>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
      </Modal>

      <Modal centered show={showCustomPoints} onHide={() => setShowCustomPoints(false)}>
        <Modal.Header data-bs-theme="dark" closeButton className="bg-dark text-light">
          <Modal.Title>Set Custom StartPoints</Modal.Title>
        </Modal.Header>
        <Modal.Body  className="bg-dark text-light">
          <Form.Control type="number" name="custom-startpoints" autoFocus onChange={(e) => {
          const enteredValue = e.target.value;
          if (enteredValue >= 0) {
            setCustomStartPoints(enteredValue);
          } else {
            setCustomStartPoints(1);
          }
        }} min={1}/>
        </Modal.Body>
        <Modal.Footer  className="bg-dark text-light">
          <Button variant="outline-primary" onClick={handleCustomStartPoints}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CreateGame