import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function UploadFiles() {
  return (
    <>
      <NavBar />
      <div className="cloud-wrapper text-white">
        <LeftNavBar />
        <div className="main upload-files">
          UploadFiles
        </div>
      </div>
    </>
  )
}

export default UploadFiles