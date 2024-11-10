import { Card, CardContent } from "@/components/ui/shadcn/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { FileArchive, FileDown, FileText, Heart, HeartOff, Info, Mic, Move, PencilLine, Search, SquareArrowDown, Trash2, Video, Files, Share2, FileSymlink, Link } from 'lucide-react';
import { downloadFile, formatDataSize, handleFileTypes, renderFile } from "@/components/Home/Cloud/utils";
import { mongodbApiUrl, putFile } from "@/lib/fetch";
import ShowNewToast from "../MyComponents/ShowNewToast";
import { useContext } from "react";
import { FtpContext } from "@/context/Home/FtpContext";
import CopyTextButton from "../CopyTextButton";
import MyTooltip from "../MyComponents/MyTooltip";
import CustomFileDropdown from "./CustomFileDropdown";

function MyFileCard(props) {
  const { file, dataShown, setFileStatus, handleOpeningDialog, updateDataShown, updateFilesStorage, isHovered, setIsHovered, filesViewType } = props;
  const { files, setFiles } = useContext(FtpContext);

  const handleDownloadFile = (filename) => {
    setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFile(filename);
    setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleDeleteFile = async (file) => {
    updateDataShown(dataShown.filter((f) => f._id !== file._id));
    updateFilesStorage(file, "del");

    ShowNewToast("File Update", `${file.filename} has been deleted.`);
  }

  const handleFavoriteFile = async (file) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    file.favorite = !file.favorite;

    if (file.favorite) ShowNewToast(`File ${file.filename}`, "Added to favorites.");
    else ShowNewToast(`File ${file.filename}`, "Removed from favorites.");

    const updatedFile = await putFile({ file });
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
        console.log("Failed to copy text:", error);
      });
  }

  const handleShareFile = () => {

  }

  const dropdownProps = {
    filesViewType,
  }

  return (
    <Card
      onDoubleClick={() => renderFile(file.filename)}
      className={`${filesViewType === "list" ? "card-list justify-start" : "card-grid justify-center"} select-none relative flex items-center cursor-pointer`}
      title={file.filename}
    >
      <CardContent className={`flex ${filesViewType === "list" ? "flex-row p-0 items-center justify-between w-full" : "flex-col"}`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center ${filesViewType === "list" ? "w-10 h-10" : "w-24 h-24"}2`}>
            {handleFileTypes([file]).fileDocuments.length > 0 ? <FileText className="ml-1 w-full h-full" /> : (
              handleFileTypes([file]).fileVideos.length > 0 ? <Video className="ml-1 w-full h-full" /> : (
                handleFileTypes([file]).fileAudios.length > 0 ? <Mic className="ml-1 w-full h-full" /> : (
                  handleFileTypes([file]).fileImages.length > 0 ? <img className={`card-background ${filesViewType === "list" && "h-12"}`} src={`${mongodbApiUrl}/ftp/files/render/${encodeURI(file.filename.trim())}`} /> : null
                )
              )
            )}
          </div>

          <span className="nameplate truncate ...">
            <span className='filename hover:cursor-pointer hover:underline' onClick={() => renderFile(file.filename)} title={file.filename}>{file.filename}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`hidden ${filesViewType === "list" ? "sm:flex" : "hidden"} items-center gap-4`}>
            <span>{file.filename.split('.').pop().toUpperCase()} file</span>
            <span>{formatDataSize(file.length)}</span>
            <CopyTextButton
              textToCopy={`${mongodbApiUrl}/ftp/files/render/${file.filename}`}
              toastTitle="Link Copied"
              toastDesc="Link copied to clipboard"
            >
              <MyTooltip title="Copy link to clipboard">
                <Share2 />
              </MyTooltip>
            </CopyTextButton>
          </div>

          {/* <CustomFileDropdown {...dropdownProps} /> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default MyFileCard