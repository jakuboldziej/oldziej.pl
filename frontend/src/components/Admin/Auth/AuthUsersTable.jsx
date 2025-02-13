import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getAuthUsers, handleDeleteAuthUser, patchAuthUser } from '@/lib/fetch';
import { Copy, Grip, ShieldCheck, ShieldOff, Trash, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import CopyTextButton from '../../Home/CopyTextButton';
import MyTooltip from '../../Home/MyComponents/MyTooltip';
import { socket } from '@/lib/socketio';
import Loading from '../../Home/Loading';

function AuthUsersTable({ props }) {
  const { refreshingData, setRefreshingData } = props;
  const navigate = useNavigate();

  const [authUsers, setAuthUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleDialogOpen = (user) => {
    setDialogOpen(true);
    setSelectedUser(user);
  }

  const handleDeleteUser = async () => {
    await handleDeleteAuthUser(selectedUser);
    setAuthUsers((prev) => prev.filter((user) => user.displayName !== selectedUser.displayName));
    setDialogOpen(false);
  }

  const handleVerified = async (user) => {
    user.verified = !user.verified;
    await patchAuthUser(user);
    setAuthUsers((prev) => prev.map((aUser) => aUser.displayName === user.displayName ? user : aUser));

    socket.emit("verifyEmailAdmin", JSON.stringify({
      userDisplayName: user.displayName,
      verified: user.verified
    }));
  }

  const fetchAuthUsers = async () => {
    setIsLoading(true);
    try {
      const resUsers = await getAuthUsers();
      setAuthUsers(resUsers);
    } catch (err) {
      console.error('Error fetching', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || authUsers === null) {
      fetchAuthUsers();
      setRefreshingData(false);
    }
  }, [refreshingData, authUsers]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>DisplayName</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Friends Code</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user._id}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    {user.friendsCode}
                    <CopyTextButton textToCopy={user.friendsCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
                      <MyTooltip title="Copy code to clipboard">
                        <Copy height={15} />
                      </MyTooltip>
                    </CopyTextButton>
                  </div>
                </TableCell>
                <TableCell>{user.online ? "Yes" : "No"}</TableCell>
                <TableCell>{user.verified ? "Yes" : "No"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5'>
                      <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/user/${user.displayName}`)}><User height={20} /> Profile</DropdownMenuItem>
                      {user.verified === false ? (
                        <DropdownMenuItem onClick={() => handleVerified(user)}><ShieldCheck height={20} /> Verify</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleVerified(user)}><ShieldOff height={20} /> Disprove</DropdownMenuItem>
                      )}
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
            <DialogDescription className='text-center text-xl'>
              Are you sure you want to delete {selectedUser?.displayName} with Darts and Cloud account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_green' onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='outline_red' onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AuthUsersTable