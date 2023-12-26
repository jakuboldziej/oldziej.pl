/* eslint-disable react/prop-types */
function Keyboard({ handleRound }) {
  const numbers = [];
  for (let i = 1; i <= 20; i++) numbers.push(<div key={i} className="input number" onClick={() => handleRound(i)}>{i}</div>);

  return (
    <>
      <div className="keyboard">
        {numbers}
        <div className="input number" onClick={() => handleRound(25)}>25</div>
        <div className="input number" onClick={() => handleRound(0)}>0</div>
        <div className="input special" style={{backgroundColor: "#dbff00"}} onClick={() => handleRound('DRZWI')}>DRZWI</div>
        <div className="input special" style={{backgroundColor: "#ffd100"}} onClick={() => handleRound('DOUBLE')}>DOUBLE</div>
        <div className="input special" style={{backgroundColor: "#ff8a00"}} onClick={() => handleRound('TRIPLE')}>TRIPLE</div>
        {/* <div className="input special" style={{backgroundColor: "#ff3800"}} onClick={() => handleRound('BACK')}>BACK</div> */}
      </div>
    </>
  )
}

export default Keyboard