import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/shadcn/form'
import { Label } from '@/components/ui/shadcn/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { FileUp, Loader2 } from 'lucide-react'
import { z } from "zod"
import { useDropzone } from 'react-dropzone'
import { useContext, useState } from "react"
import { AuthContext } from "@/context/Home/AuthContext"
import { FtpContext } from "@/context/Home/FtpContext"
import { getFtpUser, uploadFile } from "@/lib/fetch"
import { handleSameFilename } from "@/components/Home/Cloud/utils"
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast"

function UploadFiles() {
  const { currentUser } = useContext(AuthContext);
  const { files, setFiles } = useContext(FtpContext);
  const [isUploading, setIsUploading] = useState(false);

  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      file = handleSameFilename(file, files);
      const ftpUser = await getFtpUser(currentUser.displayName);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', ftpUser._id);
      formData.append('lastModified', file.lastModified);
      formData.append('folder', ftpUser.main_folder);

      const response = await uploadFile(formData);

      if (response.file) {
        setFiles(prev => prev ? [response.file, ...prev] : [response.file]);
      }

      ShowNewToast("File Uploaded", `${file.name} was successfully uploaded.`);
    } catch (error) {
      ShowNewToast("Error uploading file", error.message, "warning");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0 && !isUploading) {
      handleUpload(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="cloud-wrapper text-white">
      <LeftNavBar />
      <div className="main upload-files container-no-nav flex justify-center">
        <Form {...form}>
          <form className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className='mini-wrapper'>
                  <FormControl>
                    <div
                      {...getRootProps()}
                      className={`mini-wrapper bg-slate-600 hover:bg-slate-500 transition duration-75 rounded-2xl ${isDragActive && 'border-dashed border-2 border-indigo-500'} ${isUploading && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <input {...getInputProps()} />
                      <Label className={`label rounded-2xl flex flex-col items-center justify-center ${!isUploading && 'hover:cursor-pointer'}`} htmlFor="picture">
                        {isUploading ? (
                          <Loader2 className="w-[120px] h-[120px] animate-spin" />
                        ) : (
                          <FileUp className='w-[120px] h-[120px]' />
                        )}
                        <span className="text-2xl mt-4">
                          {isUploading
                            ? 'Uploading...'
                            : isDragActive
                              ? 'Drop files here'
                              : 'Add new files'}
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
      </div>
    </div>
  )
}

export default UploadFiles