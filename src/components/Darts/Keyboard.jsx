/* eslint-disable react/prop-types */
function Keyboard({ params }) {
  const { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState } = params;
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => handleRound(i, users, game, handleShow, setUsers, specialState, setSpecialState)}>{i}</button>);

  return (
    <>
      <div className="keyboard">
        {numbers}
        <button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => handleRound(25, users, game, handleShow, setUsers, specialState, setSpecialState)}>25</button>
        <button className="input number" disabled={specialState[0]} onClick={() => handleRound(0, users, game, handleShow, setUsers, specialState)}>0</button>
        <button className="input special" style={{backgroundColor: "#dbff00"}} onClick={() => handleRound('DRZWI', users, game, handleShow, setUsers, specialState, setSpecialState)}>DRZWI</button>
        <button className="input special" style={{backgroundColor: "#ffd100"}} onClick={() => handleRound('DOUBLE', users, game, handleShow, setUsers, specialState, setSpecialState)}>DOUBLE</button>
        <button className="input special" style={{backgroundColor: "#ff8a00"}} onClick={() => handleRound('TRIPLE', users, game, handleShow, setUsers, specialState, setSpecialState)}>TRIPLE</button>
        {/* <div className="input special" style={{backgroundColor: "#ff3800"}} onClick={() => handleRound('BACK')}>BACK</div> */}
      </div>
    </>
  )
}

export default Keyboard