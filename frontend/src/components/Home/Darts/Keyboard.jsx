import { deleteDartsGame } from "@/lib/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { useContext, useEffect } from "react";
import { DartsGameContext } from "@/context/Home/DartsGameContext";
import { socket } from "@/lib/socketio";

function Keyboard({ props }) {
  const { game, handleRound, specialState, currentUser } = useContext(DartsGameContext);
  const { handleShow } = props;

  const handleClick = (value) => {
    handleRound(value, handleShow);
  }

  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => handleClick(i)}>{i}</button>);

  const handleEndTraining = () => {
    game.podium[1] = game.turn;
    handleShow();
  }

  const handleQuit = async () => {
    handleShow();

    if (!game.training) {
      game.active = false;
      socket.emit("updateLiveGamePreview", JSON.stringify(game));
      await deleteDartsGame(game._id);
    }
    localStorage.setItem('dartsGame', null);
  }

  const handleDisabledSpecial = (type) => {
    if (type === 'DOORS') {
      return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE';
    } else if (type === 'DOUBLE') {
      return specialState[1] === 'TRIPLE';
    } else if (type === 'TRIPLE') {
      return specialState[1] === 'DOUBLE';
    } else if (type === 'BACK') {
      return specialState[1] === 'DOUBLE' || specialState[1] === 'TRIPLE' || game.record.length <= 1;
    }
    return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE' || specialState[1] === type;
  };

  useEffect(() => {
    const externalKeyboardInputClient = (data) => {
      const inputData = JSON.parse(data);

      if (inputData === "END") {
        handleEndTraining();
      } else if (inputData === "QUIT") {
        handleQuit();
      } else {
        handleClick(inputData);
      }
    }

    socket.on("externalKeyboardInputClient", externalKeyboardInputClient);

    return () => {
      socket.off("externalKeyboardInputClient", externalKeyboardInputClient);
    }
  }, [game, specialState, currentUser]);

  return (
    <div className="keyboard">
      <span className="numbers">
        {numbers}
        <Button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => handleClick(25)}>25</Button>
        <Button className="input number" disabled={specialState[0]} onClick={() => handleClick(0)}>0</Button>
      </span>
      <span className="specials">
        <Button className="input special" disabled={handleDisabledSpecial('DOORS')} onClick={() => handleClick('DOORS')}>DOORS</Button>
        <Button className="input special" disabled={handleDisabledSpecial('DOUBLE')} style={{ backgroundColor: `${specialState[1] === 'DOUBLE' ? "#c4a100" : "#ffd100"}` }} onClick={() => handleClick('DOUBLE')}>DOUBLE</Button>
        <Button className="input special" disabled={handleDisabledSpecial('TRIPLE')} style={{ backgroundColor: `${specialState[1] === 'TRIPLE' ? "#c96e02" : "#ff8a00"}` }} onClick={() => handleClick('TRIPLE')}>TRIPLE</Button>
        <Button className="input special" disabled={handleDisabledSpecial('BACK')} onClick={() => handleClick('BACK')}>BACK</Button>
        {game.training && <Button className="input special" disabled={handleDisabledSpecial()} style={{ backgroundColor: "#E55555" }} onClick={handleEndTraining}>END</Button>}
        {game.record.length === 1 && <Button className="input special" disabled={handleDisabledSpecial()} style={{ backgroundColor: '#E55555' }} onClick={handleQuit}>QUIT</Button>}
      </span>
    </div>
  )
}

export default Keyboard