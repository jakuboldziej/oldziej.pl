import { Button } from '@/components/ui/shadcn/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Grip, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Loading from '../../Home/Loading';
import { getFtpUsers, getStatisticsUsersFilesCreated, getStatisticsUsersFoldersCreated } from '@/lib/fetch';

function CloudUsersTable({ props }) {
  const { refreshingData, setRefreshingData } = props;
  const navigate = useNavigate();

  const [cloudUsers, setCloudUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCloudUsers = async () => {
    setIsLoading(true);
    try {
      const resUsers = await getFtpUsers();

      const updatedUsers = await Promise.all(resUsers.map(async (resUser) => {
        const fetchedFilesCount = await getStatisticsUsersFilesCreated(resUser._id);
        const fetchedFolders = await getStatisticsUsersFoldersCreated(resUser._id);

        return {
          ...resUser,
          filesCount: fetchedFilesCount,
          foldersCount: fetchedFolders
        };
      }));

      setCloudUsers(updatedUsers);
    } catch (err) {
      console.error('Error fetching', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || cloudUsers === null) {
      fetchCloudUsers();
      setRefreshingData(false);
    }
  }, [refreshingData, cloudUsers]);

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
              <TableHead>Main folder ID</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Folders</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cloudUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user._id}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.main_folder}</TableCell>
                <TableCell>{user.filesCount}</TableCell>
                <TableCell>{user.foldersCount}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5'>
                      <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/user/${user.displayName}`)}><User height={20} /> Profile</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}

export default CloudUsersTable