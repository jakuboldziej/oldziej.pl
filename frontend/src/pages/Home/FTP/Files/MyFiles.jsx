import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { FtpContext } from "@/context/FtpContext";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowDownNarrowWide, FilePlus, FileUp, FolderPlus, FolderUp, Loader2 } from 'lucide-react';
import { getFile, getFtpUser, postFolder, putFile, putFolder, uploadFile } from "@/fetch";
import { addFolderToFolder, formatElapsedTime, handleDataShown, handleSameFilename } from "@/components/FTP/utils";
import { Button } from "@/components/ui/button";
import ShowNewToast from "@/components/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import MyDialogs from "@/components/FTP/MyDialogs";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import MyFileCard from "@/components/FTP/MyFileCard";
import MyFolderCard from "@/components/FTP/MyFolderCard";

function MyFiles() {
  const { folders, setFolders, files, setFiles, activeFolders, setActiveFolders, currentFolder, setCurrentFolder } = useContext(FtpContext);
  const currentUser = useAuthUser();

  const navigate = useNavigate();

  const [recentFile, setRecentFile] = useState(null);
  const [dataShown, setDataShown] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [dialogOpen, setDialogOpen] = useState({
    file: null,
    changeFileName: false,
    showInfo: false,
    createFolder: false
  });
  const [isHovered, setIsHovered] = useState({
    heart: false
  });
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [creatingFolder, setCreatingFolder] = useState('')
  const [changingFileName, setChangingFileName] = useState('');

  const fileRef = useRef();

  const handleSubmit = async (event) => {
    setFileStatus((prev) => ({ ...prev, uploading: true }));
    setElapsedTime(0);

    try {
      let file = event.target.files[0];
      if (files) file = handleSameFilename(file, files);

      const ftpUser = await getFtpUser(currentUser.displayName);

      const formData = new FormData();
      formData.append('file', file)
      formData.append('userDisplayName', ftpUser.displayName)
      formData.append('lastModified', file.lastModified)
      formData.append('folder', currentFolder._id);

      const response = await uploadFile(formData);
      setRecentFile(response.file);
    } catch (err) {
      ShowNewToast("Error uploading file", err, "Warning")
    } finally {
      event.target.value = "";
      setFileStatus((prev) => ({ ...prev, uploading: false, uploaded: true }));
    }
  }

  const handleOpeningDialog = (file, action) => {
    if (action === "changeFileName") {
      setDialogOpen((prev) => ({ ...prev, changeFileName: true, file: file }));
      setChangingFileName(file.filename);
    } else if (action === "showInfo") {
      setDialogOpen((prev) => ({ ...prev, showInfo: true, file: file }));
    } else if (action === "createFolder") {
      setDialogOpen((prev) => ({ ...prev, createFolder: true }));
    }
  }

  const handleUpdateFile = async () => {
    const file = dialogOpen.file;
    const newFileName = changingFileName;
    const data = {
      file: file,
      newFileName: newFileName
    }
    const updatedFile = await putFile(data);
    const updatedData = dataShown.map((data) => {
      if (data._id === file._id) {
        data = updatedFile;
      }
      return data;
    });
    updateAllFiles(updatedData);
    setDialogOpen((prev) => ({ ...prev, changeFileName: false }));
  }

  const handleCreateNewFolder = async () => {
    if (creatingFolder.trim() === '') {
      ShowNewToast("Error creating folder", "Please specify a folder name", "Warning");
    } else {
      const folderName = creatingFolder;
      const data = {
        name: folderName,
        owner: currentUser.displayName
      }
      const folderRes = await postFolder(data);
      addFolderToFolder(currentFolder, folderRes);
      if (dataShown) {
        const updatedFiles = [folderRes, ...dataShown];
        updateAllFiles(updatedFiles);
      }
      else {
        updateAllFiles([folderRes])
      }
      setDialogOpen((prev) => ({ ...prev, createFolder: false }));
      setCreatingFolder('');
    }
  }

  const handleBreadcrumbClick = (folder) => {
    if (folder.name !== currentFolder.name) {
      // handleActiveFolders(folder, "backward");
    }
  }

  // const handleActiveFolders = async (folder, action) => {
  //   if (action === "forward") {
  //     setActiveFolders((prev) => [...prev, folder]);
  //   } else if (action === "backward") {
  //     let updatedActiveFolders = [...activeFolders];
  //     if (currentFolder._id !== folder._id) {
  //       for (let i = updatedActiveFolders.length - 1; i >= 0; i--) {
  //         const currentActiveFolder = updatedActiveFolders[i];
  //         if (currentActiveFolder._id === folder._id) {
  //           break;
  //         }
            
  //         if (currentActiveFolder._id !== folder._id) {
  //           updatedActiveFolders.splice(i, 1);
  //         }
  //       }
  //       setActiveFolders(updatedActiveFolders);
  //     }

  //     setCurrentFolder(folder);
  //     const updatedDataShown = await handleDataShown(folder);
  //     setDataShown(updatedDataShown);
  //   }
  // }

  const updateAllFiles = async (updatedData) => {
    setDataShown(updatedData);

    if (updatedData) {
      let updatedFolder = currentFolder;
      const dataFiles = updatedData.filter((data) => data.type == "file");
      const dataFolders = updatedData.filter((data) => data.type == "folder");
      updatedFolder.files = dataFiles.map((data) => data._id);
      updatedFolder.folders = dataFolders.map((data) => data._id);
      setCurrentFolder(updatedFolder);
      await putFolder({ folder: updatedFolder });
  
      const updatedFolders = folders.map((folder) => {
        if (folder._id === updatedFolder._id) {
          folder = updatedFolder;
        }
        return folder;
      })
      setFolders(updatedFolders)
      localStorage.setItem('folders', JSON.stringify(updatedFolders));
  
      if (!files) {
        setFiles([dataFiles[0]]);
        localStorage.setItem('files', JSON.stringify([dataFiles[0]]));
        return;
      }
    }
  }

  useEffect(() => {
    const updateDataShown = async () => {
      const fileRes = await getFile(recentFile._id);

      if (dataShown) {
        const dataFolders = dataShown.filter((data) => data.type == "folder");
        const dataFiles = dataShown.filter((data) => data.type == "file");

        const updatedDataShown = [...dataFolders, fileRes, ...dataFiles];
        updateAllFiles(updatedDataShown);
      }
      else {
        updateAllFiles([fileRes])
      }
      const updatedFiles = files ? [...files, fileRes] : [fileRes];
      setFiles(updatedFiles);
      localStorage.setItem('files', JSON.stringify(updatedFiles));

      setRecentFile(null);
    }
    if (recentFile) updateDataShown();
  }, [recentFile]);

  useEffect(() => {
    if (!fileStatus.uploading) return;

    const intervalId = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1000);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fileStatus.uploading]);

  useEffect(() => {
    if (fileStatus.uploading) {
      ShowNewToast("Uploading...", "Uploading file.");
    } else if (fileStatus.uploaded) {
      ShowNewToast("File Uploaded", `${recentFile.filename} uploaded in <br /> ${formatElapsedTime(elapsedTime)}`);
      setFileStatus((prev) => ({ ...prev, uploaded: false }));
    }

    if (fileStatus.downloading) {
      ShowNewToast("Downloading Started", `${fileStatus.downloading} downloading...`);
    }
  }, [fileStatus]);

  useEffect(() => {
    const getData = async () => {
      const updatedDataShown = await handleDataShown(currentFolder);
      setDataShown(updatedDataShown);
    }
    if (currentFolder) getData();
  }, [currentFolder]);

  const myDialogsProps = {
    dialogOpen,
    setDialogOpen,
    handleUpdateFile,
    handleCreateNewFolder,
    changingFileName,
    setChangingFileName,
    creatingFolder,
    setCreatingFolder
  }

  const cardProps = {
    setFileStatus,
    handleOpeningDialog,
    updateAllFiles,
    isHovered,
    setIsHovered,
    dataShown,
    setDataShown,
    // handleActiveFolders
  }

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          <div className="folders-path">
            <Breadcrumb className="pt-[24px] pl-[24px]">
              <BreadcrumbList>
                {/* {activeFolders && activeFolders.map((folder, i) => (
                  <BreadcrumbItem key={folder._id} onClick={() => handleBreadcrumbClick(folder)} className="hover:cursor-pointer">
                    <BreadcrumbLink className="text-base">{folder.name}</BreadcrumbLink>
                    {folders.length > 1 && i !== activeFolders.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))} */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="files">
                {dataShown !== null ? (
                  dataShown.length > 0 ? (
                    dataShown.map((data) => (
                      data.type == "file" ? (
                        <MyFileCard key={data._id} {...cardProps} file={data} />
                      ) : (
                        <MyFolderCard key={data._id} {...cardProps} folder={data} />
                      )
                    ))
                  ) : (
                    <div className="flex justify-center w-full pt-3">
                      <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                  )
                ) : (
                  <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 justify-center w-100 pt-12'>
                    No Files...
                    <Button variant="outline_red" onClick={() => navigate("/ftp/files/upload")}>Upload Files</Button>
                    Or Right click here
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem className="gap-2" onClick={() => handleOpeningDialog(null, "createFolder")}><FolderPlus />Utwórz katalog</ContextMenuItem>
              <ContextMenuItem className="gap-2"><FilePlus />Nowy plik tekstowy</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2"><ArrowDownNarrowWide />SORTUJ</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem>Nazwa</ContextMenuItem>
                  <ContextMenuItem>Rodzaj</ContextMenuItem>
                  <ContextMenuItem>Data Dodania</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem className="gap-2" onClick={() => fileRef.current && fileRef.current.click()}><FileUp />Wgraj Plik</ContextMenuItem>
              <ContextMenuItem disabled className="gap-2"><FolderUp />Wgraj Katalog</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>

      <input onChangeCapture={(e) => handleSubmit(e)} ref={fileRef} id="inputfile" name="inputfile" type="file" className="w-[0.1px] h-[0.1px] opacity-0 absolute" />

      <MyDialogs {...myDialogsProps} />
    </>
  )
}

export default MyFiles