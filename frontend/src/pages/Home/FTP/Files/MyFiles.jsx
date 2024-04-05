import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { FilesContext } from "@/context/FilesContext";
import { useContext, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowDownNarrowWide, FileArchive, FileDown, FilePlus, FileText, FileUp, FolderPlus, FolderUp, Heart, HeartOff, Info, Loader2, Mic, Move, PencilLine, Search, SquareArrowDown, Trash2, Video } from 'lucide-react';
import { deleteFile, mongodbApiUrl, updateFile } from "@/fetch";
import { downloadFile, handleFileTypes, renderFile } from "@/components/FTP/utils";
import { Button } from "@/components/ui/button";
import ShowNewToast from "@/components/MyComponents/ShowNewToast";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import FileOptionsDialogs from "@/components/FTP/FileOptionsDialogs";

function MyFiles() {
  const { files, setFiles } = useContext(FilesContext);

  const navigate = useNavigate();

  const [filesShown, setFilesShown] = useState([])
  const [isHovered, setIsHovered] = useState({
    heart: false
  })
  const [dialogOpen, setDialogOpen] = useState({
    file: null,
    changeFileName: false,
    showInfo: false
  });
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [changingFileName, setChangingFileName] = useState('');


  const fileDynamicStyle = (file) => {
    const isImage = file.contentType.startsWith('image/');
    const imageUrl = `url(${mongodbApiUrl}/ftp/files/render/${encodeURI(file.filename.trim())})`;

    if (isImage) console.log(imageUrl);

    return {
      backgroundImage: isImage ? imageUrl : "url('elo')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  const handleDownloadFile = async (filename) => {
    setFileStatus((prev) => ({ ...prev, downloading: filename }));
    await downloadFile(filename);
    setFileStatus((prev) => ({ ...prev, downloading: false }));
  }

  const handleDeleteImage = async (file) => {
    const response = await deleteFile(file._id);
    if (response.ok) {
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
    }
  }

  const handleUpdateFile = async () => {
    const file = dialogOpen.file;
    const newFileName = changingFileName;
    const data = {
      file: file,
      newFileName: newFileName
    }
    const updatedFile = await updateFile(data);
    const updatedFiles = files.map((f) => {
      if (f.filename === file.filename) {
        f = updatedFile;
      }
      return f;
    });
    updateAllFiles(updatedFiles);
    setDialogOpen((prev) => ({ ...prev, changeFileName: false }));
  }

  const handleFavoriteFile = async (file) => {
    setIsHovered((prev) => ({ ...prev, heart: false }))
    file.favorite = !file.favorite;

    const updatedFile = await updateFile({ file });
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
    if (files) {
      files.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      })
    }
    setFilesShown(files);
  }, [files]);

  const fileOptionsDialogsProps = {
    dialogOpen,
    setDialogOpen,
    handleUpdateFile,
    changingFileName,
    setChangingFileName
  }

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="files">
                {files ? (
                  filesShown.length > 0 ? (
                    filesShown.map((file) => (
                      <Card key={file._id} className="card relative flex justify-center items-center" style={fileDynamicStyle(file)} title={file.filename}>
                        <CardContent>
                          {handleFileTypes([file]).fileDocuments.length > 0 ? <FileText width={100} height={100} /> : (
                            handleFileTypes([file]).fileVideos.length > 0 ? <Video width={100} height={100} /> : (
                              handleFileTypes([file]).fileAudios.length > 0 ? <Mic width={100} height={100} /> : null
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
                              <DropdownMenuItem onMouseLeave={() => setIsHovered((prev) => ({ ...prev, heart: false }))} onMouseEnter={() => setIsHovered((prev) => ({ ...prev, heart: true }))} onClick={() => handleFavoriteFile(file)} className='gap-2'>
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
                    <div className="flex justify-center w-100 pt-3">
                      <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                  )
                ) : (
                  <div className='flex flex-col items-center gap-2 justify-center w-100 pt-12'>
                    No Files...
                    <Button variant="outline_red" onClick={() => navigate("/ftp/files/upload")}>Upload Files</Button>
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem className="gap-2"><FolderPlus />Utwórz katalog</ContextMenuItem>
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
              <ContextMenuItem className="gap-2"><FileUp />Wgraj Plik</ContextMenuItem>
              <ContextMenuItem className="gap-2"><FolderUp />Wgraj Katalog</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>

      <FileOptionsDialogs {...fileOptionsDialogsProps} />
    </>
  )
}

export default MyFiles