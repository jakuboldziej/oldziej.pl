import { useContext, useEffect, useRef, useState } from "react"
import { DartsGameContext } from "../../context/DartsGameContext"
import Keyboard from "./Keyboard";
import RedDot from "../../images/red_dot.png";
import GreenDot from "../../images/green_dot.png";
import GameSummary from "./GameSummary";
import { handleRound, totalThrows } from "./utils";
import { Link } from "react-router-dom";
import MyAccordion from "../MyComponents/MyAccordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { buttonVariants } from "../ui/button";
import UserDataTable from "./UserDataTable";
import ShowNewToast from "../MyComponents/ShowNewToast";

function DartsGame() {
  const [show, setShow] = useState(false);

  function handleShow(breakpoint) {
    setShow(true);
  }

  const { game } = useContext(DartsGameContext);

  if (!game) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-4xl">You are not currently in a game.</span>
        <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} to="/darts">Create New One</Link>
      </div>
    )
  }

  const [users, setUsers] = useState(game?.users || null);
  const [specialState, setSpecialState] = useState([false, ""]);
  const [overthrow, setOverthrow] = useState(false);

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

  const usersContainerRef = useRef(null);

  useEffect(() => {
    const userWithTurn = users.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn._id}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    if (game) {
      game.users = users;
      localStorage.setItem('dartsGame', JSON.stringify(game));
    }
  }, [users, game.turn]);

  useEffect(() => {
    if (!game?.active) {
      localStorage.setItem('dartsGame', null);
    }
  }, [game?.active]);

  const keyboardParams = { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState, ShowNewToast, setOverthrow }

  const userDynamicStyle = (user) => {
    return {
      borderLeft: `17px solid ${user.turn ? '#E00000' : '#FFF'}`,
      backgroundColor: `${user.points === 0 ? 'gold' : '#00B524'}`,
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
          {users.map((user) => (
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
                  <TableCell colSpan={2}>Ø {user.avgPointsPerThrow}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ))}
        </div>
      </div>
      <div className="right-panel">
        <MyAccordion>
          <UserDataTable users={users} game={game} />
        </MyAccordion>
        {game.training && <span className="text-white fs-2 text-center">Training</span>}
        <Keyboard params={keyboardParams} />
      </div>
      <GameSummary show={show} setShow={setShow} />
    </div>
  )
}

export default DartsGame