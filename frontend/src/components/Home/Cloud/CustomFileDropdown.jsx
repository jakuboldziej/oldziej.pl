import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { FileArchive, FileDown, Heart, HeartOff, Info, Move, PencilLine, Search, SquareArrowDown, Trash2, Files, FileSymlink, Link } from 'lucide-react';
import { useContext } from 'react';
import { FtpContext } from '@/context/Home/FtpContext';
import { patchFile, renderFile, downloadFile, mongodbApiUrl } from '@/lib/fetch';
import ShowNewToast from '../MyComponents/ShowNewToast';

function CustomFileDropdown(props) {
  const { file, dataShown, setFileStatus, handleOpeningDialog, updateDataShown, updateFilesStorage, isHovered, setIsHovered, filesViewType = "gird" } = props;
  const { files, setFiles } = useContext(FtpContext);

  const handleDownloadFile = (filename) => {
    setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFile(filename);
    setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleFavoriteFile = async (file) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    file.favorite = !file.favorite;

    if (file.favorite) ShowNewToast(`File ${file.filename}`, "Added to favorites.");
    else ShowNewToast(`File ${file.filename}`, "Removed from favorites.");

    const updatedFile = await patchFile({ file });
    const updatedData = dataShown.map((f) => f._id === updatedFile._id ? updatedFile : f);
    const updatedFiles = files.map((f) => f._id === updatedFile._id ? updatedFile : f);
    updateDataShown(updatedData);
    setFiles(updatedFiles);
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(`${mongodbApiUrl}/ftp/files/render/${file.filename}`)
      .then(() => {
        ShowNewToast("Link Copied", "Link copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy text:", error);
      });
  }

  const handleShareFile = () => {

  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`dropdown-trigger rounded-full hover:text-slate-400 ${filesViewType === "list" ? "mr-4" : "bg-slate-700"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis hover:cursor-pointer"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => renderFile(file.filename)} className='gap-2'><Search /> Preview</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FileDown />
            <span>Download...</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleDownloadFile(file.filename)} className='gap-2'><SquareArrowDown /> Standard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadFile(file.filename)} className='gap-2'><FileArchive /> As a ZIP file</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleShareLink(file.filename)} className='gap-2'><Link />Share link</DropdownMenuItem>
        <DropdownMenuItem disabled onClick={() => handleShareFile(file.filename)} className='gap-2'><FileSymlink />Share file</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOpeningDialog(file, "showInfo")} className='gap-2'><Info />Info</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onMouseLeave={() => setIsHovered((prev) => ({ ...prev, heart: false }))}
          onMouseEnter={() => setIsHovered((prev) => ({ ...prev, heart: true }))}
          onClick={() => handleFavoriteFile(file)}
          className='gap-2'>
          {file.favorite ?
            isHovered.heart ? <HeartOff /> : <Heart color='#ff0000' />
            : isHovered.heart ? <Heart color='#ff0000' /> : <Heart color='#ffffff' />
          }
          Favorite
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOpeningDialog(file, "changeDataName")} className='gap-2'><PencilLine />Rename</DropdownMenuItem>
        <DropdownMenuItem disabled className='gap-2'><Move />Move...</DropdownMenuItem>
        <DropdownMenuItem disabled className='gap-2'><Files />Copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOpeningDialog(file, "deleteData")} className='gap-2'><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomFileDropdown