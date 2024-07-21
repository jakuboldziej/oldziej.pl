import LeftNavBar from "@/components/Home/FTP/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Storage() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main settings-files">
        Storage
        </div>
      </div>
    </>
  )
}

export default Storage