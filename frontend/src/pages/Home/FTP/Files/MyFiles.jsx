import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { FtpContext } from "@/context/FtpContext";
import { useContext, useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowDownNarrowWide, FileArchive, FileDown, FilePlus, FileText, FileUp, FolderPlus, FolderUp, Heart, HeartOff, Info, Loader2, Mic, Move, PencilLine, Search, SquareArrowDown, Trash2, Video } from 'lucide-react';
import { deleteFile, getFile, getFolder, getFtpUser, mongodbApiUrl, postFolder, putFile, uploadFile } from "@/fetch";
import { deleteFileFromFolder, downloadFile, formatElapsedTime, handleFileTypes, handleSameFilename, renderFile } from "@/components/FTP/utils";
import { Button } from "@/components/ui/button";
import ShowNewToast from "@/components/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import MyDialogs from "@/components/FTP/MyDialogs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'

function MyFiles() {
  const { files, setFiles, folders } = useContext(FtpContext);
  const currentUser = useAuthUser();

  const navigate = useNavigate();

  const [recentFile, setRecentFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState({ files: [] });
  const [currentFolders, setCurrentFolders] = useState([]);
  const [filesShown, setFilesShown] = useState([])
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isHovered, setIsHovered] = useState({
    heart: false
  })
  const [dialogOpen, setDialogOpen] = useState({
    file: null,
    changeFileName: false,
    showInfo: false,
    createFolder: false
  });
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [creatingFolder, setCreatingFolder] = useState('')
  const [changingFileName, setChangingFileName] = useState('');


  const fileDynamicStyle = (file) => {
    return {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  const fileRef = useRef();

  const handleSubmit = async (event) => {
    setFileStatus((prev) => ({ ...prev, uploading: true }));
    setElapsedTime(0);

    try {
      let file = event.target.files[0];
      file = handleSameFilename(file, files);

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

  const handleDownloadFile = (filename) => {
    setFileStatus((prev) => ({ ...prev, downloading: filename }));
    downloadFile(filename);
    setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleDeleteImage = async (file) => {
    const deleteRes = await deleteFile(file._id);
    const deleteUtilRes = await deleteFileFromFolder(currentFolder, file);

    if (deleteRes.ok) {
      let updatedFiles = files.filter((f) => f._id !== file._id);
      updateAllFiles(updatedFiles);
      ShowNewToast("File Update", `${file.filename} has been deleted.`);
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
    const updatedFiles = files.map((f) => {
      if (f.filename === file.filename) {
        f = updatedFile;
      }
      return f;
    });
    updateAllFiles(updatedFiles);
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
      const folder = await postFolder(data);
      console.log(folder);
    }
  }

  const handleFavoriteFile = async (file) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    file.favorite = !file.favorite;

    if (file.favorite) ShowNewToast(`File ${file.filename}`, "Added to favorites.");
    else ShowNewToast(`File ${file.filename}`, "Removed from favorites.");

    const updatedFile = await putFile({ file });
    const updatedFiles = files.map((f) => {
      if (f.filename === file.filename) {
        f = updatedFile;
      }
      return f;
    });
    updateAllFiles(updatedFiles);
  }

  const updateAllFiles = (updatedFiles) => {
    setFilesShown(updatedFiles);
    setFiles(updatedFiles.length === 0 ? null : updatedFiles)
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  }

  useEffect(() => {
    const updateRecentFiles = async () => {
      const fileRes = await getFile(recentFile._id);

      if (files) {
        const updatedFiles = [fileRes, ...files]
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
      const ftpUser = await getFtpUser(currentUser.displayName);
      const ftpFolder = await getFolder(ftpUser.main_folder);
      setCurrentFolders([ftpFolder]);
      setCurrentFolder(ftpFolder);
      const filePromises = ftpFolder.files.map(async (fileId) => {
        const fileRes = await getFile(fileId);
        return fileRes;
      })
      let filesToShow = await Promise.all(filePromises);
      // filesToShow.push(ftpFolder)
      filesToShow.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      })
      setFilesShown(filesToShow);
    }
    getData();
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

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          <div className="folders-path">
            <Breadcrumb className="pt-[24px] pl-[24px]">
              <BreadcrumbList>
                {currentFolders.length > 0 && currentFolders.map((currentFolder) => (
                  <BreadcrumbItem key={currentFolder._id} className="hover:cursor-pointer">
                    <BreadcrumbLink>{currentFolder?.name}</BreadcrumbLink>
                    {currentFolders.length > 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="files">
                {files ? (
                  filesShown.length > 0 ? (
                    filesShown.map((file) => (
                      <Card onDoubleClick={() => renderFile(file.filename)} key={file._id} className="card select-none relative flex justify-center items-center" style={fileDynamicStyle(file)} title={file.filename}>
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
                              <DropdownMenuItem onClick={() => renderFile(file.filename)} className='gap-2'><Search /> Podgląd</DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2">
                                  <FileDown />
                                  <span>Pobierz...</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleDownloadFile(file.filename)} className='gap-2'><SquareArrowDown /> Standardowe</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadFile(file.filename)} className='gap-2'><FileArchive /> Jako ZIP</DropdownMenuItem>
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
                                Ulubione
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpeningDialog(file, "changeFileName")} className='gap-2'><PencilLine />Zmień nazwę</DropdownMenuItem>
                              <DropdownMenuItem disabled className='gap-2'><Move />Przenieś...</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteImage(file)} className='gap-2'><Trash2 />Usuń</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardContent>
                      </Card>
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