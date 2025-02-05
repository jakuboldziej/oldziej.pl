import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/shadcn/form'
import { Label } from '@/components/ui/shadcn/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useEffect, useState } from 'react'
import { deleteFile, getFile, getFtpUser, mongodbApiUrl, postFolder, patchFile, renderFile, uploadFile } from '@/lib/fetch'
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card'
import { ScrollArea } from '@/components/ui/shadcn/scroll-area'
import { Progress } from '@/components/ui/shadcn/progress'
import { handleFileTypes, formatElapsedTime, formatDataSize, handleSameFilename, calcStorageUsage, deleteFileFromFolder, addFileToFolder, addFolderToFolder, deleteFolderFromFolder } from '@/components/Home/Cloud/utils'
import { FileText, FileUp, Images, Mic, Plus, Share2, Video, Folder } from 'lucide-react'
import LeftNavBar from '@/components/Home/Cloud/LeftNavBar'
import { FtpContext } from '@/context/Home/FtpContext'
import CopyTextButton from '@/components/Home/CopyTextButton'
import { useNavigate } from 'react-router'
import MyDialogs from '@/components/Home/Cloud/MyDialogs'
import { AuthContext } from '@/context/Home/AuthContext'
import MyTooltip from '@/components/Home/MyComponents/MyTooltip'
import Loading from '@/components/Home/Loading'
import CustomFileDropdown from '@/components/Home/Cloud/CustomFileDropdown'
import { useDropzone } from 'react-dropzone'

function CloudPage() {
  document.title = "Oldziej | Cloud";
  const { folders, setFolders, files, setFiles, setRefreshData } = useContext(FtpContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const [recentFiles, setRecentFiles] = useState([]);
  const [recentFile, setRecentFile] = useState(null);
  const [recentFolders, setRecentFolders] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fileTypes, setFileTypes] = useState(() => handleFileTypes(files));
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [changingDataName, setChangingDataName] = useState('');

  const [creatingFolder, setCreatingFolder] = useState('');

  const [dialogOpen, setDialogOpen] = useState({
    data: null,
    changeDataName: false,
    showInfo: false,
    createFolder: false,
    deleteData: false
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

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (recentFiles.length > 0) setCurrentPage(currentPage + 1);
    }
  };

  const handleRecentFilesShown = (type, amount) => {
    let recentFilesAmount;

    if (type === "scroll") {
      recentFilesAmount = files.slice(0, 10 * currentPage);
      if (recentFilesAmount.length !== recentFiles.length) setRecentFiles(recentFilesAmount);
    }
    else if (type === "filter") {
      recentFilesAmount = files.slice(0, amount);
      setRecentFiles(recentFilesAmount);
    }
  };

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
      if (recentFolders) {
        const updatedrecentFolders = [folderRes, ...recentFolders];
        setRecentFolders(updatedrecentFolders);
      }
      else {
        setRecentFolders([folderRes])
      }

      const mainUserFolder = folders.find((f) => f._id === ftpUser.main_folder);
      let updatedFolders = [...folders];
      const { updatedCurrentFolder, updatedFolder } = await addFolderToFolder(mainUserFolder, folderRes);

      updatedFolders = updatedFolders.map((f) => f._id === updatedCurrentFolder._id ? updatedCurrentFolder : f);
      updatedFolders = [...updatedFolders, updatedFolder];

      setFolders(updatedFolders);

      setDialogOpen((prev) => ({ ...prev, createFolder: false }));
      setCreatingFolder('');
      ShowNewToast("Folder added", `${folderRes.name} created.`);
    }
  }

  const openFolder = async (folderId) => {
    navigate(`files?folder=${folderId}`)
  }

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

  const handleUpdateData = async () => {
    const file = dialogOpen.data;
    const newFileName = changingDataName;
    const data = {
      file: file,
      newFileName: newFileName
    }
    const updatedFile = await patchFile(data);
    const updatedFiles = files.map((f) => f._id === updatedFile._id ? updatedFile : f);

    updateDataShown(updatedFiles);
    setFiles(updatedFiles);
    setDialogOpen((prev) => ({ ...prev, changeDataName: false }));
  }

  const handleDeleteData = async (data) => {
    if (data.type === "folder") {
      await deleteFolderFromFolder(currentFolder, data);

      updateDataShown(recentFiles.filter((f) => f._id !== data._id));
      setFolders((prevFolders) => prevFolders.filter((f) => f._id !== data._id));

      ShowNewToast("Folder Update", `${data.name} has been deleted.`);
      setRefreshData(true);
    } else if (data.type === "file") {
      updateDataShown(recentFiles.filter((f) => f._id !== data._id));
      updateFilesStorage(data, "del");

      ShowNewToast("File Update", `${data.filename} has been deleted.`);
    }

    setDialogOpen((prev) => ({ ...prev, deleteData: false }));
  }

  const updateDataShown = async (updatedFiles) => {
    setRecentFiles(updatedFiles.slice(0, 10 * currentPage));
    setDataLoaded(true);
  }

  const updateFilesStorage = async (file, action) => {
    let updatedFiles;
    let updatedFolders = [...folders];

    if (action === "add") {
      if (!updatedFiles) updatedFiles = [file];
      else updatedFiles.unshift(file);

      const ftpUser = await getFtpUser(currentUser.displayName);
      const mainUserFolder = folders.find((f) => f._id === ftpUser.main_folder);
      const { updatedFolder } = await addFileToFolder(mainUserFolder, file);

      if (!files) updatedFiles = [file];
      else updatedFiles = [file, ...files];

      updatedFolders = updatedFolders.map((f) => f._id === updatedFolder._id ? updatedFolder : f);
    } else if (action === "del") {
      file.folders.map(async (folderId) => {
        let folderObj = updatedFolders.find((f) => f._id === folderId);
        const { updatedFolder } = await deleteFileFromFolder(folderObj, file);

        folderObj = updatedFolder
      });

      updatedFiles = files.filter((f) => f._id !== file._id);

      await deleteFile(file._id);
    }

    setFolders(updatedFolders)
    setFiles(updatedFiles)
  }

  useEffect(() => {
    if (files) handleRecentFilesShown("scroll")
  }, [currentPage]);

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
      const fileRes = await getFile(recentFile._id);

      if (files) {
        const updatedFiles = [fileRes, ...files];
        updateDataShown(updatedFiles);
      }
      else {
        updateDataShown([fileRes])
      }

      updateFilesStorage(fileRes, "add");
      setRecentFile(null);
    }
    if (recentFile) updateRecentFiles();

  }, [recentFile]);

  useEffect(() => {
    if (files) {
      updateDataShown(files);
      setFileTypes(handleFileTypes(files));
    }
  }, [files]);

  useEffect(() => {
    if (folders) {
      let filteredFolders = folders.filter((f) => f.name !== "Cloud drive").reverse().slice(0, 3);
      setRecentFolders(filteredFolders)
    }
  }, [folders]);

  const myDialogsProps = {
    dialogOpen,
    setDialogOpen,
    handleUpdateData,
    changingDataName,
    setChangingDataName,
    handleCreateNewFolder,
    setCreatingFolder,
    handleDeleteData
  }

  const dropdownProps = {
    setFileStatus,
    handleOpeningDialog,
    updateDataShown,
    updateFilesStorage,
    isHovered,
    setIsHovered,
    dataShown: recentFiles,
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
      <div className='cloud-wrapper'>
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
                    {/* <span className='text-xs'>({calcStorageUsage(fileTypes.fileDocuments).bytes})</span> */}
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
                {recentFolders && recentFolders.map((folder) => (
                  <Card key={folder._id} className='folder rounded-xl' onClick={() => openFolder(folder._id)}>
                    <CardHeader>
                      <CardTitle><Folder /></CardTitle>
                    </CardHeader>
                    <CardContent>
                      {folder.name}
                    </CardContent>
                  </Card>
                ))}
                <Card onClick={() => handleOpeningDialog(null, "createFolder")} className='folder rounded-xl flex items-center justify-center'>
                  <Plus />
                </Card>
              </div>
            </div>
            <div className='recent-files relative flex flex-col gap-6'>
              <span className='text-3xl'>Recent Files ({recentFiles.length})</span>
              <ScrollArea className='scroll-area' onScroll={handleScroll}>
                <div className='files flex flex-col gap-4'>
                  {dataLoaded === true ? (
                    recentFiles.length > 0 ? (
                      recentFiles.map((file) => (
                        <div key={file.filename} className='flex recent-file items-center justify-between bg-slate-700 hover:bg-slate-500 transition duration-75 rounded-lg p-5'>
                          <span className='filename hover:cursor-pointer hover:underline' onClick={() => renderFile(file.filename)} title={file.filename}>{file.filename}</span>
                          <div className='attrs flex justify-evenly items-center'>
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

                            <CustomFileDropdown {...dropdownProps} file={file} />
                          </div>
                        </div>))
                    ) : (
                      <div className='flex flex-col items-center gap-2 justify-center w-100 pt-3'>
                        No Files...
                      </div>
                    )
                  ) : (
                    <Loading />
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className='right-side'>
            <div className='bg-slate-700 p-4 rounded-2xl sm:h-full flex flex-col gap-4'>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem className='mini-wrapper'>
                        <FormControl>
                          <div
                            {...getRootProps()}
                            className={`mini-wrapper bg-slate-600 hover:bg-slate-500 transition duration-75 rounded-2xl ${isDragActive && 'border-dashed border-2 border-indigo-500'}`}
                          >
                            <input {...getInputProps()} />
                            <Label className='label hover:cursor-pointer rounded-2xl' htmlFor="picture">
                              <FileUp className='w-[120px] h-[120px]' />
                              <span className="text-2xl">
                                {isDragActive ? 'Drop files here' : 'Add new files'}
                              </span>
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div onClick={() => navigate("/cloud/storage")} className='bg-slate-600 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-2xl p-5 flex flex-col gap-3'>
                <span className='flex justify-between'>
                  <span>Your Storage <p>({files?.length || 0} Files)</p></span>
                  <span>{(calcStorageUsage(files).percentage)}%</span>
                </span>
                <div className='text-sm'>
                  {calcStorageUsage(files).bytes} used out of 100 GB
                </div>
                <Progress value={calcStorageUsage(files).percentage} />
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

      <MyDialogs {...myDialogsProps} />
    </>
  )
}

export default CloudPage