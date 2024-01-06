/* eslint-disable react/prop-types */
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
import { useLocation } from "react-router";
import MyTooltip from "../components/myTooltip";

function DartsPage() {
  document.title = "HomeServer | Darts";

  const location = useLocation();

  const { showNewToast } = useContext(ToastsContext);

  const [show, setShow] = useState(false);
  const [playerInGame, setPlayerInGame] = useState(false);
  const [games, setGames] = useState([]);
  const [dartUsers, setDartUsers] = useState([]);
  const [filterUsersType, setFilterUsersType] = useState("firstPlace");
  const [filterGamesType, setFilterGamesType] = useState("created_at");

  const handleShow = () => {
    if (!playerInGame) {
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
          const firstData = a.gamesPlayed;
          const secondData = b.gamesPlayed;
          return secondData - firstData;
        });
        break;
      case "highestAvg":
        sortedUsers = users.slice().sort((a, b) => {
          const firstData = a.highestEndingAvg;
          const secondData = b.highestEndingAvg;
          return secondData - firstData;
        });
        break;
        case "highestRPT":
          sortedUsers = users.slice().sort((a, b) => {
            const firstData = a.highestRoundPoints;
            const secondData = b.highestRoundPoints;
            return secondData - firstData;
          });
          break;
      default:
        sortedUsers = users.slice();
        break;
    }

    return sortedUsers;
  };

  const handleFilterGames = (games, action) => {
    let sortedGames;

    switch (action) {
      case "created_at":
        sortedGames = games.slice().sort((a, b) => {
          const firstData = a.created_at;
          const secondData = b.created_at;
          return secondData - firstData;
        });
        break;
      case "most_users":
        sortedGames = games.slice().sort((a, b) => {
          const firstData = a.users.length;
          const secondData = b.users.length;
          return secondData - firstData;
        });
        break;
      default:
        sortedGames = games.slice();
        break;
    }

    return sortedGames;
  };

  useEffect(() => {
    const sortedUsers = handleFilterUsers(dartUsers, filterUsersType);
    setDartUsers(sortedUsers);
  }, [filterUsersType]);

  useEffect(() => {
    const sortedGames = handleFilterGames(games, filterGamesType);
    setGames(sortedGames);
  }, [filterGamesType]);

  useEffect(() => {
    // Getting data
    const getGames = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartGames'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedGames = handleFilterGames(gamesData, filterGamesType);
      setGames(sortedGames);
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
    if (liveGame !== "null" && liveGame !== null) {
      setPlayerInGame(true);
      showNewToast("Live game going", "You are already in a game <a href='/darts/game' class='mx-2 btn btn-outline-danger'>Live Game</a>");
    }

    // Create New Game Auto
    const params = location.state;
    if (params && params.createNewGame) handleShow();
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
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilterUsersType("highestAvg")}>highestAvg</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("highestRPT")}>highestRPT</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </span>
            <div className="info">
              {dartUsers && dartUsers.map((dartUser) => {
                return (
                  <div key={dartUser.id} className="element">
                    <span className="elementInfo username">{dartUser.displayName}</span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["firstPlace"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["secondPlace"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["thirdPlace"]}
                    </span>
                    <MyTooltip title="Games played" className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                      {dartUser.gamesPlayed}
                    </MyTooltip>
                    <MyTooltip title="Doors hit" className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                      {dartUser.throws["doors"]}
                    </MyTooltip>
                    <MyTooltip title="Your highest Points Average" className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/arcade/20/graph.png" alt="graph" />
                      <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                    </MyTooltip>
                    <MyTooltip title="Your highest Round Points Thrown" className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/20/mountain.png" alt="mountain" />
                      <h6 style={{ fontSize: 13 }}>{dartUser.highestRoundPoints}</h6>
                    </MyTooltip>
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
                  <Dropdown.Item onClick={() => setFilterGamesType("created_at")}>Created At</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterUsersType("most_users")}>Most Users</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </span>
            <div className="info">
              {games && games.map((game) => {
                return (
                  game.active ?
                    <div key={game.id} className="element">
                      <span className="elementInfo gameActive">
                        {game.active ? 'Active' : 'Ended'}
                        <img src={game.active ? GreenDot : RedDot} />
                      </span>
                      {game.users[0] && <span className="elementInfo">
                        <h6>{game.users[0].displayName}</h6>
                        <h6>{game.users[0].points}</h6>
                      </span>}
                      {game.users[1] && <span className="elementInfo">
                        <h6>{game.users[1].displayName}</h6>
                        <h6>{game.users[1].points}</h6>
                      </span>}
                      {game.users[2] && <span className="elementInfo">
                        <h6>{game.users[2].displayName}</h6>
                        <h6>{game.users[2].points}</h6>
                      </span>}
                      <span className="usersCount position-absolute end-0">
                        <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                        {game.users.length}
                      </span>
                      <span className="timedate">{new Date(game.created_at).toLocaleString()}</span>
                    </div>
                    :
                    <div key={game.id} className="element">
                      <span className="elementInfo gameActive">
                        {game.active ? 'Active' : 'Ended'}
                        <img src={game.active ? GreenDot : RedDot} />
                      </span>
                      <span className="elementInfo">
                        <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[1]}
                      </span>
                      {game.podium[2] && <span className="elementInfo">
                        <img width="20" height="20" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[2]}
                      </span>}
                      {game.podium[3] && <span className="elementInfo">
                        <img width="20" height="20" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                        {game.podium[3]}
                      </span>}
                      <span className="elementInfo usersCount position-absolute end-0">
                        <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                        {game.users.length}
                      </span>
                      <span className="timedate">{new Date(game.created_at).toLocaleString()}</span>
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
        <CreateGame show={show} setShow={setShow} />
      </div>
      <MyToasts />
    </>
  )
}

export default DartsPage