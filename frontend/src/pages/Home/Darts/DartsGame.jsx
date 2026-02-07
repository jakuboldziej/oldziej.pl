import { useContext, useEffect, useRef, useState } from "react";
import { DartsGameContext } from "@/context/Home/DartsGameContext";
import Keyboard from "@/components/Home/Darts/Keyboard";
import GameSummary from "@/components/Home/Darts/GameSummary";
import { totalThrows } from "@/components/Home/Darts/utils/userUtils";
import { Link } from "react-router-dom";
import MyAccordion from "@/components/Home/MyComponents/MyAccordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";
import { buttonVariants } from "@/components/ui/shadcn/button";
import UserDataTable from "@/components/Home/Darts/UserDataTable";
import CopyTextButton from "@/components/Home/CopyTextButton";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import { Copy } from "lucide-react";
import { socket } from "@/lib/socketio";
import MostCommonCheckout from "@/components/Home/Darts/MostCommonCheckout";
import NumberTicker from "@/components/ui/magicui/number-ticker";

function DartsGame() {
  document.title = "Oldziej | Darts Game";
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { game, overthrow, setOverthrow, setHandleShow } = useContext(DartsGameContext);

  // Scroll to user
  const usersContainerRef = useRef(null);

  function handleShow() {
    setShow(true);
  }

  useEffect(() => {
    if (setHandleShow) {
      setHandleShow(handleShow);
    }
  }, [setHandleShow]);

  useEffect(() => {
    if (game?.active) {
      setShow(false);
    }
  }, [game?.active]);

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

  useEffect(() => {
    const userWithTurn = game?.users?.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn._id}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [game?.users, game?.turn]);

  const hasJoinedRoomRef = useRef(false);
  const hasAttemptedRecovery = useRef(false);

  useEffect(() => {
    if (game && !game.active) {
      setShow(true);
      setIsLoading(false);
      return;
    }

    if (!game) {
      hasJoinedRoomRef.current = false;

      if (!hasAttemptedRecovery.current) {
        hasAttemptedRecovery.current = true;
        const storedGame = localStorage.getItem('dartsGame');
        if (storedGame && storedGame !== 'null') {
          try {
            const parsedGame = JSON.parse(storedGame);
            if (parsedGame && parsedGame._id) {
              return;
            }
          } catch (e) {
          }
        }
      }

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    hasAttemptedRecovery.current = false;
    setIsLoading(false);

    if (!hasJoinedRoomRef.current) {
      hasJoinedRoomRef.current = true;
      socket.emit("joinLiveGamePreview", JSON.stringify({
        gameCode: game.gameCode
      }));
    }
  }, [game]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-2xl">Loading game...</span>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-4xl text-center">You are not currently in a game.</span>
        <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts">Create New One</Link>
      </div>
    )
  }

  const keyboardProps = { handleShow }

  const userDynamicStyle = (user) => {
    return {
      borderLeft: `17px solid ${user.turn ? '#E00000' : '#FFF'}`,
      backgroundColor: `${game.userWon === user.displayName ? 'gold' : '#00B524'}`,
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
          <h5 style={{ color: '#E00000' }}>L: {game.legs}</h5>
          <h2 style={{ color: '#E00000' }}>Turn: {game.turn}</h2>
          <h5 style={{ color: '#E00000' }}>S: {game.sets}</h5>
          <h2 className="hidden sm:block">{game?.checkOut}</h2>
        </div>
        <div className="users" ref={usersContainerRef}>
          {game.users.map((user, index) => (
            <Table className="user" data-userid={user._id} key={user._id || `user-${index}-${user.displayName}`} style={userDynamicStyle(user)}>
              <TableHeader>
                <TableRow>
                  <TableHead className="relative w-[33%]">
                    <NumberTicker
                      stiffness={300}
                      startValue={parseInt(game.startPoints)}
                      value={parseInt(user.points)}
                      className="font-bold"
                    />
                    <span className="darts-thrown">
                      <img width="12" height="12" src="https://img.icons8.com/external-kosonicon-solid-kosonicon/12/external-dart-sports-equipment-kosonicon-solid-kosonicon.png" alt="external-dart-sports-equipment-kosonicon-solid-kosonicon" />
                      {totalThrows(user)}
                    </span>
                  </TableHead>
                  {Object.entries(user.turns).map((turn, index) => {
                    return (<TableHead className="turn font-bold" key={turn[0]}>
                      {turn[1]}
                    </TableHead>);
                  })}
                  <TableHead className="legs w-[16%]">
                    {user.legs}
                    <span className="SL">L</span>
                  </TableHead>
                  <TableHead className="sets  w-[16%]">
                    {user.sets}
                    <span className="SL">S</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell colSpan={3}>{user.turnsSum}</TableCell>
                  <TableCell colSpan={2}>Ø {user.avgPointsPerTurn}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ))}
        </div>
      </div>
      <div className="right-panel">
        <MyAccordion title={`Live Data (${game.gameMode}) ${game.training === true ? "(Training)" : ""}`}>
          <UserDataTable users={game.users} game={game} />
        </MyAccordion>
        <span className="text-white text-xs sm:text-base text-center flex flex-row justify-center items-center gap-1 sm:gap-2">
          <span>{game.training === true ? "Training" : ""}</span>
          <Link
            to={`/darts/game/live?gameCode=${game.gameCode}`}
            target="_blank"
            className="text-red-600 hover:text-red-400"
          >
            Live Game
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Code:</span> {game.gameCode}
            <CopyTextButton textToCopy={game.gameCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
              <MyTooltip title="Copy code to clipboard">
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </MyTooltip>
            </CopyTextButton>
          </div>
        </span>
        <div className="w-full">
          <MostCommonCheckout users={game.users} game={game} compact={true} />
        </div>
        <Keyboard props={keyboardProps} />
      </div>

      <GameSummary show={show} setShow={setShow} />
    </div>
  )
}

export default DartsGame