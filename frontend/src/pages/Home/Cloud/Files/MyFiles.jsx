import LeftNavBar from "@/components/Home/Cloud/LeftNavBar";
import { FtpContext } from "@/context/Home/FtpContext";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowDownNarrowWide, FilePlus, FileUp, FolderPlus, FolderUp, LayoutGrid, List } from 'lucide-react';
import { deleteFile, getFile, getFolder, getFtpUser, postFolder, patchFile, patchFolder, uploadFile } from "@/lib/fetch";
import { addFileToFolder, addFolderToFolder, deleteFileFromFolder, deleteFolderFromFolder, formatElapsedTime, handleDataShown, handleSameFilename } from "@/components/Home/Cloud/utils";
import { Button } from "@/components/ui/shadcn/button";
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/shadcn/context-menu";
import MyDialogs from "@/components/Home/Cloud/MyDialogs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/shadcn/breadcrumb";
import MyFileCard from "@/components/Home/Cloud/MyFileCard";
import MyFolderCard from "@/components/Home/Cloud/MyFolderCard";
import { AuthContext } from "@/context/Home/AuthContext";
import Loading from "@/components/Home/Loading";
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from "react-router-dom";

function MyFiles() {
  const { folders, setFolders, files, setFiles, activeFolders, setActiveFolders, currentFolder, setCurrentFolder, setRefreshData } = useContext(FtpContext);
  const { currentUser } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const [recentFile, setRecentFile] = useState(null);
  const [dataShown, setDataShown] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filesViewType, setFilesViewType] = useState(() => {
    const savedView = JSON.parse(localStorage.getItem("cloudSettings"))?.activeFilesView;
    return savedView ? savedView : "list";
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  const [dialogOpen, setDialogOpen] = useState({
    data: null,
    changeDataName: false,
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
  const [creatingFolder, setCreatingFolder] = useState('');
  const [changingDataName, setChangingDataName] = useState('');

  const fileRef = useRef();

  const handleSubmit = async (file) => {
    setFileStatus((prev) => ({ ...prev, uploading: true }));
    setElapsedTime(0);

    try {
      file = handleSameFilename(file, files);
      const ftpUser = await getFtpUser(currentUser.displayName);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', ftpUser._id);
      formData.append('lastModified', file.lastModified);
      formData.append('folder', ftpUser.main_folder);

      const response = await uploadFile(formData);

      setRecentFile(response.file);
    } catch (error) {
      ShowNewToast("Error uploading file", error, "warning");
    } finally {
      setFileStatus((prev) => ({ ...prev, uploading: false, uploaded: true }));
    }
  };

  const handleOpeningDialog = (data, action) => {
    if (action === "changeDataName") {
      setDialogOpen((prev) => ({ ...prev, changeDataName: true, data: data }));
      setChangingDataName(data.type === "file" ? data.filename : data.name);
    } else if (action === "showInfo") {
      setDialogOpen((prev) => ({ ...prev, showInfo: true, data: data }));
    } else if (action === "createFolder") {
      setDialogOpen((prev) => ({ ...prev, createFolder: true }));
    } else if (action === "deleteData") {
      setDialogOpen((prev) => ({ ...prev, deleteData: true, data: data }));
    }
  }

  const handleUpdateData = async (type) => {
    if (type === "file") {
      const file = dialogOpen.data;
      const newFileName = changingDataName;
      const data = {
        file: file,
        newFileName: newFileName
      }
      const updatedFile = await patchFile(data);

      const updatedData = dataShown.map((f) => f._id === updatedFile._id ? updatedFile : f);
      updateDataShown(updatedData);
      const updatedFiles = files.map((f) => f._id === updatedFile._id ? updatedFile : f);
      setFiles(updatedFiles);
      setDialogOpen((prev) => ({ ...prev, changeDataName: false }));
    } else if (type === "folder") {
      let folder = dialogOpen.data;
      if (changingDataName) folder.name = changingDataName;

      const data = {
        folder: folder
      }
      const updatedFolder = await patchFolder(data);

      const updatedData = dataShown.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
      updateDataShown(updatedData);
      const updatedFolders = folders.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
      setFolders(updatedFolders);
      setDialogOpen((prev) => ({ ...prev, changeDataName: false }));
    }
  }

  const handleDeleteData = async (data) => {
    if (data.type === "folder") {
      await deleteFolderFromFolder(currentFolder, data);

      updateDataShown(dataShown.filter((f) => f._id !== data._id));
      setFolders((prevFolders) => prevFolders.filter((f) => f._id !== data._id));

      ShowNewToast("Folder Update", `${data.name} has been deleted.`);
      setRefreshData(true);
    } else if (data.type === "file") {
      updateDataShown(dataShown.filter((f) => f._id !== data._id));
      updateFilesStorage(data, "del");

      ShowNewToast("File Update", `${data.filename} has been deleted.`);
    }

    setDialogOpen((prev) => ({ ...prev, deleteData: false }));
  }

  const handleCreateNewFolder = async () => {
    if (creatingFolder.trim() === '') {
      ShowNewToast("Error creating folder", "Please specify a folder name", "Warning");
    } else {
      const folderName = creatingFolder;

      const ftpUser = await getFtpUser(currentUser.displayName);

      const data = {
        name: folderName,
        ownerId: ftpUser._id,
        uploadDate: Date.now()
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
      ShowNewToast("Folder Update", `${folderRes.name} created.`);
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
      localStorage.setItem('cloudSettings', JSON.stringify({ 'activeFolders': updatedActiveFolders }));
    } else if (action === "backward" && currentFolder._id !== folder._id) {
      const indexToStop = activeFolders.indexOf(folder);
      const updatedActiveFolders = activeFolders.slice(0, indexToStop + 1);

      const newCurrentFolder = folders.find((f) => f._id === folder._id);
      setCurrentFolder(newCurrentFolder);
      setActiveFolders(updatedActiveFolders);
      localStorage.setItem('cloudSettings', JSON.stringify({ 'activeFolders': updatedActiveFolders }));
    }
  }

  const handleActiveFilesView = (type) => {
    setFilesViewType(type);

    let cloudSettings = JSON.parse(localStorage.getItem("cloudSettings"));
    cloudSettings = {
      ...cloudSettings,
      "activeFilesView": type
    }

    localStorage.setItem("cloudSettings", JSON.stringify(cloudSettings));
  }

  const updateDataShown = async (updatedData) => {
    setDataShown(updatedData);
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

    setFiles(updatedFiles)
  }

  const updateFoldersStorage = async (folder, action) => {
    let updatedFolders = [...folders];

    if (action === "add") {
      const { updatedCurrentFolder, updatedFolder } = await addFolderToFolder(currentFolder, folder);

      updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
      updatedFolders = [updatedFolder, ...updatedFolders];
      setCurrentFolder(updatedCurrentFolder);
    } else if (action === "del") {
      if (folder.files.length > 0 || folder.folders.length > 0) {
        ShowNewToast("Cant't delete folder", `${folder.name} has data inside`);
      } else {
        const { updatedCurrentFolder } = await deleteFolderFromFolder(currentFolder, folder);

        updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
        updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
        updatedFolders = updatedFolders.filter((f) => f._id !== folder._id);
        setCurrentFolder(updatedCurrentFolder);
        ShowNewToast("Folder Update", `${folder.name} has been deleted.`);
        updateDataShown(dataShown.filter((f) => f._id !== folder._id));
      }
    }

    setFolders(updatedFolders);
  }

  const getDataShown = async (folder) => {
    const updatedDataShown = await handleDataShown(folder);
    setDataShown(updatedDataShown);
    setDataLoaded(true);
  }

  const openFolder = async (folder) => {
    handleActiveFolders(folder, "forward");

    const updatedDataShown = await handleDataShown(folder);
    setDataShown(updatedDataShown);
    setCurrentFolder(folder);
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

  useEffect(() => {
    if (activeFolders.length > 0) {
      const findCurrentFolder = folders.find((f) => f._id === activeFolders[activeFolders.length - 1]._id);
      setCurrentFolder(findCurrentFolder);
      getDataShown(findCurrentFolder);
    }
  }, [activeFolders]);

  useEffect(() => {
    const openFolderFromURL = async () => {
      const searchParamsFolder = await getFolder(searchParams.get("folder"));

      if (currentFolder._id !== searchParamsFolder._id) await openFolder(searchParamsFolder);

      searchParams.delete("folder");
      setSearchParams(searchParams);
    }

    if (searchParams.get("folder") && currentFolder) openFolderFromURL();
  }, [searchParams, currentFolder]);

  const myDialogsProps = {
    dialogOpen,
    setDialogOpen,
    handleUpdateData,
    handleCreateNewFolder,
    changingDataName,
    setChangingDataName,
    creatingFolder,
    setCreatingFolder,
    handleDeleteData
  }

  const cardProps = {
    setFileStatus,
    handleOpeningDialog,
    updateDataShown,
    updateFilesStorage,
    isHovered,
    setIsHovered,
    dataShown,
    setDataShown,
    filesViewType,
    handleActiveFolders,
    openFolder
  }

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleSubmit(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <>
      <div className="cloud-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          <div className="myfiles-navbar flex items-center justify-between p-[15px]">
            <div className="folders-path">
              <Breadcrumb>
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
            <div className="flex gap-2">
              <Button
                size="icon"
                className={`rounded-full ${filesViewType === "list" && "opacity-80"}`}
                onClick={() => handleActiveFilesView("list")}
              >
                <List />
              </Button>
              <Button
                size="icon"
                className={`rounded-full ${filesViewType === "grid" && "opacity-80"}`}
                onClick={() => handleActiveFilesView("grid")}
              >
                <LayoutGrid />
              </Button>
            </div>
          </div>

          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                {...getRootProps()}
                className={`files-wrapper ${isDragActive && "border-dashed border-2 border-indigo-500"}`}
              >
                <span className={`drag-drop-info text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 ${isDragActive ? "block" : "hidden"}`}>
                  Drop files here...
                </span>

                <div className={`files flex-row flex-wrap ${isDragActive && "opacity-50"}`}>
                  {dataLoaded === true ? (
                    dataShown.length > 0 ? (
                      dataShown.map((data) => (
                        data.type == "file" ? (
                          <MyFileCard key={data._id} {...cardProps} file={data} />
                        ) : (
                          <MyFolderCard key={data._id} {...cardProps} folder={data} />
                        )
                      ))
                    ) : (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 justify-center">
                        No Files...
                        <Button variant="outline_red" onClick={() => navigate("/cloud/files/upload")}>Upload Files</Button>
                        Or Right click here
                      </div>
                    )
                  ) : (
                    <Loading />
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem className="gap-2" onClick={() => handleOpeningDialog(null, "createFolder")}><FolderPlus />Utwórz katalog</ContextMenuItem>
              <ContextMenuItem disabled className="gap-2"><FilePlus />Nowy plik tekstowy</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2"><ArrowDownNarrowWide />SORTUJ</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem disabled>Nazwa</ContextMenuItem>
                  <ContextMenuItem disabled>Rodzaj</ContextMenuItem>
                  <ContextMenuItem disabled>Data Dodania</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem className="gap-2" onClick={() => fileRef.current && fileRef.current.click()}><FileUp />Wgraj Plik</ContextMenuItem>
              <ContextMenuItem disabled className="gap-2"><FolderUp />Wgraj Katalog</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>

      <input {...getInputProps()} ref={fileRef} id="inputfile" name="inputfile" type="file" className="w-[0.1px] h-[0.1px] opacity-0 absolute" />

      <MyDialogs {...myDialogsProps} />
    </>
  )
}

export default MyFiles