/* eslint-disable react/prop-types */
function Keyboard({ params }) {
  const { handleRound, users, game, handleShow, setUsers, specialState, setSpecialState } = params;
  const onclick = (param) => {
    handleRound(param, users, game, handleShow, setUsers, specialState, setSpecialState)
  }
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<button key={i} className="input number" onClick={() => onclick(i)}>{i}</button>);


  return (
    <>
      <div className="keyboard">
        {numbers}
        <button className="input number" disabled={specialState[1] === "TRIPLE"} onClick={() => onclick(25)}>25</button>
        <button className="input number" disabled={specialState[0]} onClick={() => onclick(0)}>0</button>
        <button className="input special" style={{backgroundColor: "#dbff00"}} onClick={() => onclick('DRZWI')}>DRZWI</button>
        <button className="input special" style={{backgroundColor: "#ffd100", opacity: `${specialState[1] === 'DOUBLE' ? 0.8 : 1}`}} onClick={() => onclick('DOUBLE')}>DOUBLE</button>
        <button className="input special" style={{backgroundColor: "#ff8a00", opacity: `${specialState[1] === 'TRIPLE' ? 0.8 : 1}`}} onClick={() => onclick('TRIPLE')}>TRIPLE</button>
        {/* <div className="input special" style={{backgroundColor: "#ff3800"}} onClick={() => handleRound('BACK')}>BACK</div> */}
      </div>
    </>
  )
}

export default Keyboard