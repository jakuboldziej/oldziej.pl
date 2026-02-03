import { useContext, useEffect, useState } from "react";
import CreateGame from "@/components/Home/Darts/CreatingGame/CreateGame";
import { useLocation } from "react-router";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import { getAuthUser, getDartsGames, getDartsUser, getStatisticsDartsGames, getStatisticsDoorHits, getStatisticsOverAllPoints } from "@/lib/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast";
import { AuthContext } from "@/context/Home/AuthContext";
import { ensureGameRecord } from '@/lib/recordUtils';
import { Link } from "react-router-dom";
import Loading from "@/components/Home/Loading";
import DartsGamesList from "@/components/Home/Darts/DartsGamesList";
import { socket } from '@/lib/socketio';

function DartsPage() {
  document.title = "Oldziej | Darts";
  const { currentUser } = useContext(AuthContext);

  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [playerInGame, setPlayerInGame] = useState(false);
  const [games, setGames] = useState([]);
  const [gamesShown, setGamesShown] = useState([]);
  const [dartUsers, setDartUsers] = useState([]);
  const [filterUsersType, setFilterUsersType] = useState("firstPlace");
  const [filterGamesType, setFilterGamesType] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dartsStatistics, setDartsStatistics] = useState(null);

  const handleShow = () => {
    if (!playerInGame) {
      setDrawerOpen(true);
    } else {
      ShowNewToast("Live game going", "You are already in a game <a class='underline text-white' href='/darts/game'>Join Game</a>");
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
      if (!isLoading) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
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
    socket.on("gameCreated", (data) => {
      const { game, userDisplayNames } = JSON.parse(data);

      if (userDisplayNames.includes(currentUser.displayName)) {
        getDartsGames(currentUser.displayName, 10).then(fetchedGames => {
          const sortedGames = handleFilterGames(filterGamesType, fetchedGames);
          setGamesShown(sortedGames);
        });

        const gameWithRecord = ensureGameRecord(game);

        setPlayerInGame(true);
        localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));

        if (game.created_by !== currentUser.displayName) {
          ShowNewToast("New Game Created", `A new game has been created: <a class='underline text-white' href='/darts/game'>Join Game</a>`);
        }
      }
    });

    socket.on("gameEnded", (data) => {
      const { gameCode: endedGameCode, userDisplayNames } = JSON.parse(data);

      if (userDisplayNames.includes(currentUser.displayName)) {
        getDartsGames(currentUser.displayName, 10).then(fetchedGames => {
          const sortedGames = handleFilterGames(filterGamesType, fetchedGames);
          setGamesShown(sortedGames);
        });

        const storedGame = localStorage.getItem('dartsGame');
        if (storedGame && storedGame !== 'null') {
          try {
            const currentGame = JSON.parse(storedGame);
            if (currentGame?.gameCode === endedGameCode) {
              setPlayerInGame(false);
              localStorage.setItem('dartsGame', null);
            }
          } catch (e) {
          }
        } else {
          setPlayerInGame(false);
        }
      }
    });

    let isMounted = true;

    const fetchData = async () => {
      try {
        const fetchedGames = handleFilterGames(filterUsersType, await getDartsGames(currentUser.displayName, 10));
        if (!isMounted) return;

        let fetchAuthUser = await getAuthUser(currentUser.displayName);
        let fetchDartsUser = await getDartsUser(currentUser.displayName);
        const fetchAuthUserFriends = fetchAuthUser.friends.map(async (friendsDisplayName) => {
          const fetchDartsUser = await getDartsUser(friendsDisplayName);
          return fetchDartsUser;
        });

        const userFriends = (await Promise.all(fetchAuthUserFriends)).filter((friend) => friend.visible === true);
        if (!isMounted) return;

        const sortedUsers = handleFilterUsers(filterUsersType, [...userFriends, fetchDartsUser]);

        setDartUsers(sortedUsers);
        setGamesShown(fetchedGames);

        const gamesPlayed = await getStatisticsDartsGames();
        const overAllPoints = await getStatisticsOverAllPoints();
        const doorHits = await getStatisticsDoorHits();
        if (!isMounted) return;

        setDartsStatistics({
          gamesPlayed: gamesPlayed,
          overAllPoints: overAllPoints,
          doorHits: doorHits
        });

        const activeGames = await getDartsGames(currentUser.displayName, 0, null);
        if (!isMounted) return;

        const playerActiveGame = activeGames.find(game =>
          game.active === true &&
          game.users.some(user => user.displayName === currentUser.displayName)
        );

        if (playerActiveGame) {
          localStorage.setItem('dartsGame', JSON.stringify(playerActiveGame));
          setPlayerInGame(true);
          if (isMounted) {
            ShowNewToast("Live game going", "You are already in a game <a class='underline text-white' href='/darts/game'>Join Game</a>");
          }
        } else {
          const storedGame = localStorage.getItem('dartsGame');
          if (!storedGame || storedGame === 'null') {
            setPlayerInGame(false);
          } else {
            try {
              const parsedGame = JSON.parse(storedGame);
              if (parsedGame?.active) {
                setPlayerInGame(true);
              } else {
                setPlayerInGame(false);
                localStorage.setItem('dartsGame', null);
              }
            } catch (e) {
              setPlayerInGame(false);
              localStorage.setItem('dartsGame', null);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching', err);
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();

    // Create New Game Auto
    const params = location.state;
    if (params && params.createNewGame) handleShow();

    return () => {
      isMounted = false;
      socket.off("gameCreated");
      socket.off("gameEnded");
    };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      const fetchedGames = handleFilterGames(filterUsersType, await getDartsGames(currentUser.displayName));
      setGames(fetchedGames);
    }
    if (gamesShown.length === 10) fetchAllData();
  }, [gamesShown]);

  return (
    <div className="darts-page">
      <div className="flex justify-center">
        <CreateGame drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
          <Button
            variant="outline_red"
            className="glow-button-red"
            onClick={(e) => {
              e.currentTarget.blur();
              setDrawerOpen(true);
            }}
          >
            Create
          </Button>
        </CreateGame>
      </div>
      <div className="cards">
        <Card className="my-card friends">
          <CardHeader>
            <CardTitle><Link to="/user/friends" className="hover:cursor-pointer hover:opacity-80">Leaderboard</Link></CardTitle>
          </CardHeader>
          <CardContent className="info p-0">
            {isLoading ? (
              <Loading />
            )
              : dartUsers.map((dartUser) => (
                <a href={`/darts/users/${dartUser.displayName}`} key={dartUser._id} className="element">
                  <span className="elementInfo username">{dartUser.displayName}</span>
                  <span className="elementInfo">
                    <img width="25" height="25" src="https://img.icons8.com/color/25/first-place-ribbon.png" alt="first-place-ribbon" />
                    {dartUser.podiums["firstPlace"]}
                  </span>
                  <span className="elementInfo">
                    <img width="25" height="25" src="https://img.icons8.com/color/25/second-place-ribbon.png" alt="first-place-ribbon" />
                    {dartUser.podiums["secondPlace"]}
                  </span>
                  <span className="elementInfo">
                    <img width="25" height="25" src="https://img.icons8.com/color/25/third-place-ribbon.png" alt="first-place-ribbon" />
                    {dartUser.podiums["thirdPlace"]}
                  </span>
                  <MyTooltip title="Doors Hit">
                    <span className="elementInfo">
                      <img width="25" height="25" src="https://img.icons8.com/officel/25/door.png" alt="door" />
                      {dartUser.throws["doors"]}
                    </span>
                  </MyTooltip>
                  <MyTooltip title="Games Played">
                    <span className="elementInfo">
                      <img width="25" height="25" src="https://img.icons8.com/color/25/goal--v1.png" alt="goal--v1" />
                      {dartUser.gamesPlayed}
                    </span>
                  </MyTooltip>
                  <MyTooltip title="Highest Ending Average">
                    <span className="elementInfo">
                      <img width="25" height="25" src="https://img.icons8.com/arcade/25/graph.png" alt="graph" />
                      <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                    </span>
                  </MyTooltip>
                  <MyTooltip title="Highest Turn Points">
                    <span className="elementInfo">
                      <img width="25" height="25" src="https://img.icons8.com/color/25/mountain.png" alt="mountain" />
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
              ))}
          </CardContent>
        </Card>
        <Card className="my-card games">
          <CardHeader>
            <CardTitle>Games ({gamesShown.length})</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[600px]" onScroll={handleScroll}>
            <CardContent className="info p-0 pr-3">
              {isLoading ? (
                <Loading />
              ) : gamesShown.length > 0 ? (
                <DartsGamesList games={gamesShown} isLoading={false} />
              ) : (
                <span className="text-lg text-center">Play some games!</span>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
        <Card className="my-card statistics">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center flex-wrap gap-5">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="text-center">
                  <span>We've played</span>
                  <span className="font-bold">{dartsStatistics?.gamesPlayed || 0}</span>
                  <span>games</span>
                </div>
                <div>
                  <span>We scored</span>
                  <span className="font-bold">{dartsStatistics?.overAllPoints || 0}</span>
                  <span>points</span>
                </div>
                <div className="text-center">
                  <span>We threw</span>
                  <span className="font-bold">{dartsStatistics?.doorHits || 0}</span>
                  <span>darts at the door</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DartsPage