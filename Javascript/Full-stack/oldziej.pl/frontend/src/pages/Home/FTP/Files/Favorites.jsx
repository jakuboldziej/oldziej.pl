import LeftNavBar from "@/components/Home/FTP/LeftNavBar"
import MyFileCard from "@/components/Home/FTP/MyFileCard";
import NavBar from "@/components/Home/NavBar"
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { FtpContext } from "@/context/FtpContext";
import { Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react"

function FavoriteFiles() {
  const { folders, files } = useContext(FtpContext);

  const [currentPage, setCurrentPage] = useState({
    files: 1,
    folders: 1,
  });

  const [favoriteFiles, setFavoriteFiles] = useState(() => {
    const favFiles = files.filter((f) => f.favorite === true);
    return favFiles.length > 0 ? favFiles : null;
  });
  const [favoriteFolders, setFavoriteFolders] = useState(() => {
    const favFolders = folders.filter((f) => f.favorite === true);
    return favFolders.length > 0 ? favFolders : null;
  });

  const handleScroll = (event, type) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (favoriteFolders.length > 0 && type === "folders") {
        setCurrentPage((prev) => {prev.files, currentPage.folders + 1});
      } else if (favoriteFiles.length > 0 && type === "files") {
        setCurrentPage((prev) => {prev.folders, currentPage.files + 1});
      }
    }
  };

  useEffect(() => {
    // if (files) handleRecentFilesShown("scroll")
  }, [currentPage]);

  useEffect(() => {
    console.log();
  }, [favoriteFolders]);

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main favorites">
          <div className='files flex flex-col gap-6'>
            <span className='text-3xl'>Files</span>
            <ScrollArea className='scroll-area' onScroll={(e) => handleScroll(e, "folders")}>
              <div className='files flex flex-col gap-4'>
                {favoriteFiles !== null ? (
                  favoriteFiles.length > 0 ? (
                    favoriteFiles.map((file) => (
                      // <MyFileCard key={file._id} {...cardProps} file={file} />
                      <span key={file._id}>{file.filename}</span>
                    ))
                  ) : (
                    <div className="flex justify-center w-full pt-3">
                      <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                  )
                ) : (
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 justify-center'>
                    No Favorite Folders...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className='folders flex flex-col gap-6'>
            <span className='text-3xl'>Folders</span>
            <ScrollArea className='scroll-area' onScroll={(e) => handleScroll(e, "folders")}>
              <div className='folders flex flex-col gap-4'>
                {favoriteFolders !== null ? (
                  favoriteFolders.length > 0 ? (
                    favoriteFolders.map((folder) => (
                      // <MyFolderCard key={folder._id} {...cardProps} folder={folder} />
                      <span key={folder._id}>{folder.name}</span>
                    ))
                  ) : (
                    <div className="flex justify-center w-full pt-3">
                      <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                  )
                ) : (
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 justify-center'>
                    No Favorite Folders...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  )
}

export default FavoriteFiles