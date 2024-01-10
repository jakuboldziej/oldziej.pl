import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

/* eslint-disable react/prop-types */
function Keyboard({ params }) {
  const { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState, showNewToast, setOverthrow } = params;
  const onclick = (param) => {
    handleRound(param, users, game, handleShow, setUsers, specialState, setSpecialState, showNewToast, setOverthrow)
  }
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => onclick(i)}>{i}</button>);

  const handleEndTraining = () => {
    game.podium[1] = game.turn;
    if (game.podium[1]) {
      localStorage.setItem('dartsGame', null);
    }
    handleShow();
  }

  const handleQuitTraining = async () => {
    const docRef = doc(db, 'dartGames', game.id);
    await deleteDoc(docRef);

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
          <button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => onclick(25)}>25</button>
          <button className="input number" disabled={specialState[0]} onClick={() => onclick(0)}>0</button>
        </span>
        <span className="specials">
          <button className="input special" disabled={handleDisabledSpecial('DOORS')} onClick={() => onclick('DOORS')}>DOORS</button>
          <button className="input special" disabled={handleDisabledSpecial('DOUBLE')} style={{backgroundColor: `${specialState[1] === 'DOUBLE' ? "#c4a100" : "#ffd100"}`}} onClick={() => onclick('DOUBLE')}>DOUBLE</button>
          <button className="input special" disabled={handleDisabledSpecial('TRIPLE')} style={{backgroundColor: `${specialState[1] === 'TRIPLE' ? "#c96e02" : "#ff8a00"}`}} onClick={() => onclick('TRIPLE')}>TRIPLE</button>
          <button className="input special" disabled={handleDisabledSpecial('BACK')} onClick={() => onclick('BACK')}>BACK</button>
          {game.training && <button className="input special" style={{backgroundColor: "#E55555"}} onClick={handleEndTraining}>END</button>}
          {game.record.length === 1 && <button className="input special" style={{backgroundColor: '#E55555'}} onClick={handleQuitTraining}>QUIT</button>}
        </span>
      </div>
    </>
  )
}

export default Keyboard