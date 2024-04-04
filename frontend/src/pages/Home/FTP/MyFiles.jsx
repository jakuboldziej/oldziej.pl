import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FilesContext } from "@/context/FilesContext";
import { useContext, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileDown, FileText, Heart, HeartOff, Info, Mic, Move, PencilLine, Search, Trash2, Video } from 'lucide-react';
import { mongodbApiUrl, updateFile } from "@/fetch";
import { handleFileTypes, renderFile } from "@/components/FTP/utils";
import MyDialog from "@/components/MyComponents/MyDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-select";
import { Input } from "postcss";

function MyFiles() {
  const { files } = useContext(FilesContext);

  const [isHovered, setIsHovered] = useState({
    heart: false
  })
  const [dialogOpen, setDialogOpen] = useState({
    file: null,
    changeFileName: false,
    showInfo: false
  });
  const [changingFileName, setChangingFileName] = useState('');


  const fileDynamicStyle = (file) => {
    console.log(file);
    const isImage = file.contentType.startsWith('image/');
    const imageUrl = `${mongodbApiUrl}/ftp/files/render/${file.filename}`;

    return {
      backgroundImage: isImage ? `url(${imageUrl})` : null,
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
      // updateAllFiles(updatedFiles);
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
    // updateAllFiles(updatedFiles);
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
    // updateAllFiles(updatedFiles);
  }

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          {files && files.map((file) => (
            <Card key={file._id} className="card relative flex justify-center items-center" style={fileDynamicStyle(file)}>
              <CardContent>
                {handleFileTypes([file]).fileDocuments.length > 0 ? <FileText width={100} height={100} /> : (
                  handleFileTypes([file]).fileVideos.length > 0 ? <Video width={100} height={100} /> : (
                    handleFileTypes([file]).fileAudios.length > 0 ? <Mic width={100} height={100} /> : null
                  )
                )}
                <div className="absolute flex items-center justify-center text-sm bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 rounded-xl p-0.5 text-ellipsis overflow-hidden w-30 h-10">
                  {file.filename}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="absolute right-1 bottom-1 rounded-full bg-slate-500 hover:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis hover:cursor-pointer"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => renderFile(file.filename)} className='gap-2'><Search /> Podgląd</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadFile(file.filename)} className='gap-2'><FileDown /> Pobierz</DropdownMenuItem>
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
          ))}
        </div>
      </div>

      <MyDialog dialogOpen={dialogOpen.changeFileName} setDialogOpen={setDialogOpen} title="Change File Name" footer={
        <>
          <Button onClick={() => setDialogOpen((prev) => ({ ...prev, changeFileName: false }))} variant='secondary'>Cancel</Button>
          <Button onClick={handleUpdateFile} variant='outline_green'>Save</Button>
        </>
      }>
        <span className='flex flex-col gap-2'>
          <Label>Original name: {dialogOpen.file?.metadata.originalFileName}</Label>
          <Input placeholder={dialogOpen.file?.filename} value={changingFileName} onChange={(e) => setChangingFileName(e.target.value)} />

        </span>
      </MyDialog>

      <MyDialog dialogOpen={dialogOpen.showInfo} setDialogOpen={setDialogOpen} title={`${dialogOpen.file?.filename}`}>
        <Card>
          <CardHeader>
            Ścieżka:
            <CardDescription>Folder {'>'} {dialogOpen.file?.filename}</CardDescription>
          </CardHeader>
        </Card>
        <div className='p-4 flex gap-40'>
          <div>
            <span className='text-slate-400'>Rozmiar:</span> <br /> 
            3KB
          </div>
          <div>
            <span className='text-slate-400'>Ostatnia zmiana:</span> <br />
            {new Date(dialogOpen.file?.lastModified).toLocaleString()}
          </div>
        </div>
        <div className='p-4 py-0'>
            <span className='text-slate-400'>Data Dodania:</span> <br />
            {new Date(dialogOpen.file?.uploadDate).toLocaleString()}
          </div>
      </MyDialog>
    </>
  )
}

export default MyFiles