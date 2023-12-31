import { useEffect, useState } from "react";
import CreateGame from "../components/Darts/CreateGame";
import NavBar from "../components/NavBar"
import { Button } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import RedDot from "../images/red_dot.png";
import GreenDot from "../images/green_dot.png";

function DartsPage() {
  document.title = "HomeServer | Darts";

  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [games, setGames] = useState([]);
  const [dartUsers, setDartUsers] = useState([]);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }

  useEffect(() => {
    const getGames = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartGames'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
    }
    const getDartUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartUsers'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDartUsers(gamesData);
    }
    getDartUsers();
    getGames();
  }, []);

  // useEffect(() => {
  //   console.log(games)
  // }, [games]);

  return (
    <>
      <NavBar />
      <div className="darts-page">
        <Button variant="outline-info" onClick={handleShow}>Create</Button>
        <div className="cards">
          <div className="games">
            <h3>Games</h3>
            <div className="info">
              {games && games.map((game) => {
                return (
                game.active ? 
                  <div key={game.id} className="element">
                    <span className="gameActive">
                      {game.active ? 'In Progress' : 'Ended'}
                      <img src={game.active ? GreenDot : RedDot}/>
                    </span>
                  </div>
                :
                <div key={game.id} className="element">
                  <span className="username">{game.userWon.displayName}</span>
                </div>
                )
              })}
            </div>
          </div>
          <div className="statistics">
            <h3>Statistics</h3>
            <div className="info">
            {dartUsers && dartUsers.map((dartUser) => {
                return (
                <div key={dartUser.id} className="element">
                  <span className="username">{dartUser.displayName}</span>
                  <span className="gamesWon">
                    {dartUser.podiums["firstPlace"]}
                    <img width="20" height="20" src="https://img.icons8.com/color/20/trophy.png" alt="trophy"/>
                  </span>
                </div>
                )
              })}
            </div>
          </div>
          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <div className="info">
              <div>asdf</div>
            </div>
          </div>
        </div>
        <CreateGame show={show} fullscreen={fullscreen} setShow={setShow}/>
      </div>
    </>
  )
}

export default DartsPage