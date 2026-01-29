import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getDartsGames, patchDartsUser } from '@/lib/fetch';
import { Eye, EyeOff, FolderSync, Grip, Trash } from 'lucide-react';
import React, { useContext } from 'react';
import { totalThrows } from '../../../Home/Darts/game logic/userUtils';
import { Button } from '@/components/ui/shadcn/button';
import { DartsUsersContext } from './DartsUsersContext';
import { ScrollArea, ScrollBar } from '@/components/ui/shadcn/scroll-area';

const DartsUsersTable = ({ dartsUsers, setDartsUsers }) => {
  const { setDialogOpen, setSelectedUser, setModalType, setModalDesc } = useContext(DartsUsersContext);

  const handleDialogOpen = async (user, type) => {
    setDialogOpen(true);
    setSelectedUser(user);
    setModalType(type);

    if (type === "sync") {
      try {
        const userGames = await getDartsGames(user.displayName, null, false);

        const gamesPlayed = userGames.length;
        let highestCheckout = 0;
        let highestEndingAvg = 0;
        let highestTurnPoints = 0;
        let overAllPoints = 0;
        let podiums = {
          firstPlace: 0,
          secondPlace: 0,
          thirdPlace: 0
        };
        let throws = {
          doors: 0,
          doubles: 0,
          triples: 0,
          normal: 0,
          overthrows: 0
        };

        if (userGames.length > 0) {
          userGames.map((game) => {
            const foundUser = game.users.find((usr) => usr.displayName === user.displayName);

            if (foundUser.gameCheckout && foundUser.gameCheckout > highestCheckout) highestCheckout = foundUser.gameCheckout;
            if (foundUser.highestGameAvg && foundUser.highestGameAvg > highestEndingAvg) highestEndingAvg = foundUser.highestGameAvg;
            if (foundUser.highestGameTurnPoints && foundUser.highestGameTurnPoints > highestTurnPoints) highestTurnPoints = foundUser.highestGameTurnPoints;
            if (foundUser.allGainedPoints && foundUser.allGainedPoints) overAllPoints += foundUser.allGainedPoints;

            if (game.podium[1] === foundUser.displayName) podiums.firstPlace += 1;
            if (game.podium[2] === foundUser.displayName) podiums.secondPlace += 1;
            if (game.podium[3] === foundUser.displayName) podiums.thirdPlace += 1;

            if (foundUser.throws.doors) throws.doors += foundUser.throws.doors;
            if (foundUser.throws.doubles) throws.doubles += foundUser.throws.doubles;
            if (foundUser.throws.triples) throws.triples += foundUser.throws.triples;
            if (foundUser.throws.normal) throws.normal += foundUser.throws.normal;
            if (foundUser.throws.overthrows) throws.overthrows += foundUser.throws.overthrows;
          });
        }

        setModalDesc({
          gamesPlayed,
          highestCheckout,
          highestEndingAvg,
          highestTurnPoints,
          overAllPoints,
          podiums,
          throws
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  const handleVisibleUser = async (user) => {
    user.visible = !user.visible;
    const updatedUser = user;
    setDartsUsers((prev) => prev.map((dUser) => dUser.displayName === user.displayName ? user : dUser));
    await patchDartsUser(updatedUser);

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

  return (
    <div className="w-full overflow-x-auto">
      <ScrollArea className="h-[700px] w-full">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">_id</TableHead>
              <TableHead>displayName</TableHead>
              <TableHead>highestCheckout</TableHead>
              <TableHead>highestEndingAvg</TableHead>
              <TableHead>highestTurnPoints</TableHead>
              <TableHead>overAllPoints</TableHead>
              <TableHead>gamesPlayed</TableHead>
              <TableHead>podiums</TableHead>
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
                <TableCell>{user.highestCheckout}</TableCell>
                <TableCell>{user.highestEndingAvg}</TableCell>
                <TableCell>{user.highestTurnPoints}</TableCell>
                <TableCell>{user.overAllPoints}</TableCell>
                <TableCell>{user.gamesPlayed}</TableCell>
                <TableCell>
                  {user.podiums.firstPlace} | {user.podiums.secondPlace} | {user.podiums.thirdPlace}
                </TableCell>
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
                      <DropdownMenuItem
                        onClick={() => handleDialogOpen(user, "sync")}
                      >
                        <FolderSync height={20} />
                        <span>Sync data</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDialogOpen(user, "reset")}
                      >
                        <Trash height={20} />
                        <span>Reset data</span>
                      </DropdownMenuItem>
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
  )
}

export default DartsUsersTable