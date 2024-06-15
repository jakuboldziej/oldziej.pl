import LeftNavBar from "@/components/Home/FTP/LeftNavBar"
import NavBar from "@/components/Home/NavBar"

function UploadFiles() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main upload-files">
          UploadFiles
        </div>
      </div>
    </>
  )
}

export default UploadFiles