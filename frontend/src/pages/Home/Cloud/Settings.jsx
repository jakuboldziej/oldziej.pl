import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Settings() {
  return (
    <>
      <NavBar />
      <div className="cloud-wrapper text-white">
        <LeftNavBar />
        <div className="main settings-files">
          Settings
        </div>
      </div>
    </>
  )
}

export default Settings