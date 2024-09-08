import { Card, CardContent } from "@/components/ui/shadcn/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { FileArchive, FileDown, Heart, HeartOff, Info, Move, PencilLine, SquareArrowDown, Trash2, Folder, FolderOpen, Files, Link, FolderSymlink } from 'lucide-react';
import { downloadFolder, handleDataShown } from "./utils";
import { useContext } from "react";
import { FtpContext } from "@/context/Home/FtpContext";
import ShowNewToast from "../MyComponents/ShowNewToast";
import { putFolder } from "@/lib/fetch";

function MyFolderCard(props) {
  const { folder, dataShown, handleOpeningDialog, isHovered, setIsHovered, updateDataShown, updateFoldersStorage, setDataShown, handleActiveFolders } = props;
  const { setCurrentFolder, folders, setFolders } = useContext(FtpContext);

  const handleDownloadFolder = (foldername) => {
    // setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFolder(foldername);
    // setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleDeleteFolder = async (folder) => {
    updateFoldersStorage(folder, "del");
  }

  const handleShareLink = () => {

  }

  const handleShareFolder = () => {

  }

  const openFolder = async (folder) => {
    handleActiveFolders(folder, "forward");

    const updatedDataShown = await handleDataShown(folder);
    setDataShown(updatedDataShown);
    setCurrentFolder(folder);
  }

  const handleFavoriteFolder = async (folder) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    folder.favorite = !folder.favorite;

    if (folder.favorite) ShowNewToast(`Folder ${folder.name}`, "Added to favorites.");
    else ShowNewToast(`Folder ${folder.name}`, "Removed from favorites.");

    const updatedFolder = await putFolder({ folder });
    const updatedData = dataShown.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
    const updatedFolders = folders.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
    updateDataShown(updatedData);
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  }

  return (
    <Card onDoubleClick={() => openFolder(folder)} key={folder._id} className="card select-none relative flex justify-center items-center" title={folder.filename}>
      <CardContent>
        <Folder width={100} height={100} />
        <div className="nameplate truncate ...">
          {folder.name}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="dropdown-trigger rounded-full bg-slate-700 hover:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis hover:cursor-pointer"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openFolder(folder)} className='gap-2'><FolderOpen /> Open</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <FileDown />
                <span>Download...</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem disabled onClick={() => handleDownloadFolder(folder.filename)} className='gap-2'><SquareArrowDown /> Standard</DropdownMenuItem>
                  <DropdownMenuItem disabled onClick={() => handleDownloadFolder(folder.filename)} className='gap-2'><FileArchive /> As a ZIP file</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled onClick={() => handleShareLink(folder.filename)} className='gap-2'><Link />Share link</DropdownMenuItem>
            <DropdownMenuItem disabled onClick={() => handleShareFolder(folder.filename)} className='gap-2'><FolderSymlink />Share folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpeningDialog(folder, "showInfo")} className='gap-2'><Info />Info</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onMouseLeave={() => setIsHovered((prev) => ({ ...prev, heart: false }))}
              onMouseEnter={() => setIsHovered((prev) => ({ ...prev, heart: true }))}
              onClick={() => handleFavoriteFolder(folder)}
              className='gap-2'>
              {folder.favorite ?
                isHovered.heart ? <HeartOff /> : <Heart color='#ff0000' />
                : isHovered.heart ? <Heart color='#ff0000' /> : <Heart color='#ffffff' />
              }
              Favorite
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpeningDialog(folder, "changeDataName")} className='gap-2'><PencilLine />Rename</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Move />Move...</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Files />Copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteFolder(folder)} className='gap-2'><Trash2 />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

export default MyFolderCard