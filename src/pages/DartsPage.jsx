import { useState } from "react";
import CreateGame from "../components/Darts/CreateGame";
import NavBar from "../components/NavBar"
import { Button } from "react-bootstrap";

function DartsPage() {
  document.title = "HomeServer | Darts";

  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }

  return (
    <>
      <NavBar />
      <div className="darts-page">
        <Button variant="outline-info" onClick={handleShow}>Start</Button>
        <div className="cards">
          <div className="games">
            <h3>Games</h3>
            <div className="info">
              <div className="element"></div>
              <div className="element"></div>
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