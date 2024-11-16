import LeftNavBar from "@/components/Home/Cloud/LeftNavBar"
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/shadcn/form'
import { Label } from '@/components/ui/shadcn/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { FileUp } from 'lucide-react'
import { z } from "zod"
import { useDropzone } from 'react-dropzone'

function UploadFiles() {
  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

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
      </div>
    </div>
  )
}

export default UploadFiles