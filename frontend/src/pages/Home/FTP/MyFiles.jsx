import LeftNavBar from "@/components/FTP/LeftNavBar";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { FilesContext } from "@/context/FilesContext";
import { useContext, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileDown, Heart, HeartOff, Info, Move, PencilLine, Search, Trash2 } from 'lucide-react';

function MyFiles() {
  const { files } = useContext(FilesContext);

  const [isHovered, setIsHovered] = useState({
    heart: false
  })

  useEffect(() => {
    console.log(files);
  }, []);

  return (
    <>
      <NavBar />
      <div className="ftp-wrapper text-white">
        <LeftNavBar />
        <div className="main my-files">
          {files && files.map((file) => (
            <Card key={file._id} className="card relative">
              <CardContent>
                asdf
              </CardContent>
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
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

export default MyFiles