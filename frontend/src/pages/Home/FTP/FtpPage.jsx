import NavBar from '@/components/NavBar'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useEffect, useState } from 'react'
import { deleteFile, getFile, getFtpUser, mongodbApiUrl, updateFile, uploadFile } from '@/fetch'
import ShowNewToast from '@/components/MyComponents/ShowNewToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { handleFileTypes, formatElapsedTime, formatFileSize, handleSameFilename, calcStorageUsage, renderFile, downloadFile } from '@/components/FTP/utils'
import { FileDown, FileText, FileUp, Heart, HeartOff, Images, Info, Loader2, Mic, Move, PencilLine, Plus, Search, Share2, Trash2, Video, SquareArrowDown, FileArchive } from 'lucide-react'
import LeftNavBar from '@/components/FTP/LeftNavBar'
import { FilesContext } from '@/context/FilesContext'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CopyTextButton from '@/components/CopyTextButton'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'
import { useNavigate } from 'react-router'
import FileOptionsDialogs from '@/components/FTP/FileOptionsDialogs'

function FtpPage() {
  document.title = "Oldziej | Cloud";
  const { files, setFiles } = useContext(FilesContext);
  const currentUser = useAuthUser();

  const navigate = useNavigate();

  const [recentFiles, setRecentFiles] = useState([]);
  const [recentFile, setRecentFile] = useState(null);
  const [fileTypes, setFileTypes] = useState(() => handleFileTypes(files));
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [changingFileName, setChangingFileName] = useState('');

  const [dialogOpen, setDialogOpen] = useState({
    file: null,
    changeFileName: false,
    showInfo: false
  });
  const [isHovered, setIsHovered] = useState({
    heart: false
  })
  const [currentPage, setCurrentPage] = useState(1);


  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register("file");

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (recentFiles.length > 0) setCurrentPage(currentPage + 1);
    }
  };

  const handleRecentFilesShown = (type, amount) => {
    let recentFilesAmount;
    if (type === "scroll") recentFilesAmount = files.slice(0, 10 * currentPage);
    else if (type === "filter") {
      recentFilesAmount = files.slice(0, amount)
    }
    setRecentFiles(recentFilesAmount);
  };

  useEffect(() => {
    if (files) handleRecentFilesShown("scroll")
  }, [currentPage]);

  const handleSubmit = async (event) => {
    setFileStatus((prev) => ({ ...prev, uploading: true }));
    setElapsedTime(0);

    try {
      let file = event.target.files[0];
      file = await handleSameFilename(file, files);

      const ftpUser = await getFtpUser(currentUser.displayName);

      const formData = new FormData();
      formData.append('file', file)
      formData.append('userDisplayName', ftpUser.displayName)
      formData.append('lastModified', file.lastModified)

      const response = await uploadFile(formData);
      setRecentFile(response.file);
    } catch (error) {
      ShowNewToast("Error uploading file", error, "warning")
    } finally {
      event.target.value = ""
      setFileStatus((prev) => ({ ...prev, uploading: false, uploaded: true }));
    }
  };

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
    const updateRecentFiles = async () => {
      const fileRes = await getFile(recentFile.filename);

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
    if (files) {
      files.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      })
    }
    setFileTypes(handleFileTypes(files));
  }, [files]);

  const updateAllFiles = (updatedFiles) => {
    setRecentFiles(updatedFiles.slice(0, 10 * currentPage));
    setFiles(updatedFiles.length === 0 ? null : updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  }

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
      <div className='ftp-wrapper'>
        <LeftNavBar />
        <div className='main ftp-page text-white'>
          <div className='left-side'>
            <div className='categories flex flex-col gap-6'>
              <span className='text-3xl'>Categories</span>
              <div className='cards flex gap-5 flex-wrap'>
                <Card className='category rounded-xl'>
                  <CardHeader className='card-header'>
                    <CardTitle><Images /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-1'>
                    <span className='text-lg'>Images</span>
                    <span className='text-sm'>{fileTypes.fileImages.length} Files</span>
                    {/* <span className='text-xs'>({calcStorageUsage(fileTypes.fileDocuments)[0]})</span> */}
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader className='card-header'>
                    <CardTitle><FileText /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-1'>
                    <span>Documents</span>
                    <span className='text-sm'>{fileTypes.fileDocuments.length} Files </span>
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader className='card-header'>
                    <CardTitle><Video /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-1'>
                    <span>Videos</span>
                    <span className='text-sm'>{fileTypes.fileVideos.length} Files</span>
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader className='card-header'>
                    <CardTitle><Mic /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-1'>
                    <span>Audio</span>
                    <span className='text-sm'>{fileTypes.fileAudios.length} Files</span>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className='folders flex flex-col gap-6'>
              <span className='text-3xl'>Folders</span>
              <div className='cards flex gap-5 flex-wrap'>
                <Card className='folder rounded-xl flex items-center justify-center'>
                  <Plus />
                </Card>
                {/* <Card className='folder rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Documents
                  </CardContent>
                </Card> */}
              </div>
            </div>
            <div className='recent-files flex flex-col gap-6'>
              <span className='text-3xl'>Recent Files ({recentFiles.length})</span>
              <ScrollArea className='scroll-area' onScroll={handleScroll}>
                <div className='files w-100 flex flex-col flex-wrap gap-4'>
                  {files ? (
                    recentFiles.length > 0 ? (
                      recentFiles.map((file) => (
                        <div key={file.filename} className='flex recent-file items-center justify-between bg-slate-700 hover:bg-slate-500 transition duration-75 rounded-lg p-5'>
                          <span className='filename hover:cursor-pointer hover:underline' onClick={() => renderFile(file.filename)} title={file.filename}>{file.filename}</span>
                          <div className='attrs flex justify-between'>
                            <span>{file.filename.split('.').pop().toUpperCase()} file</span>
                            <span>{formatFileSize(file.length)}</span>
                            <CopyTextButton textToCopy={`${mongodbApiUrl}/ftp/files/render/${file.filename}`}><Share2 /></CopyTextButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
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
                          </div>
                        </div>))
                    ) : (
                      <div className="flex justify-center w-100 pt-3">
                        <Loader2 className="h-10 w-10 animate-spin" />
                      </div>
                    )
                  ) : (
                    <div className='flex flex-col items-center gap-2 justify-center w-100 pt-3'>
                      No Files...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className='right-side'>
            <div className='bg-slate-700 p-4 rounded-2xl h-full flex flex-col gap-4'>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem className='mini-wrapper'>
                        <FormControl>
                          <div className='mini-wrapper bg-slate-600 hover:bg-slate-500 transition duration-75 rounded-2xl'>
                            <Label className='label hover:cursor-pointer rounded-2xl' htmlFor="picture">
                              <FileUp className='w-[120px] h-[120px]' />
                              <span className='text-2xl'>Add new files</span>
                            </Label>
                            <Input onChangeCapture={(e) => handleSubmit(e)} className='inputfile' id="picture" type="file" {...fileRef} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div onClick={() => navigate("/ftp/storage")} className='bg-slate-600 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-2xl p-5 flex flex-col gap-3'>
                <span className='flex justify-between'>
                  <span>Your Storage ({files?.length || 0} Files)</span>
                  <span>{(calcStorageUsage(files)[1])}%</span>
                </span>
                <div className='text-sm'>
                  {calcStorageUsage(files)[0]} used out of 100 GB
                </div>
                <Progress value={calcStorageUsage(files)[1]} />
              </div>
              <div className='bg-slate-600 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-2xl p-5 flex flex-col gap-3 h-fit'>
                <span>Your Shared Folders</span>
                <div className='shared-folders flex flex-col gap-4'>
                  <div className='h-10 rounded-full bg-red-400'>
                  </div>
                  <div className='h-10 rounded-full bg-blue-400'>
                  </div>
                  <div className='h-10 rounded-full bg-green-400 flex justify-center items-center'>
                    + Add More
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FileOptionsDialogs {...fileOptionsDialogsProps} />
    </>
  )
}

export default FtpPage