import { Button } from '@/components/ui/shadcn/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { getDartsGames, getDartsUsers, patchDartsUser } from '@/lib/fetch';
import { Eye, EyeOff, FolderSync, Grip, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { totalThrows } from '../../Home/Darts/game logic/userUtils';
import Loading from '../../Home/Loading';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';

function DartsUsersTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [dartsUsers, setDartsUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");
  const [modalDesc, setModalDesc] = useState(null);

  const handleDialogOpen = async (user, type) => {
    setDialogOpen(true);
    setSelectedUser(user);
    setModalType(type);

    if (type === "sync") {
      try {
        const userGames = await getDartsGames(user.displayName);

        const gamesPlayed = userGames.length;
        let highestCheckout = 0;
        let highestEndingAvg = 0;
        let highestTurnPoints = 0;
        let overAllPoints = 0;
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

  const handleResetUsersData = async () => {
    try {
      const updatedUser = await patchDartsUser({
        ...selectedUser,
        gamesPlayed: 0,
        highestCheckout: 0,
        highestEndingAvg: 0,
        highestTurnPoints: 0,
        overAllPoints: 0,
        podiums: {
          firstPlace: 0,
          secondPlace: 0,
          thirdPlace: 0
        },
        throws: {
          normal: 0,
          doubles: 0,
          doors: 0,
          overthrows: 0
        }
      });

      setDartsUsers((prev) => prev.map((user) => user.displayName === updatedUser.displayName ? updatedUser : user));
    } catch (err) {
      console.error(err.message);
    } finally {
      setDialogOpen(false);
    }
  }

  const handleSyncUsersData = async () => {
    try {
      const updatedUser = await patchDartsUser({
        displayName: selectedUser.displayName,
        gamesPlayed: modalDesc.gamesPlayed,
        highestCheckout: modalDesc.highestCheckout,
        highestEndingAvg: modalDesc.highestEndingAvg,
        highestTurnPoints: modalDesc.highestTurnPoints,
        overAllPoints: modalDesc.overAllPoints,
        throws: modalDesc.throws,
      });

      setDartsUsers((prev) => prev.map((user) => user.displayName === updatedUser.displayName ? updatedUser : user));
    } catch (err) {
      console.error(err);
    } finally {
      setDialogOpen(false);
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
      )}

      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>{modalType === "reset" ? "Reset" : "Sync"} {selectedUser?.displayName}'s darts data</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription className='text-center text-xl'>
              {modalType === "reset" && (
                <span>Are you sure you want to reset {selectedUser?.displayName}'s darts data?</span>
              )}
              {modalType === "sync" && (
                <span className='flex flex-col gap-3'>
                  <span>Are you sure you want to sync {selectedUser?.displayName}'s darts data?</span>
                  {modalDesc ? (
                    <span className='flex flex-col gap-1'>
                      <span>gamesPlayed: {modalDesc.gamesPlayed}</span>
                      <span>highestCheckout: {modalDesc.highestCheckout}</span>
                      <span>highestEndingAvg: {modalDesc.highestEndingAvg}</span>
                      <span>highestTurnPoints: {modalDesc.highestTurnPoints}</span>
                      <span>overAllPoints: {modalDesc.overAllPoints}</span>
                      {/* <span>throws: {modalDesc.throws}</span> */}
                    </span>
                  ) : (
                    <Loading />
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_green' onClick={() => setDialogOpen(false)}>Cancel</Button>
            {modalType === "reset" && (
              <Button variant='outline_red' onClick={handleResetUsersData}>Reset</Button>
            )}
            {modalType === "sync" && (
              <Button variant='outline_blue' onClick={handleSyncUsersData} disabled={!modalDesc}>Sync</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DartsUsersTable