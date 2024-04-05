import LeftNavBar from "@/components/FTP/LeftNavBar"
import NavBar from "@/components/NavBar"

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