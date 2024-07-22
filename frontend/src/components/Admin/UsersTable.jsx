import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { deleteAuthUser, deleteDartsUser, deleteFolder, deleteFtpUser, getAuthUsers, getFtpUser } from '@/fetch';
import { Eye, Grip, Loader2, Trash, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

function UsersTable() {
  const [authUsers, setAuthUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleDialogOpen = (user) => {
    setDialogOpen(true);
    setSelectedUser(user);
  }

  const handleDeleteUser = async () => {
    const ftpUser = await getFtpUser(selectedUser.displayName);
    await deleteFolder(ftpUser.main_folder);

    await deleteDartsUser(selectedUser.displayName);
    await deleteFtpUser(selectedUser.displayName);
    await deleteAuthUser(selectedUser.displayName);
    setDialogOpen(false);
    setAuthUsers((prev) => prev.filter((user) => user.displayName !== selectedUser.displayName));
  }

  useEffect(() => {
    const fetchAuthUsers = async () => {
      try {
        setAuthUsers(await getAuthUsers());
        setIsLoading(false);
      } catch (err) {
        console.log('Error fetching', err);
        setIsLoading(false);
      }
    }
    fetchAuthUsers();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center w-100 pt-3">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>DisplayName</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user._id}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><User height={20} />Profile</DropdownMenuItem>
                      <DropdownMenuItem><Eye height={20} />Hide</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDialogOpen(user)}><Trash height={20} /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>Delete {selectedUser?.displayName}</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.displayName} with Darts and Cloud account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_red' onClick={handleDeleteUser}>Delete</Button>
            <Button variant='outline_green' onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UsersTable