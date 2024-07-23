import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Shared() {
  return (
    <>
      <NavBar />
      <div className="cloud-wrapper text-white">
        <LeftNavBar />
        <div className="main shared">
          Shared
        </div>
      </div>
    </>
  )
}

export default Shared