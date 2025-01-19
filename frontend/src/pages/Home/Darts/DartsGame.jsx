import { useContext, useEffect, useRef, useState } from "react";
import { DartsGameContext } from "@/context/Home/DartsGameContext";
import Keyboard from "@/components/Home/Darts/Keyboard";
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";
import GameSummary from "@/components/Home/Darts/GameSummary";
import { totalThrows } from "@/components/Home/Darts/game logic/userUtils";
import { Link } from "react-router-dom";
import MyAccordion from "@/components/Home/MyComponents/MyAccordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";
import { buttonVariants } from "@/components/ui/shadcn/button";
import UserDataTable from "@/components/Home/Darts/UserDataTable";
import CopyTextButton from "@/components/Home/CopyTextButton";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import { Copy } from "lucide-react";
import { socket } from "@/lib/socketio";

function DartsGame() {
  document.title = "Oldziej | Darts Game";
  const [show, setShow] = useState(false);

  function handleShow() {
    setShow(true);
  }

  const { game, overthrow, setOverthrow } = useContext(DartsGameContext);

  if (!game) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-4xl text-center">You are not currently in a game.</span>
        <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewGame: true }} to="/darts">Create New One</Link>
      </div>
    )
  }

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

  // Scroll to user
  const usersContainerRef = useRef(null);

  useEffect(() => {
    const userWithTurn = game.users.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn._id}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [game.users, game.turn]);

  useEffect(() => {
    if (!game?.active) setShow(true);

    if (!game) return;

    socket.emit("joinLiveGamePreview", JSON.stringify({
      gameCode: game.gameCode
    }));
    socket.emit("updateLiveGamePreview", JSON.stringify(game));
  }, []);

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
          <h2><img src={game.active ? GreenDot : RedDot} /></h2>
        </div>
        <div className="users" ref={usersContainerRef}>
          {game.users.map((user) => (
            <Table className="user" data-userid={user._id} key={user._id} style={userDynamicStyle(user)}>
              <TableHeader>
                <TableRow>
                  <TableHead className="relative w-[33%]">
                    <span className="font-bold">{user.points}</span>
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
        <MyAccordion title={`Live Data (${game.gameMode})`}>
          <UserDataTable users={game.users} game={game} />
        </MyAccordion>
        {game.training ? (
          <span className="text-white fs-2 text-center">Training</span>
        ) : (
          <span className="text-white fs-2 text-center flex justify-center gap-2">
            <Link to="/darts/game/live" target="_blank" className="text-red-600 hover:text-red-400">Live Game</Link>
            <div className="flex items-center">
              Code: {game.gameCode}
              <CopyTextButton textToCopy={game.gameCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
                <MyTooltip title="Copy code to clipboard">
                  <Copy height={15} />
                </MyTooltip>
              </CopyTextButton>
            </div>
          </span>
        )}
        <Keyboard props={keyboardProps} />
      </div>

      <GameSummary show={show} setShow={setShow} />
    </div>
  )
}

export default DartsGame