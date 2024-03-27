import NavBar from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from 'react'
import { deleteFile, getFile, getFiles, mongodbApiUrl, uploadFile } from '@/fetch'
import ShowNewToast from '@/components/MyComponents/ShowNewToast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { handleSameFilename } from '@/components/FTP/utils'

function FtpPage() {
  document.title = "Oldziej | Cloud";
  const [recentFiles, setRecentFiles] = useState([]);
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false);
  const [recentlyUploadedFile, setRecentlyUploadedFile] = useState(null);

  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register("file");

  const handleSubmit = async (event) => {
    setUploading(true);
    try {
      let file = event.target.files[0];
      file = await handleSameFilename(file, files);

      const formData = new FormData();
      formData.append('file', file)

      const response = await uploadFile(formData);
      setRecentlyUploadedFile(response.file);
    } catch (error) {
      ShowNewToast("Error uploading file", error, "warning")
    } finally {
      event.target.value = ""
      setUploading(false)
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getFiles();
      if (response) {
        setFiles(response.files)
      } else {
        setFiles([])
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const updateRecentFiles = async () => {
      const fileRes = (await getFile(recentlyUploadedFile.filename))[0];
      setRecentFiles((prevFiles) => [fileRes, ...prevFiles])
      setFiles((prevFiles) => [fileRes, ...prevFiles])
    }
    if (recentlyUploadedFile) updateRecentFiles();

  }, [recentlyUploadedFile]);

  useEffect(() => {
    if (files.length > 0) {
      setRecentFiles(files.slice().sort((a, b) => {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      }))
    }
  }, [files]);

  useEffect(() => {
    if (uploading === true) {
      ShowNewToast("Uploading...", "Uploading file.")
    } else if (uploading === false && recentlyUploadedFile) {
      ShowNewToast("File Uploaded", `File ${recentlyUploadedFile.originalname} uploaded.`);
    }
  }, [uploading]);

  const handleDeleteImage = async (id) => {
    const response = await deleteFile(id);
    if (response.ok) {
      ShowNewToast("File Update", `File has been deleted.`)
    }
  }

  return (
    <>
      <NavBar />
      <div className='wrapper flex'>
        <div className='left-navbar flex flex-col items-center gap-10 pt-10'>
          <Link href='/ftp' className='text-xl hover:opacity-70'>File Storage</Link>
          <div className='tiles w-full h-full relative'>
            <Link href='/ftp/files' className='tile'>My Files</Link>
            <div className='tile'>Shared Files</div>
            <div className='tile'>Favorites</div>
            <div className='tile'>Upload Files</div>
            <div className='tile absolute bottom-0 w-full'>Settings</div>
          </div>
        </div>
        <div className='main text-white w-fit relative'>
          <div className='left-side h-full'>
            <Input disabled placeholder='Search' className='rounded-full' />
            <div className='categories flex flex-col gap-6'>
              <span className='text-3xl'>Categories</span>
              <div className='cards flex gap-5 flex-wrap'>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Pictures
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Documents
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Videos
                  </CardContent>
                </Card>
                <Card className='category rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Audio
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className='folders flex flex-col gap-6'>
              <span className='text-3xl'>Folders</span>
              <div className='cards flex gap-5 flex-wrap'>
                <Card className='folder rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Pictures
                  </CardContent>
                </Card>
                <Card className='folder rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Documents
                  </CardContent>
                </Card>
                <Card className='folder rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Videos
                  </CardContent>
                </Card>
                <Card className='folder rounded-xl'>
                  <CardHeader>
                    <CardTitle>Ikona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Audio
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className='recent-files flex flex-col gap-6 relative'>
              <span className='text-3xl'>Recent Files</span>
              <ScrollArea>
                <div className='files w-100 flex flex-col gap-4 '>
                  {recentFiles.length > 0 && recentFiles.map((file) => (
                    <div key={file._id} className='recent-file bg-slate-700 hover:cursor-pointer hover:bg-slate-500 transition duration-75 rounded-lg p-5'>
                      {file.filename}
                    </div>
                  ))}
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
                              <img width="120" height="120" src="https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/100/external-file-download-network-and-communication-smashingstocks-glyph-smashing-stocks.png" alt="external-file-download-network-and-communication-smashingstocks-glyph-smashing-stocks" />
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
                  75 GB used out of 100 GB
                </div>
                <Progress value={75} />
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