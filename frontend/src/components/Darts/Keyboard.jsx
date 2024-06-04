import { deleteDartsGame } from "@/fetch";
import { Button } from "../ui/button";

function Keyboard({ params }) {
  const { handleRound, users, game, setGame, handleShow, setUsers, specialState, setSpecialState, ShowNewToast, setOverthrow } = params;
  const onclick = (param) => {
    handleRound(param, users, game, setGame, handleShow, setUsers, specialState, setSpecialState, ShowNewToast, setOverthrow)
  }
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => onclick(i)}>{i}</button>);

  const handleEndTraining = () => {
    game.podium[1] = game.turn;
    handleShow();
  }

  const handleQuit = async () => {
    if (!game.training) await deleteDartsGame(game._id);
    localStorage.setItem('dartsGame', null);
    handleShow();
  }

  const handleDisabledSpecial = (type) => {
    if (type === 'DOORS') {
      return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE';
    } else if (type === 'DOUBLE') {
      return specialState[1] === 'TRIPLE';
    } else if (type === 'TRIPLE') {
      return specialState[1] === 'DOUBLE';
    } else if (type === 'BACK') {
      return specialState[1] === 'DOUBLE' || specialState[1] === 'TRIPLE';
    }
    return specialState[1] === 'TRIPLE' || specialState[1] === 'DOUBLE' || specialState[1] === type;
  };

  return (
    <>
      <div className="keyboard">
        <span className="numbers">
          {numbers}
          <Button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => onclick(25)}>25</Button>
          <Button className="input number" disabled={specialState[0]} onClick={() => onclick(0)}>0</Button>
        </span>
        <span className="specials">
          <Button className="input special" disabled={handleDisabledSpecial('DOORS')} onClick={() => onclick('DOORS')}>DOORS</Button>
          <Button className="input special" disabled={handleDisabledSpecial('DOUBLE')} style={{ backgroundColor: `${specialState[1] === 'DOUBLE' ? "#c4a100" : "#ffd100"}` }} onClick={() => onclick('DOUBLE')}>DOUBLE</Button>
          <Button className="input special" disabled={handleDisabledSpecial('TRIPLE')} style={{ backgroundColor: `${specialState[1] === 'TRIPLE' ? "#c96e02" : "#ff8a00"}` }} onClick={() => onclick('TRIPLE')}>TRIPLE</Button>
          <Button className="input special" disabled={handleDisabledSpecial('BACK')} onClick={() => onclick('BACK')}>BACK</Button>
          {game.training && <Button className="input special" style={{ backgroundColor: "#E55555" }} onClick={handleEndTraining}>END</Button>}
          {game.record.length === 1 && <Button className="input special" style={{ backgroundColor: '#E55555' }} onClick={handleQuit}>QUIT</Button>}
        </span>
      </div>
    </>
  )
}

export default Keyboard