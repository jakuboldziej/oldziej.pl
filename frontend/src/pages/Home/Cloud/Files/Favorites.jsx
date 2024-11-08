import LeftNavBar from "@/components/Home/Cloud/LeftNavBar";
import MyFileCard from "@/components/Home/Cloud/MyFileCard";
import Loading from "@/components/Home/Loading";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { FtpContext } from "@/context/Home/FtpContext";
import { useContext, useEffect, useState } from "react";

function FavoriteFiles() {
  const { folders, files } = useContext(FtpContext);

  const [currentPage, setCurrentPage] = useState({
    files: 1,
    folders: 1,
  });
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });

  const [favoriteFiles, setFavoriteFiles] = useState([]);
  const [favoriteFolders, setFavoriteFolders] = useState([]);

  const handleScroll = (event, type) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (favoriteFolders.length > 0 && type === "folders") {
        setCurrentPage((prev) => { prev.files, currentPage.folders + 1 });
      } else if (favoriteFiles.length > 0 && type === "files") {
        setCurrentPage((prev) => { prev.folders, currentPage.files + 1 });
      }
    }
  };

  useEffect(() => {
    if (files) setFavoriteFiles(files.filter((f) => f.favorite === true));
  }, [files]);

  useEffect(() => {
    if (folders) setFavoriteFolders(folders.filter((f) => f.favorite === true));
  }, [folders]);

  useEffect(() => {
    // if (files) handleRecentFilesShown("scroll")
  }, [currentPage]);

  return (
    <div className="cloud-wrapper text-white">
      <LeftNavBar />
      <div className="main favorites">
        <div className='files flex flex-col gap-6'>
          <span className='text-3xl'>Files</span>
          <ScrollArea className='scroll-area' onScroll={(e) => handleScroll(e, "folders")}>
            <div className='files flex flex-col gap-4'>
              {files !== null ? (
                favoriteFiles.length > 0 ? (
                  favoriteFiles.map((file) => (
                    // <MyFileCard key={file._id} {...cardProps} file={file} />
                    <span key={file._id}>{file.filename}</span>
                  ))
                ) : (
                  <Loading />
                )
              ) : (
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 justify-center'>
                  No Favorite Files...
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
                  <Loading />
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
  )
}

export default FavoriteFiles