import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getFiles, getFolders, getFtpUser } from '@/lib/fetch';
import { Grip, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Loading from '../../Home/Loading';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { formatDataSize } from '@/components/Home/Cloud/utils';

function CloudFoldersTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [folders, setFolders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleDialogOpen = (folder) => {
    setDialogOpen(true);
    setSelectedFolder(folder);
  }

  const handleDeleteFolder = async () => {
    // await deleteDartsGame(selectedFolder._id);
    // setDialogOpen(false);
    // setFolders((prev) => prev.filter((folder) => folder.displayName !== selectedFolder.displayName));
  }

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const fetchedFolders = await getFolders();
      const foldersWithOwners = await Promise.all(
        fetchedFolders.map(async (folder) => {
          const owner = await getFtpUser(folder.ownerId);

          return {
            ...folder,
            ownerName: owner.displayName,
          };
        })
      );

      setFolders(foldersWithOwners.reverse());
    } catch (err) {
      console.error('Error fetching', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || folders === null) {
      fetchFolders();
      setRefreshingData(false);
    }
  }, [refreshingData, folders]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Upload date</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Folders</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead>Favorite</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((folder) => (
              <TableRow key={folder._id}>
                <TableCell>{folder._id}</TableCell>
                <TableCell>{folder.name}</TableCell>
                <TableCell>{folder.ownerName}</TableCell>
                <TableCell>
                  <MyTooltip title={new Date(folder.uploadDate).toLocaleString()}>
                    <span className="timedate">{new Date(folder.uploadDate).toLocaleDateString()}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>
                  <MyTooltip title={folder.files.map((file) => file).join(', ')}>
                    <span className="timedate">{folder.files.length}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>
                  <MyTooltip title={folder.folders.map((folder) => folder).join(', ')}>
                    <span className="timedate">{folder.folders.length}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>
                  <MyTooltip title={folder.shared.map((folder) => folder).join(', ')}>
                    <span className="timedate">{folder.shared.length}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>{folder.favorite ? "Yes" : "No"}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5'>
                      <DropdownMenuLabel>{folder._id}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDialogOpen(folder)}><Trash height={20} /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table >
      )}
      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>Delete {selectedFolder?.displayName}</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription>
              Are you sure you want to delete: {selectedFolder?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_red' onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='outline_green' onClick={handleDeleteFolder}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CloudFoldersTable