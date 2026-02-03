import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getFiles, getFtpUser } from '@/lib/fetch';
import { Grip, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Loading from '../../Home/Loading';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { formatDataSize } from '@/components/Home/Cloud/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/shadcn/scroll-area';

function CloudFilesTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDialogOpen = (file) => {
    setDialogOpen(true);
    setSelectedFile(file);
  }

  const handleDeleteFile = async () => {
    // setDialogOpen(false);
    // setFiles((prev) => prev.filter((file) => file.displayName !== selectedFile.displayName));
  }

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedFiles = await getFiles();
      const filesWithOwners = await Promise.all(
        fetchedFiles.map(async (file) => {
          const owner = await getFtpUser(file.ownerId);

          return {
            ...file,
            ownerName: owner.displayName,
          };
        })
      );

      setFiles(filesWithOwners.reverse());
    } catch (err) {
      console.error('Error fetching', err);
    } finally {
      setIsLoading(false);
    }
  }

  const displayMetadata = (metadata) => {
    return Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join(", ");
  }

  useEffect(() => {
    if (refreshingData === true || files === null) {
      fetchFiles();
      setRefreshingData(false);
    }
  }, [refreshingData, files]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full overflow-x-auto">
          <ScrollArea className="h-[700px] w-full">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[100px]">FileId</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className='min-w-[100px]'>Size</TableHead>
                  <TableHead>Folders</TableHead>
                  <TableHead>Upload date</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead>Metadata</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead>Favorite</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file._id}>
                    <TableCell>{file._id}</TableCell>
                    <TableCell>{file.fileId}</TableCell>
                    <TableCell>{file.filename}</TableCell>
                    <TableCell>{file.ownerName}</TableCell>
                    <TableCell>{formatDataSize(file.length)}</TableCell>
                    <TableCell>
                      <MyTooltip title={file.folders.map((folder) => folder).join(', ')}>
                        <span className="timedate">{file.folders.length}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={new Date(file.uploadDate).toLocaleString()}>
                        <span className="timedate">{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={new Date(file.lastModified).toLocaleString()}>
                        <span className="timedate">{new Date(file.lastModified).toLocaleDateString()}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={displayMetadata(file.metadata)}>
                        <span className="timedate">{Object.keys(file.metadata).length}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={file.shared.map((folder) => folder).join(', ')}>
                        <span className="timedate">{file.shared.length}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>{file.favorite ? "Yes" : "No"}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost'><Grip /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mr-5'>
                          <DropdownMenuLabel>{file._id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDialogOpen(file)}><Trash height={20} /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      )}
      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>Delete {selectedFile?.displayName}</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription>
              Are you sure you want to delete: {selectedFile?.filename}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_red' onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='outline_green' onClick={handleDeleteFile}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CloudFilesTable