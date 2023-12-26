import { useContext, useEffect, useState } from "react";
import CreateGame from "../components/Darts/CreateGame";
import NavBar from "../components/NavBar"
import { Button } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function DartsPage() {
  document.title = "HomeServer | Darts";

  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [games, setGames] = useState([]);

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
    getGames();
  }, []);

  useEffect(() => {
    console.log(games)
  }, [games]);

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
                return (<div key={game.id} className="element">game</div>)
              })}
            </div>
          </div>
          <div className="statistics">
            <h3>Statistics</h3>
            <div className="info">
              <div className="element"></div>
            </div>
          </div>
          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <div className="info">
              <div>asdf</div>
            </div>
          </div>
        </div>
      </div>
      <CreateGame show={show} fullscreen={fullscreen} setShow={setShow}/>
    </>
  )
}

export default DartsPage