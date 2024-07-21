import LeftNavBar from "@/components/Home/FTP/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Settings() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main settings-files">
        Settings
        </div>
      </div>
    </>
  )
}

export default Settings