import { Button } from '@/components/ui/shadcn/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getDartsUsers, putDartsUser } from '@/lib/fetch';
import { Eye, EyeOff, Grip } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { totalThrows } from '../../Home/Darts/game logic/userUtils';
import Loading from '../../Home/Loading';

function DartsUsersTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [dartsUsers, setDartsUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleVisibleUser = async (user) => {
    user.visible = !user.visible;
    const updatedUser = user;
    setDartsUsers((prev) => prev.map((dUser) => dUser.displayName === user.displayName ? user : dUser));
    await putDartsUser(updatedUser);

    const gameSettings = JSON.parse(localStorage.getItem("gameSettings"));

    if (gameSettings && user.visible === false) {
      const existingUserInLS = gameSettings.users.find((user) => user.displayName === updatedUser.displayName);
      if (existingUserInLS) {
        existingUserInLS.visible = false;

        const updatedGameSettingsUsers = gameSettings.users.filter((dUser) => dUser.displayName !== existingUserInLS.displayName);

        localStorage.setItem("gameSettings", JSON.stringify({
          ...gameSettings,
          users: updatedGameSettingsUsers
        }));
      }
    }
  }

  const fetchDartsUsers = async () => {
    try {
      const fetchedDartsUsers = await getDartsUsers();
      setDartsUsers(fetchedDartsUsers);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching', err);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || dartsUsers === null) {
      fetchDartsUsers();
      setRefreshingData(false);
    }
  }, [refreshingData, dartsUsers]);

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
              <TableHead>Games Played</TableHead>
              <TableHead>highestCheckout</TableHead>
              <TableHead>highestEndingAvg</TableHead>
              <TableHead>highestTurnPoints</TableHead>
              <TableHead>overAllPoints</TableHead>
              <TableHead>throws</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dartsUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user._id}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.gamesPlayed}</TableCell>
                <TableCell>{user.highestCheckout}</TableCell>
                <TableCell>{user.highestEndingAvg}</TableCell>
                <TableCell>{user.highestTurnPoints}</TableCell>
                <TableCell>{user.overAllPoints}</TableCell>
                <TableCell>{totalThrows(user, false)}</TableCell>
                <TableCell>{user.visible ? "Yes" : "No"}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5'>
                      <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleVisibleUser(user)}
                      >
                        {user.visible ? <EyeOff height={20} /> : <Eye height={20} />}
                        {user.visible ? <span>Hide in darts</span> : <span>Show in darts</span>}
                      </DropdownMenuItem>
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

export default DartsUsersTable