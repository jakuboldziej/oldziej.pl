import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Folder } from 'lucide-react';
import { handleDataShown } from "./utils";
import { useContext } from "react";
import { FtpContext } from "@/context/Home/FtpContext";
import CustomFolderDropdown from "./CustomFolderDropdown";

function MyFolderCard(props) {
  const { folder, setDataShown, handleActiveFolders, filesViewType } = props;
  const { setCurrentFolder } = useContext(FtpContext);

  const openFolder = async (folder) => {
    handleActiveFolders(folder, "forward");

    const updatedDataShown = await handleDataShown(folder);
    setDataShown(updatedDataShown);
    setCurrentFolder(folder);
  }

  const dropdownProps = { ...props, openFolder };

  return (
    <Card
      onDoubleClick={() => openFolder(folder)}
      className={`${filesViewType === "list" ? "card-list justify-start" : "card-grid justify-center"} select-none relative flex items-center cursor-pointer`}
      title={folder.filename}
    >
      <CardContent className={`flex ${filesViewType === "list" ? "flex-row p-0 items-center justify-between w-full" : "flex-col"}`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center ${filesViewType === "list" ? "w-10 h-10" : "w-24 h-24"}2`}>
            <Folder className="ml-1 w-full h-full" />
          </div>
          <span className=" nameplate truncate ...">
            <span className={`foldername ${filesViewType === "list" && "hover:cursor-pointer hover:underline"}`} onClick={() => openFolder(folder)} title={folder.name}>{folder.name}</span>
          </span>
        </div>

        <CustomFolderDropdown {...dropdownProps} />
      </CardContent>
    </Card>
  )
}

export default MyFolderCard