import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { FtpContext } from "@/context/FtpContext";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowDownNarrowWide, FilePlus, FileUp, FolderPlus, FolderUp, Loader2 } from 'lucide-react';
import { deleteFile, deleteFolder, getFile, getFtpUser, postFolder, putFile, uploadFile } from "@/fetch";
import { addFileToFolder, addFolderToFolder, deleteFileFromFolder, deleteFolderFromFolder, formatElapsedTime, handleDataShown, handleSameFilename } from "@/components/FTP/utils";
import { Button } from "@/components/ui/button";
import ShowNewToast from "@/components/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import MyDialogs from "@/components/FTP/MyDialogs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import MyFileCard from "@/components/FTP/MyFileCard";
import MyFolderCard from "@/components/FTP/MyFolderCard";
import { AuthContext } from "@/context/AuthContext";

function MyFiles() {
  const { folders, setFolders, files, setFiles, activeFolders, setActiveFolders, currentFolder, setCurrentFolder } = useContext(FtpContext);
  const { currentUser } = useContext(AuthContext);

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
    
    const updatedData = dataShown.map((f) => f._id === updatedFile._id ? updatedFile : f);
    updateDataShown(updatedData);
    const updatedFiles = files.map((f) => f._id === updatedFile._id ? updatedFile : f);
    setFiles(updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
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
      if (dataShown) {
        const updatedDataShown = [folderRes, ...dataShown];
        updateDataShown(updatedDataShown);
      }
      else {
        updateDataShown([folderRes])
      }

      updateFoldersStorage(folderRes, "add")

      setDialogOpen((prev) => ({ ...prev, createFolder: false }));
      setCreatingFolder('');
    }
  }

  const handleBreadcrumbClick = (folder) => {
    if (folder._id !== currentFolder._id) {
      handleActiveFolders(folder, "backward");
    }
  }

  const handleActiveFolders = async (folder, action) => {
    if (action === "forward") {
      const parseFolder = {
        _id: folder._id,
        name: folder.name
      }
      const updatedActiveFolders = [...activeFolders, parseFolder];
      setActiveFolders(updatedActiveFolders);
      localStorage.setItem('activeFolders', JSON.stringify(updatedActiveFolders))
    } else if (action === "backward" && currentFolder._id !== folder._id) {
      const indexToStop = activeFolders.indexOf(folder);
      const updatedActiveFolders = activeFolders.slice(0, indexToStop + 1);

      const newCurrentFolder = folders.find((f) => f._id === folder._id);
      setCurrentFolder(newCurrentFolder);
      setActiveFolders(updatedActiveFolders);
      localStorage.setItem('activeFolders', JSON.stringify(updatedActiveFolders))
    }
  }

  const updateDataShown = async (updatedData) => {
    setDataShown(updatedData.length > 0 ? updatedData : null);
  }

  const updateFilesStorage = async (file, action) => {
    let updatedFiles;
    let updatedFolders = [...folders];

    if (action === "add") {
      const { updatedFolder } = await addFileToFolder(currentFolder, file);

      if (!files) updatedFiles = [file];
      else updatedFiles = [file, ...files];

      updatedFolders = updatedFolders.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
    } else if (action === "del") {
      const { updatedFolder, updatedFile } = await deleteFileFromFolder(currentFolder, file);

      updatedFolders = updatedFolders.map((f) => f._id === updatedFolder._id ? updatedFolder : f);

      if (updatedFile.folders.length === 0) {
        updatedFiles = files.filter((f) => f._id !== updatedFile._id);
        await deleteFile(file._id);
      } else {
        updatedFiles = files.map((f) => f._id === updatedFile._id ? updatedFile : f);
      }
    }

    setFolders(updatedFolders)
    localStorage.setItem('folders', JSON.stringify(updatedFolders));

    updatedFiles = updatedFiles.length > 0 ? updatedFiles : null;
    setFiles(updatedFiles)
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  }

  const updateFoldersStorage = async (folder, action) => {
    let updatedFolders = [...folders];
    let updatedFiles;
    updatedFiles = files ? [...files] : null;

    if (action === "add") {
      const { updatedCurrentFolder, updatedFolder } = await addFolderToFolder(currentFolder, folder);

      updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
      updatedFolders = [updatedFolder, ...updatedFolders];
      setCurrentFolder(updatedCurrentFolder);
    } else if (action === "del") {
      const { updatedCurrentFolder, updatedFolder } = await deleteFolderFromFolder(currentFolder, folder);

      await deleteFolder(folder._id);
      if (folder.files.length > 0 || folder.folders.length > 0) {
        alert("Are you sure you want to delete?");
        folder.files.length > 0 && folder.files.map(async (fileId) => {
          let fileObj = files.find((f) => f._id === fileId);
          const { updatedFile } = await deleteFileFromFolder(folder, fileObj);
          fileObj = updatedFile
        });

        folder.folders.length > 0 && folder.folders.map(async (folderId) => {
          let folderObj = updatedFolders.find((f) => f._id === folderId);
          const { updatedFolder } = await deleteFolderFromFolder(folder, folderObj);
        });
      }

      console.log(updatedFiles, updatedFolders);

      updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
      updatedFolders = updatedFolders.filter((f) => f._id !== folder._id);
      setCurrentFolder(updatedCurrentFolder);
    }

    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  }

  useEffect(() => {
    const handleNewFile = async () => {
      const fileRes = await getFile(recentFile._id);

      if (dataShown) {
        const dataFolders = dataShown.filter((data) => data.type === "folder");
        const dataFiles = dataShown.filter((data) => data.type === "file");

        const updatedDataShown = [...dataFolders, fileRes, ...dataFiles];
        updateDataShown(updatedDataShown);
      }
      else {
        updateDataShown([fileRes]);
      }

      updateFilesStorage(fileRes, "add");
      setRecentFile(null);
    }
    if (recentFile) handleNewFile();
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

  const getDataShown = async (folder) => {
    const updatedDataShown = await handleDataShown(folder);
    setDataShown(updatedDataShown);
  }

  useEffect(() => {
    if (activeFolders.length > 0) {
      const getCurrentFolder = folders.find((f) => f._id == activeFolders[activeFolders.length - 1]._id);
      setCurrentFolder(getCurrentFolder);
      getDataShown(getCurrentFolder);
    }
  }, [activeFolders]);

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
    updateDataShown,
    updateFoldersStorage,
    updateFilesStorage,
    isHovered,
    setIsHovered,
    dataShown,
    setDataShown,
    handleActiveFolders
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
                {activeFolders && activeFolders.map((folder, i) => (
                  <BreadcrumbItem key={folder._id} onClick={() => handleBreadcrumbClick(folder)} className="hover:cursor-pointer">
                    <BreadcrumbLink className="text-base">{folder.name}</BreadcrumbLink>
                    {folders.length > 1 && i !== activeFolders.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
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