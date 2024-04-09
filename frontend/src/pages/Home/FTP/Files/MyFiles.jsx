import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { FtpContext } from "@/context/FtpContext";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowDownNarrowWide, FilePlus, FileUp, FolderPlus, FolderUp, Loader2 } from 'lucide-react';
import { getFile, getFolder, getFtpUser, postFolder, putFile, putFolder, uploadFile } from "@/fetch";
import { addFolderToFolder, formatElapsedTime, handleSameFilename } from "@/components/FTP/utils";
import { Button } from "@/components/ui/button";
import ShowNewToast from "@/components/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import MyDialogs from "@/components/FTP/MyDialogs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import MyFileCard from "@/components/FTP/MyFileCard";
import MyFolderCard from "@/components/FTP/MyFolderCard";

function MyFiles() {
  const { folders, setFolders, files, setFiles, currentFolder, setCurrentFolder } = useContext(FtpContext);
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
      file = handleSameFilename(file, currentFolder.files);

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
    }
  }

  const handleBreadcrumbClick = (folder, index) => {
    if (index !== 0) {
      // View folder
    }
  }

  const updateAllFiles = async (updatedData) => {
    console.log(updatedData);
    setDataShown(updatedData);
    let updatedFolder = currentFolder;
    if (updatedData) {
      const dataFiles = updatedData.filter((data) => data.type === "file");
      const dataFolders = updatedData.filter((data) => data.type === "folder");
      updatedFolder.files = dataFiles.map((data) => data._id);
      updatedFolder.folders = dataFolders.map((data) => data._id);
    }
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
    // files.map((file) => {
    //   console.log(file);
    // })
    // setFiles(() => {
      // return files.map((file) => {
      // })
    // })
    // localStorage.setItem('files', JSON.stringify(updatedFiles));
  }

  useEffect(() => {
    const updateRecentFiles = async () => {
      const fileRes = await getFile(recentFile._id);

      if (dataShown) {
        const updatedFiles = [...dataShown, fileRes];
        updateAllFiles(updatedFiles);
      }
      else {
        updateAllFiles([fileRes])
      }

      setRecentFile(null);
    }
    if (recentFile) updateRecentFiles();

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
      const filePromises = currentFolder.files.map(async (fileId) => {
        return await getFile(fileId);
      })
      const ftpFiles = await Promise.all(filePromises);

      const folderPromises = currentFolder.folders.map(async (folderId) => {
        return await getFolder(folderId);
      })

      const currentFolderFolders = await Promise.all(folderPromises);
      currentFolderFolders && currentFolderFolders.map((folder) => folder.type = "folder");

      ftpFiles.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      })
      if ([...currentFolderFolders, ...ftpFiles].length !== 0) setDataShown([...currentFolderFolders, ...ftpFiles]);
    }
    if (currentFolder) getData();
  }, []);

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
    currentFolder,
    setCurrentFolder,
    dataShown
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
                {folders.length > 0 && folders.map((folder, i) => (
                  folder.active ? (
                    <BreadcrumbItem key={folder._id} onClick={() => handleBreadcrumbClick(folder, i)} className="hover:cursor-pointer">
                      <BreadcrumbLink>{folder.name}</BreadcrumbLink>
                      {folders.length > 1 && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  ) : null
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
                    Or Right click 
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