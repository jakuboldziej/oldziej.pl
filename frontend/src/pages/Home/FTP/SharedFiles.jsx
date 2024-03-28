import LeftNavBar from "@/components/FTP/LeftNavBar"
import NavBar from "@/components/NavBar"

function SharedFiles() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main shared-files">
        SharedFiles
        </div>
      </div>
    </>
  )
}

export default SharedFiles