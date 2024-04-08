import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileArchive, FileDown, FileText, Heart, HeartOff, Info, Mic, Move, PencilLine, Search, SquareArrowDown, Trash2, Video, Files } from 'lucide-react';
import { deleteFileFromFolder, downloadFile, handleFileTypes, renderFile } from "@/components/FTP/utils";
import { deleteFile, mongodbApiUrl, putFile } from "@/fetch";
import ShowNewToast from "../MyComponents/ShowNewToast";

function MyFileCard(props) {
  const { file, dataShown, setFileStatus, handleOpeningDialog, updateAllFiles, isHovered, setIsHovered, currentFolder } = props;
  
  const handleDownloadFile = (filename) => {
    setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFile(filename);
    setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleDeleteImage = async (file) => {
    const deleteRes = await deleteFile(file._id);
    await deleteFileFromFolder(currentFolder, file);

    if (deleteRes.ok) {
      let updatedFiles = dataShown.filter((f) => f._id !== file._id);
      if (updatedFiles.length === 0) updatedFiles = null;
      updateAllFiles(updatedFiles);
      ShowNewToast("File Update", `${file.filename} has been deleted.`);
    }
  }

  const handleFavoriteFile = async (file) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    file.favorite = !file.favorite;

    if (file.favorite) ShowNewToast(`File ${file.filename}`, "Added to favorites.");
    else ShowNewToast(`File ${file.filename}`, "Removed from favorites.");

    const updatedFile = await putFile({ file });
    const updatedFiles = dataShown.map((data) => {
      if (data._id === file._id) {
        data = updatedFile;
      }
      return data;
    });
    updateAllFiles(updatedFiles);
  }

  return (
    <Card onDoubleClick={() => renderFile(file.filename)} key={file._id} className="card select-none relative flex justify-center items-center" title={file.filename}>
      <CardContent>
        {handleFileTypes([file]).fileDocuments.length > 0 ? <FileText width={100} height={100} /> : (
          handleFileTypes([file]).fileVideos.length > 0 ? <Video width={100} height={100} /> : (
            handleFileTypes([file]).fileAudios.length > 0 ? <Mic width={100} height={100} /> : (
              handleFileTypes([file]).fileImages.length > 0 ? <img className="card-background" src={`${mongodbApiUrl}/ftp/files/render/${encodeURI(file.filename.trim())}`} /> : null
            )
          )
        )}
        <div className="nameplate truncate ...">
          {file.filename}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="dropdown-trigger rounded-full bg-slate-700 hover:text-slate-400">
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
            <DropdownMenuItem onClick={() => handleOpeningDialog(file, "changeFileName")} className='gap-2'><PencilLine />Rename</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Move />Move...</DropdownMenuItem>
            <DropdownMenuItem disabled className='gap-2'><Files />Copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteImage(file)} className='gap-2'><Trash2 />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

export default MyFileCard