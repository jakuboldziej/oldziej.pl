import LeftNavBar from "@/components/FTP/LeftNavBar"
import NavBar from "@/components/NavBar"

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