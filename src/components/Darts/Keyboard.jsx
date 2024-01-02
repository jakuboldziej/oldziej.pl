/* eslint-disable react/prop-types */
function Keyboard({ params }) {
  const { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState, showNewToast } = params;
  const onclick = (param) => {
    handleRound(param, users, game, handleShow, setUsers, specialState, setSpecialState, showNewToast)
  }
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => onclick(i)}>{i}</button>);

  const handleEndTraining = () => {
    game.podium[1] = {displayName:game.turn};
    if (game.podium[1]) {
      localStorage.setItem('dartsGame', null);
    }
    handleShow();
  }

  return (
    <>
      <div className="keyboard">
        <span className="numbers">
          {numbers}
          <button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => onclick(25)}>25</button>
          <button className="input number" disabled={specialState[0]} onClick={() => onclick(0)}>0</button>
        </span>
        <span className="specials">
          <button className="input special" style={{backgroundColor: "#dbff00"}} onClick={() => onclick('DOORS')}>DOORS</button>
          <button className="input special" style={{backgroundColor: `${specialState[1] === 'DOUBLE' ? "#c4a100" : "#ffd100"}`}} onClick={() => onclick('DOUBLE')}>DOUBLE</button>
          <button className="input special" style={{backgroundColor: `${specialState[1] === 'TRIPLE' ? "#c96e02" : "#ff8a00"}`}} onClick={() => onclick('TRIPLE')}>TRIPLE</button>
          <button className="input special" style={{backgroundColor: "#ff3800"}} onClick={() => onclick('BACK')}>BACK</button>
          {game.training && <button className="input special" style={{backgroundColor: "red"}} onClick={handleEndTraining}>END</button>}
        </span>
      </div>
    </>
  )
}

export default Keyboard