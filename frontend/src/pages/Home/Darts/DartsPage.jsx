import { useEffect, useState } from "react";
import CreateGame from "@/components/Home/Darts/CreateGame";
import NavBar from "@/components/Home/NavBar";
import RedDot from "@/assets//images/icons/red_dot.png";
import GreenDot from "@/assets//images/icons/green_dot.png";
import { useLocation } from "react-router";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import { getDartsGames, getDartsUsers } from "@/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip";

function DartsPage() {
  document.title = "Oldziej | Darts";

  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
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
      setDrawerOpen(true);
    } else {
      ShowNewToast("Live game going", "You are already in a game <a class='underline text-white' href='/darts/game'>Live Game</a>");
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
          const firstData = a.highestTurnPoints;
          const secondData = b.highestTurnPoints;
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
    const liveGame = JSON.parse(localStorage.getItem('dartsGame'));
    if (liveGame !== null) {
      setPlayerInGame(true);
      ShowNewToast("Live game going", "You are already in a game <a class='underline text-white' href='/darts/game'>Live Game</a>");
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
          <CreateGame drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
            <Button variant="outline_red" className="glow-button-red" onClick={() => setDrawerOpen(true)}>Create</Button>
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
            <CardContent className="info p-0">
              {isLoading ? <div className="flex justify-center w-100 pt-3">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
                : dartUsers && dartUsers.map((dartUser) => {
                  return (
                    <a href={`/darts/users/${dartUser.displayName}`} key={dartUser._id} className="element">
                      <span className="elementInfo username">{dartUser.displayName}</span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                        {dartUser.podiums["firstPlace"]}
                      </span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                        {dartUser.podiums["secondPlace"]}
                      </span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                        {dartUser.podiums["thirdPlace"]}
                      </span>
                      <MyTooltip title="Doors Hit">
                        <span className="elementInfo">
                          <img width="25" height="25" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                          {dartUser.throws["doors"]}
                        </span>
                      </MyTooltip>
                      <MyTooltip title="Games Played">
                        <span className="elementInfo">
                          <img width="25" height="25" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                          {dartUser.gamesPlayed}
                        </span>
                      </MyTooltip>
                      <MyTooltip title="Highest Ending Average">
                        <span className="elementInfo">
                          <img width="25" height="25" src="https://img.icons8.com/arcade/20/graph.png" alt="graph" />
                          <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                        </span>
                      </MyTooltip>
                      <MyTooltip title="Highest Turn Points">
                        <span className="elementInfo">
                          <img width="25" height="25" src="https://img.icons8.com/color/20/mountain.png" alt="mountain" />
                          <h6 style={{ fontSize: 13 }}>{dartUser.highestTurnPoints}</h6>
                        </span>
                      </MyTooltip>
                      <MyTooltip title="Highest Checkout">
                        <span className="elementInfo">
                          <img width="25" height="25" src="https://img.icons8.com/color/25/cash-register.png" alt="cash-register" />
                          <h6 style={{ fontSize: 13 }}>{dartUser.highestCheckout}</h6>
                        </span>
                      </MyTooltip>
                    </a>
                  )
                })}
            </CardContent>
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
              <CardContent className="info p-0 pr-3">
                {isLoading ? <div className="flex justify-center w-100 pt-3">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                  : gamesShown && gamesShown.map((game) => {
                    return (
                      game.active ?
                        <div key={game._id} className="element">
                          <MyTooltip title="Game Active">
                            <span className="elementInfo gameActive">
                              <img src={game.active ? GreenDot : RedDot} />
                            </span>
                          </MyTooltip>
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
                          <MyTooltip title="Game mode">
                            <span className="elementInfo">
                              <img width="25" height="25" src="https://img.icons8.com/office/25/controller.png" alt="controller" />
                              <span className="text-sm text-center">{game.gameMode}</span>
                            </span>
                          </MyTooltip>
                          <MyTooltip title="Start Points">
                            <span className="elementInfo">
                              <img width="25" height="25" src="https://img.icons8.com/ios-filled/20/finish-flag.png" alt="finish-flag" />
                              {game.startPoints}
                            </span>
                          </MyTooltip>
                          <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
                            <span className="elementInfo usersCount absolute right-0">
                              <img width="25" height="25" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                              {game.users.length}
                            </span>
                          </MyTooltip>
                          <span className="timedate">{new Date(game.created_at).toLocaleDateString()}</span>
                        </div>
                        :
                        <div key={game._id} className="element">
                          <MyTooltip title="Game Ended">
                            <span className="elementInfo gameActive">
                              <img src={game.active ? GreenDot : RedDot} />
                            </span>
                          </MyTooltip>
                          <span className="elementInfo">
                            <img width="25" height="25" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                            {game.podium[1]}
                          </span>
                          {game.podium[2] && <span className="elementInfo">
                            <img width="25" height="25" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
                            {game.podium[2]}
                          </span>}
                          {game.podium[3] && <span className="elementInfo">
                            <img width="25" height="25" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
                            {game.podium[3]}
                          </span>}
                          <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
                            <span className="elementInfo usersCount absolute right-1">
                              <img width="25" height="25" src="https://img.icons8.com/pastel-glyph/20/person-male--v3.png" alt="person-male--v3" />
                              {game.users.length}
                            </span>
                          </MyTooltip>
                          <MyTooltip title="Game mode">
                            <span className="elementInfo">
                              <img width="25" height="25" src="https://img.icons8.com/office/25/controller.png" alt="controller" />
                              <span className="text-sm text-center">{game.gameMode}</span>
                            </span>
                          </MyTooltip>
                          <MyTooltip title="Start Points">
                            <span className="elementInfo">
                              <img width="25" height="25" src="https://img.icons8.com/ios-filled/20/finish-flag.png" alt="finish-flag" />
                              {game.startPoints}
                            </span>
                          </MyTooltip>
                          <MyTooltip title={new Date(game.created_at).toLocaleString()}>
                            <span className="timedate">{new Date(game.created_at).toLocaleDateString()}</span>
                          </MyTooltip>
                        </div>
                    )
                  })}
              </CardContent>
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
    </>
  )
}

export default DartsPage