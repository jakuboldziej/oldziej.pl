import NavBar from '@/components/NavBar'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from 'react'
import { deleteFile, getFile, getFtpUser, mongodbApiUrl, uploadFile } from '@/fetch'
import ShowNewToast from '@/components/MyComponents/ShowNewToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { handleCountFileTypes, formatElapsedTime, formatFileSize, handleSameFilename, calcStorageUsage, renderFile, downloadFile } from '@/components/FTP/utils'
import { File, FileDown, FileUp, Heart, Images, Info, Loader2, Mic, Move, PencilLine, Plus, Search, Trash2, Video } from 'lucide-react'
import LeftNavBar from '@/components/FTP/LeftNavBar'
import { FilesContext } from '@/context/FilesContext'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AuthContext } from '@/context/AuthContext'

function FtpPage() {
  document.title = "Oldziej | Cloud";
  const { files, setFiles } = useContext(FilesContext);
  const { currentUser } = useContext(AuthContext);

  const [recentFiles, setRecentFiles] = useState([]);
  const [recentlyUploadedFile, setRecentlyUploadedFile] = useState(null);
  const [countFileTypes, setCountFileTypes] = useState(() => handleCountFileTypes(files));
  const [fileStatus, setFileStatus] = useState({
    uploading: false,
    downloading: false,
    uploaded: false,
    downloaded: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register("file");

  const handleSubmit = async (event) => {
    setFileStatus((prev) => ({ ...prev, uploading: true }));
    setElapsedTime(0);

    try {
      let file = event.target.files[0];
      file = await handleSameFilename(file, files);

      const ftpUser = await getFtpUser(currentUser.displayName);
      console.log(ftpUser);

      const formData = new FormData();
      formData.append('file', file)
      // formData.append('userId', ftpUser.displayName)
      console.log(file);

      const response = await uploadFile(formData);
      setRecentlyUploadedFile(response.file);
    } catch (error) {
      ShowNewToast("Error uploading file", error, "warning")
    } finally {
      event.target.value = ""
      setFileStatus((prev) => ({ ...prev, uploading: false, uploaded: true }));
    }
  };

  const handleDownloadFile = (filename) => {
    downloadFile(filename);
  }

  const handleDeleteImage = async (id) => {
    const response = await deleteFile(id);
    if (response.ok) {
      ShowNewToast("File Update", `File has been deleted.`)
    }
  }

  useEffect(() => {
    if (!fileStatus.uploading) return;

    const intervalId = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1000);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fileStatus.uploading]);

  // useEffect(() => {
  //   if (fileStatus.uploading) {
  //     ShowNewToast("Uploading...", "Uploading file.");
  //   } else if (fileStatus.uploaded) {
  //     ShowNewToast("File Uploaded", `${recentlyUploadedFile.filename} uploaded in ${formatElapsedTime(elapsedTime)}`);
  //     setFileStatus((prev) => ({ ...prev, uploaded: false }));
  //   }

  //   if (fileStatus.downloading) {
  //     ShowNewToast("Downloading...", "Downloading file.");
  //   } else if (fileStatus.downloaded) {
  //     ShowNewToast("File Downloaded", `${recentlyUploadedFile.filename} downloaded in ${formatElapsedTime(elapsedTime)}`);
  //     setFileStatus((prev) => ({ ...prev, downloaded: false }));
  //   }

  // }, [fileStatus]);

  useEffect(() => {
    const updateRecentFiles = async () => {
      console.log(recentlyUploadedFile);
      const fileRes = await getFile(recentlyUploadedFile.originalFilename);
      console.log(fileRes);
      setRecentFiles((prevFiles) => [fileRes, ...prevFiles])
      localStorage.setItem('files', JSON.stringify([fileRes, ...files]));
      setFiles((prevFiles) => [fileRes, ...prevFiles]);
      setRecentlyUploadedFile(null);
    }
    if (recentlyUploadedFile) updateRecentFiles();

  }, [recentlyUploadedFile]);

  useEffect(() => {
    if (files.length > 0) {
      files.sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      })
      setRecentFiles(files.slice(0, 10))
    }
  }, [files]);

  return (
    <>
      <NavBar />
      <div className='ftp-wrapper flex'>
        <LeftNavBar />
        <div className='main ftp-page text-white w-fit relative'>
          <div className='left-side h-full'>
            <Input disabled placeholder='Search' className='rounded-full' />
            <div className='categories flex flex-col gap-6'>
              <span className='text-3xl'>Categories</span>
              <div className='cards flex gap-5 flex-wrap'>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle><Images /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col'>
                    <span className='text-lg'>Images</span>
                    <span className='text-sm'>{countFileTypes.fileImages} Files</span>
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle><File /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col'>
                    <span>Documents</span>
                    <span className='text-sm'>{countFileTypes.fileDocuments} Files</span>
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle><Video /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col'>
                    <span>Videos</span>
                    <span className='text-sm'>{countFileTypes.fileVideos} Files</span>
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle><Mic /></CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col'>
                    <span>Audio</span>
                    <span className='text-sm'>{countFileTypes.fileAudios} Files</span>
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
            <div className='recent-files flex flex-col gap-6 relative'>
              <span className='text-3xl'>Recent Files ({recentFiles.length})</span>
              <ScrollArea>
                <div className='files w-100 flex flex-col gap-4 '>
                  {recentFiles.length > 0 ? recentFiles.map((file) => (
                    <div key={file._id} className='flex items-center justify-between recent-file bg-slate-700 hover:bg-slate-500 transition duration-75 rounded-lg p-5'>
                      <span>{file.filename}</span>
                      <div className='attrs flex justify-between'>
                        <span>{file.filename.split('.').pop().toUpperCase()} file</span>
                        <span>{formatFileSize(file.length)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/ellipsis.png" alt="ellipsis" className='hover:cursor-pointer' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={()=>renderFile(file.filename)} className='gap-2'><Search /> Podgląd</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=>handleDownloadFile(file.filename)} className='gap-2'><FileDown /> Pobierz...</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='gap-2'><Info />Info</DropdownMenuItem>
                            <DropdownMenuItem className='gap-2'><Heart />Ulubione</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='gap-2'><PencilLine />Zmień nazwę</DropdownMenuItem>
                            <DropdownMenuItem className='gap-2'><Move />Przenieś...</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='gap-2'><Trash2 />Usuń</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )) : (
                    <div className="flex justify-center w-100 pt-3">
                      <Loader2 className="h-10 w-10 animate-spin" />
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
              <div className='bg-slate-600 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-2xl p-5 flex flex-col gap-3'>
                <span>Your Storage</span>
                <div className='text-sm'>
                </div>
              </div>
              <div className='bg-slate-600 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-2xl p-5 flex flex-col gap-3 h-fit'>
                <span>Your Shared Folders</span>
                <div className='shared-folders flex flex-col gap-4'>
                  <div className='h-10 rounded-full bg-red-400'>
                  </div>
                  <div className='h-10 rounded-full bg-blue-400'>
                  </div>
                  <div className='h-10 rounded-full bg-green-400'>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FtpPage