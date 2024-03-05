import { useContext, useEffect, useState } from "react";
import CreateGame from "../components/Darts/CreateGame";
import NavBar from "../components/NavBar"
import RedDot from "../images/red_dot.png";
import GreenDot from "../images/green_dot.png";
import { ToastsContext } from "../context/ToastsContext";
import MyToasts from "../components/MyComponents/MyToasts";
import { useLocation } from "react-router";
import MyTooltip from "../components/MyComponents/MyTooltip";
import { getDartsGames, getDartsUsers } from "../fetch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

function DartsPage() {
  document.title = "Oldziej | Darts";

  const location = useLocation();

  const { showNewToast } = useContext(ToastsContext);

  const [show, setShow] = useState(false);
  const [playerInGame, setPlayerInGame] = useState(false);
  const [games, setGames] = useState([]);
  const [gamesShown, setGamesShown] = useState([]);
  const [dartUsers, setDartUsers] = useState([]);
  const [filterUsersType, setFilterUsersType] = useState("firstPlace");
  const [filterGamesType, setFilterGamesType] = useState("created_at");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const handleShow = () => {
    if (!playerInGame) {
      setShow(true);
    } else {
      showNewToast("Live game going", "You are already in a game <a href='/darts/game' class='mx-2 btn btn-outline-danger'>Live Game</a>");
    }
  }

  const handleFilterUsers = (action, users) => {
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

  const handleFilterGames = (action, gamesToFilter) => {
    let sortedGames;

    switch (action) {
      case "created_at":
        sortedGames = gamesToFilter.slice().sort((a, b) => {
          const firstData = a.created_at;
          const secondData = b.created_at;
          return secondData - firstData;
        });
        break;
      case "most_users":
        sortedGames = gamesToFilter.slice().sort((a, b) => {
          const firstData = a.users.length;
          const secondData = b.users.length;
          return secondData - firstData;
        });
        break;
      default:
        sortedGames = gamesToFilter.slice();
        break;
    }

    return sortedGames;
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      // Reached near the end, load more data
      if (games.length > 0) setCurrentPage(currentPage + 1);
    }
  };

  const handleGamesShown = (type, amount) => {
    let gamesAmount;
    if (type === "scroll") gamesAmount = games.slice(0, 10 * currentPage);
    else if (type === "filter") {
      gamesAmount = games.slice(0, amount)
    }

    setGamesShown(gamesAmount);
  };

  useEffect(() => {
    const sortedUsers = handleFilterUsers(filterUsersType, dartUsers);
    setDartUsers(sortedUsers);
  }, [filterUsersType]);

  useEffect(() => {
    const sortedGames = handleFilterGames(filterGamesType, gamesShown);
    setGamesShown(sortedGames);
  }, [filterGamesType]);

  useEffect(() => {
    // Infinite Scroll
    handleGamesShown("scroll")
  }, [currentPage]);


  useEffect(() => {
    const fetchFirstData = async () => {
      try {
        const fetchedGames = handleFilterGames(filterUsersType, await getDartsGames(null, 10));
        const sortedUsers = handleFilterUsers(filterUsersType, await getDartsUsers());
        setDartUsers(sortedUsers);
        setGamesShown(fetchedGames);
        setIsLoading(false);
      } catch (err) {
        console.log("Error fetching", err);
        setIsLoading(false);
      }
    }
    fetchFirstData();

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

  useEffect(() => {
    const fetchAllData = async () => {
      const fetchedGames = handleFilterGames(filterUsersType, await getDartsGames());
      setGames(fetchedGames);
    }
    if (gamesShown.length === 10) {
      fetchAllData()
    }
  }, [gamesShown]);

  return (
    <>
      <NavBar />
      <div className="darts-page">
        <div className="flex justify-center">
          <CreateGame>
            <Button variant="outline_red" className="glow-button-red">Create</Button>
          </CreateGame>
        </div>
        <div className="cards">
          <Card className="my-card leaderboard">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              {/* <Dropdown data-bs-theme="dark">
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
              </Dropdown> */}
            </CardHeader>
            <div className="info">
              {dartUsers && dartUsers.map((dartUser) => {
                return (
                  <a href={`/darts/users/${dartUser.displayName}`} key={dartUser._id} className="element">
                    <span className="elementInfo username">{dartUser.displayName}</span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["firstPlace"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                      {dartUser.throws["doors"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                      {dartUser.gamesPlayed}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/arcade/20/graph.png" alt="graph" />
                      <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                    </span>
                  </a>
                )
              })}
            </div>
          </Card>
          <Card className="my-card games">
            <CardHeader>
              <CardTitle>Games ({gamesShown.length})</CardTitle>
              {/* <Dropdown data-bs-theme="dark">
                <Dropdown.Toggle className="custom-dropdown-toggle">
                  <span className="background"></span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterGamesType("created_at")}>Created At</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterGamesType("most_users")}>Most Users</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item disabled>Games Amount: </Dropdown.Item>
                  <Slider defaultValue={[10]} max={100} step={1} />
                </Dropdown.Menu>
              </Dropdown> */}
            </CardHeader>
            <ScrollArea onScroll={handleScroll}>
            <div className="info" >
              {isLoading && (
                <div className="d-flex justify-content-center mt-5">
                  {/* <MySpinner /> */}
                </div>
              )}
              {gamesShown && gamesShown.map((game) => {
                return (
                  game.active ?
                    <div key={game._id} className="element">
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
                      <MyTooltip title={game.users.map(user => user.displayName).join(', ')} className="elementInfo usersCount position-absolute end-0">
                        <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                        {game.users.length}
                      </MyTooltip>
                      <span className="timedate">{new Date(game.created_at).toLocaleString()}</span>
                    </div>
                    :
                    <div key={game._id} className="element">
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
                      <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
                        <span className="elementInfo usersCount absolute right-0">
                          <img width="20" height="20" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                          {game.users.length}
                        </span>
                      </MyTooltip>
                      <MyTooltip title="Start Points">
                      <span className="elementInfo">
                        <img width="20" height="20" src="https://img.icons8.com/ios-filled/20/finish-flag.png" alt="finish-flag" />
                        {game.startPoints}
                      </span>
                      </MyTooltip>
                      <span className="timedate">{new Date(game.created_at).toLocaleString()}</span>
                    </div>
                )
              })}
            </div>
            </ScrollArea>
          </Card>
          <Card className="my-card statistics">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              {/* <Dropdown data-bs-theme="dark">
                <Dropdown.Toggle className="custom-dropdown-toggle">
                  <span className="background"></span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterGamesType("created_at")}>Created At</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterGamesType("most_users")}>Most Users</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item disabled>Games Amount: </Dropdown.Item>
                  <Slider defaultValue={[10]} max={100} step={1} />
                </Dropdown.Menu>
              </Dropdown> */}
            </CardHeader>
          </Card>
        </div>
      </div>
      <MyToasts />
    </>
  )
}

export default DartsPage