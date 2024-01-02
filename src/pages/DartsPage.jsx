import { useContext, useEffect, useState } from "react";
import CreateGame from "../components/Darts/CreateGame";
import NavBar from "../components/NavBar"
import { Button, Dropdown } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import RedDot from "../images/red_dot.png";
import GreenDot from "../images/green_dot.png";
import { ToastsContext } from "../context/ToastsContext";
import MyToasts from "../components/MyToasts";

function DartsPage() {
  document.title = "HomeServer | Darts";

  const { showNewToast } = useContext(ToastsContext);

  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [playerInGame, setPlayerInGame] = useState(false);
  const [games, setGames] = useState([]);
  const [dartUsers, setDartUsers] = useState([]);
  const [filterUsersType, setFilterUsersType] = useState("firstPlace");

  const handleShow = (breakpoint) => {
    if (!playerInGame) {
      setFullscreen(breakpoint);
      setShow(true);
    } else {
      showNewToast("Live game going", "You are already in a game <a href='/darts/game' class='mx-2 btn btn-outline-danger'>Live Game</a>");
    }
  }

  const handleFilterUsers = (users, action) => {
    let sortedUsers;

    switch (action) {
      case "firstPlace":
      case "secondPlace":
      case "thirdPlace":
        sortedUsers = users.slice().sort((a, b) => {
          const firstData = a.podiums[action];
          const secondData = b.podiums[action];
          return secondData - firstData;
        });
        break;
      case "doors":
        sortedUsers = users.slice().sort((a, b) => {
          const firstData = a.throws["doors"];
          const secondData = b.throws["doors"];
          return secondData - firstData;
        });
        break;
      case "gamesPlayed":
        sortedUsers = users.slice().sort((a, b) => {
          const firstData = a["gamesPlayed"];
          const secondData = b["gamesPlayed"];
          return secondData - firstData;
        });
        break;
      default:
        sortedUsers = users.slice();
        break;
    }

    return sortedUsers;
  };

  useEffect(() => {
    const sortedUsers = handleFilterUsers(dartUsers, filterUsersType);
    setDartUsers(sortedUsers);
  }, [filterUsersType]);

  useEffect(() => {
    const getGames = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartGames'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
    }
    const getDartUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartUsers'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedUsers = handleFilterUsers(gamesData, filterUsersType);
      setDartUsers(sortedUsers);
    }
    getDartUsers();
    getGames();

    // Managing live game
    const liveGame = localStorage.getItem('dartsGame');
    if (liveGame !== "null" || liveGame !== null) {
      setPlayerInGame(true);
      showNewToast("Live game going", "You are already in a game <a href='/darts/game' class='mx-2 btn btn-outline-danger'>Live Game</a>");
    }
  }, []);

  return (
    <>
      <NavBar />
      <div className="darts-page">
        <Button variant="outline-info" onClick={handleShow}>Create</Button>
        <div className="cards">
          <div className="myCard leaderboard">
            <span>
              <h3>Leaderboard</h3>
              <Dropdown data-bs-theme="dark">
                <Dropdown.Toggle className="custom-dropdown-toggle">
                  <span className="background"></span>
                </Dropdown.Toggle>

                <Dropdown.Menu onChange={() => console.log('close')}>
                  <Dropdown.Item onClick={() => setFilterUsersType("firstPlace")}>First Places</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("secondPlace")}>Second Places</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("thirdPlace")}>Third Places</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilterUsersType("gamesPlayed")}>Games Played</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilterUsersType("doors")}>Doors</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </span>
            <div className="info">
              {dartUsers && dartUsers.map((dartUser) => {
                return (
                  <div key={dartUser.id} className="element">
                    <span className="username">{dartUser.displayName}</span>
                    <span>
                      <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["firstPlace"]}
                    </span>
                    <span>
                      <img width="20" height="20" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["secondPlace"]}
                    </span>
                    <span>
                      <img width="20" height="20" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["thirdPlace"]}
                    </span>
                    <span>
                      <img width="20" height="20" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                      {dartUser.gamesPlayed}
                    </span>
                    <span>
                      <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                      {dartUser.throws["doors"]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="myCard games">
            <span>
              <h3>Games</h3>
              <Dropdown data-bs-theme="dark">
                <Dropdown.Toggle className="custom-dropdown-toggle">
                  <span className="background"></span>
                </Dropdown.Toggle>

                <Dropdown.Menu onChange={() => console.log('close')}>
                  <Dropdown.Item onClick={() => setFilterUsersType("firstPlace")}>First Places</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("secondPlace")}>Second Places</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("thirdPlace")}>Third Places</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilterUsersType("gamesPlayed")}>Games Played</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilterUsersType("doors")}>Doors</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </span>
            <div className="info">
              {games && games.map((game) => {
                return (
                  game.active ?
                    <div key={game.id} className="element">
                      <span className="gameActive">
                        {game.active ? 'Active' : 'Ended'}
                        <img src={game.active ? GreenDot : RedDot} />
                      </span>
                      {game.users[0] && <span>
                        <h6>{game.users[0].displayName}</h6>
                        <h6>{game.users[1].points}</h6>
                      </span>}
                      {game.users[1] && <span>
                        <h6>{game.users[1].displayName}</h6>
                        <h6>{game.users[1].points}</h6>
                      </span>}
                      {game.users[2] && <span>
                        <h6>{game.users[2].displayName}</h6>
                        <h6>{game.users[2].points}</h6>
                      </span>}
                    </div>
                    :
                    <div key={game.id} className="element">
                      <span className="gameActive">
                        {game.active ? 'Active' : 'Ended'}
                        <img src={game.active ? GreenDot : RedDot} />
                      </span>
                      <span>
                        <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[1].displayName}
                      </span>
                      {game.podium[2] && <span>
                        <img width="20" height="20" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[2].displayName}
                      </span>}
                      {game.podium[3] && <span>
                        <img width="20" height="20" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[3].displayName}
                      </span>}
                    </div>
                )
              })}
            </div>
          </div>
          <div className="myCard highlights">
            <span>
              <h3>Highlights</h3>
            </span>
            <div className="info">

            </div>
          </div>
        </div>
        <CreateGame show={show} fullscreen={fullscreen} setShow={setShow} />
      </div>

      <MyToasts />
    </>
  )
}

export default DartsPage