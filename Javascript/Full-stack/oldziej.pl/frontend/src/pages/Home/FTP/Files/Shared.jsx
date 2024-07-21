import LeftNavBar from "@/components/Home/FTP/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Shared() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main shared">
        Shared
        </div>
      </div>
    </>
  )
}

export default Shared