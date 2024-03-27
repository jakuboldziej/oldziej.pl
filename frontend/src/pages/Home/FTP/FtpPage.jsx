import NavBar from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from 'react-router'
import { useEffect, useState } from 'react'

function FtpPage() {
  const [images, setImages] = useState([]);

  const formSchema = z.object({
    file: z.instanceof(FileList).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register("file");

  const onSubmit = async (values) => {
    const file = values["file"][0];
    const formData = new FormData();
    formData.append('file', file)

    const response = await fetch(`/api/ftp/upload`, {
      method: "POST",
      body: formData
    });
    console.log(response.json());
  };

  useEffect(() => {
    const getImages = async () => {
      const response = await fetch("/api/ftp/files", {
        method: "GET"
      })
      const data = await response.json();
      setImages(data.files);
    }
    getImages()
  }, []);

  useEffect(() => {
    {images && images.forEach((image) => {
      console.log("/api/ftp/files" + image.filename);
    })}
  }, [images]);

  return (
    <>
      <NavBar />
      <div className='wrapper flex'>
        <div className='left-navbar flex flex-col items-center gap-10 pt-10'>
          <b className='text-xl'>File Storage</b>
          <div className='tiles w-full h-full relative'>
            <div className='tile'>My Files</div>
            <div className='tile'>Shared Files</div>
            <div className='tile'>Favorites</div>
            <div className='tile'>Upload Files</div>
            <div className='tile absolute bottom-0 w-full'>Settings</div>
          </div>
        </div>
        <div className='main text-white w-fit'>
          <div className='left-side border'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>file</FormLabel>
                      <FormControl>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="picture">Picture</Label>
                          <Input id="picture" type="file" {...fileRef} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
            <div>
              {images.length > 0 && images.forEach((image) => (
                <img src={`/api/ftp/files/${image.filename}`} />
              ))}
            </div>
          </div>
          <div className='right-side border'>
            right side
          </div>
        </div>
      </div>
    </>
  )
}

export default FtpPage