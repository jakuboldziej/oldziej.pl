import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function Storage() {
  return (
    <>
      <NavBar />
      <div className="cloud-wrapper text-white">
        <LeftNavBar />
        <div className="main settings-files">
          Storage
        </div>
      </div>
    </>
  )
}

export default Storage