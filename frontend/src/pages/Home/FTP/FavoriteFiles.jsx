import LeftNavBar from "@/components/FTP/LeftNavBar"
import NavBar from "@/components/NavBar"

function FavoriteFiles() {
  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main favorite-files">
        FavoriteFiles
        </div>
      </div>
    </>
  )
}

export default FavoriteFiles