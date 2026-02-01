import { deleteDartsGame } from "@/lib/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { useContext } from "react";
import { DartsGameContext } from "@/context/Home/DartsGameContext";
import { socket } from "@/lib/socketio";
import { endGame } from "@/lib/dartsGameSocket";
import { isInitialGameState } from '@/lib/recordUtils';

function Keyboard({ props }) {
  const { game, handleRound, specialState, updateGameState } = useContext(DartsGameContext);
  const { handleShow } = props;

  const handleClick = (value) => {
    handleRound(value, handleShow);
  }

  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => handleClick(i)}>{i}</button>);

  const handleEndTraining = async () => {
    const updatedGame = { ...game };
    updatedGame.podium[1] = game.turn;
    updatedGame.active = false;
    
    if (game._id) {
      await deleteDartsGame(game._id);
    }
    
    await endGame(game.gameCode, updatedGame);
  }

  const handleQuit = async () => {
    const updatedGame = { ...game };
    updatedGame.active = false;
    updatedGame.podium[1] = null; 
    
    if (game._id) {
      await deleteDartsGame(game._id);
    }
    
    await endGame(game.gameCode, updatedGame);
  }

  const handleDisabledSpecial = (type) => {
    if (type === 'DOORS') {
      return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE';
    } else if (type === 'DOUBLE') {
      return specialState[1] === 'TRIPLE';
    } else if (type === 'TRIPLE') {
      return specialState[1] === 'DOUBLE';
    } else if (type === 'BACK') {
      return specialState[1] === 'DOUBLE' || specialState[1] === 'TRIPLE' || isInitialGameState(game);
    }
    return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE' || specialState[1] === type;
  };

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
        {isInitialGameState(game) && <Button className="input special" disabled={handleDisabledSpecial()} style={{ backgroundColor: '#E55555' }} onClick={handleQuit}>QUIT</Button>}
      </span>
    </div>
  )
}

export default Keyboard