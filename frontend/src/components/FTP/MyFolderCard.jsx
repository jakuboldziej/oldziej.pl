import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileArchive, FileDown, Heart, HeartOff, Info, Move, PencilLine, SquareArrowDown, Trash2, Folder, FolderOpen, Files, Link, FolderSymlink } from 'lucide-react';
import { downloadFolder, handleDataShown } from "./utils";

function MyFolderCard(props) {
  const { folder, handleOpeningDialog, isHovered, setIsHovered, setCurrentFolder, setDataShown, handleActiveFolders } = props;

  const handleDownloadFile = (foldername) => {
    // setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFolder(foldername);
    // setFileStatus((prev) => ({ ...prev, downloading: false }));
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
            <DropdownMenuItem onClick={() => openFolder(folder.name)} className='gap-2'><FolderOpen /> Open</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <FileDown />
                <span>Download...</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleDownloadFile(folder.filename)} className='gap-2'><SquareArrowDown /> Standard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadFile(folder.filename)} className='gap-2'><FileArchive /> As a ZIP file</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleShareLink(folder.filename)} className='gap-2'><Link />Share link</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShareFolder(folder.filename)} className='gap-2'><FolderSymlink />Share folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpeningDialog(folder, "showInfo")} className='gap-2'><Info />Info</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onMouseLeave={() => setIsHovered((prev) => ({ ...prev, heart: false }))}
              onMouseEnter={() => setIsHovered((prev) => ({ ...prev, heart: true }))}
              onClick={() => handleFavoriteFile(folder)}
              className='gap-2'>
              {folder.favorite ?
                isHovered.heart ? <HeartOff /> : <Heart color='#ff0000' />
                : isHovered.heart ? <Heart color='#ff0000' /> : <Heart color='#ffffff' />
              }
              Favorite
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpeningDialog(folder, "changeFileName")} className='gap-2'><PencilLine />Rename</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Move />Move...</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Files />Copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteImage(folder)} className='gap-2'><Trash2 />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

export default MyFolderCard