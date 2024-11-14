import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Folder } from 'lucide-react';
import { useRef } from "react";
import CustomFolderDropdown from "./CustomFolderDropdown";

function MyFolderCard(props) {
  const { folder, filesViewType, openFolder } = props;
  const clickTimeoutRef = useRef(null);

  const handleSingleClick = () => {
    clickTimeoutRef.current = setTimeout(() => {
      openFolder(folder);
    }, 0);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimeoutRef.current);
    openFolder(folder);
  };

  const dropdownProps = { ...props, openFolder };

  return (
    <Card
      onDoubleClick={handleDoubleClick}
      className={`${filesViewType === "list" ? "card-list justify-start" : "card-grid justify-center"} select-none relative flex items-center cursor-pointer`}
      title={folder.filename}
    >
      <CardContent className={`flex ${filesViewType === "list" ? "flex-row p-0 items-center justify-between w-full" : "flex-col"}`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center ${filesViewType === "list" ? "w-10 h-10" : "w-24 h-24"}2`}>
            <Folder className="ml-1 w-full h-full" />
          </div>
          <span className=" nameplate truncate ...">
            <span className={`foldername z-50 ${filesViewType === "list" && "hover:cursor-pointer hover:underline"}`} onClick={handleSingleClick} title={folder.name}>{folder.name}</span>
          </span>
        </div>

        <CustomFolderDropdown {...dropdownProps} />
      </CardContent>
    </Card>
  )
}

export default MyFolderCard