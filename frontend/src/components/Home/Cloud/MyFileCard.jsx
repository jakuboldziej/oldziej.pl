import { Card, CardContent } from "@/components/ui/shadcn/card";
import { FileText, Mic, Video, Share2 } from 'lucide-react';
import { formatDataSize, handleFileTypes } from "@/components/Home/Cloud/utils";
import { mongodbApiUrl, renderFile } from "@/lib/fetch";
import CopyTextButton from "../CopyTextButton";
import MyTooltip from "../MyComponents/MyTooltip";
import CustomFileDropdown from "./CustomFileDropdown";

function MyFileCard(props) {
  const { file, filesViewType } = props;

  const dropdownProps = { ...props }

  return (
    <Card
      onDoubleClick={() => renderFile(file.filename)}
      className={`${filesViewType === "list" ? "card-list justify-start" : "card-grid justify-center"} select-none relative flex items-center cursor-pointer`}
      title={file.filename}
    >
      <CardContent className={`flex ${filesViewType === "list" ? "flex-row p-0 items-center justify-between w-full" : "flex-col"}`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center ${filesViewType === "list" ? "w-10 h-10" : "w-24 h-24"}`}>
            {handleFileTypes([file]).fileDocuments.length > 0 ? <FileText className="ml-1 w-full h-full" /> : (
              handleFileTypes([file]).fileVideos.length > 0 ? <Video className="ml-1 w-full h-full" /> : (
                handleFileTypes([file]).fileAudios.length > 0 ? <Mic className="ml-1 w-full h-full" /> : (
                  handleFileTypes([file]).fileImages.length > 0 ? <img className={`card-background ${filesViewType === "list" && "h-12"}`} src={`${mongodbApiUrl}/ftp/files/render/${encodeURI(file.filename.trim())}`} /> : null
                )
              )
            )}
          </div>

          <span className="nameplate truncate ...">
            <span className={`filename ${filesViewType === "list" && "hover:cursor-pointer hover:underline"}`} onClick={() => renderFile(file.filename)} title={file.filename}>{file.filename}</span>
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

          <CustomFileDropdown {...dropdownProps} />
        </div>
      </CardContent>
    </Card>
  )
}

export default MyFileCard