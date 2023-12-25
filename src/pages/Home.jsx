import NavBar from "../components/NavBar"

function Home() {
  document.title = "HomeServer";
  return (
    <>
      <NavBar />
      <div className='home-page'>
      </div>
    </>
  )
}

export default Home