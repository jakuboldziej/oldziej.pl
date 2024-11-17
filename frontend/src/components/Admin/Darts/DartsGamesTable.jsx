import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { deleteDartsGame, getDartsGames } from '@/lib/fetch';
import { Copy, Grip, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Loading from '../../Home/Loading';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import CopyTextButton from '@/components/Home/CopyTextButton';

function DartsGamesTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [dartsGames, setDartsGames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleDialogOpen = (game) => {
    setDialogOpen(true);
    setSelectedGame(game);
  }

  const handleDeleteGame = async () => {
    await deleteDartsGame(selectedGame._id);
    setDialogOpen(false);
    setDartsGames((prev) => prev.filter((game) => game.displayName !== selectedGame.displayName));
  }

  const fetchDartsGames = async () => {
    try {
      const fetchedDartsGames = await getDartsGames();
      setDartsGames(fetchedDartsGames);
      setIsLoading(false);
    } catch (err) {
      console.log('Error fetching', err);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || dartsGames === null) {
      fetchDartsGames();
      setRefreshingData(false);
    }
  }, [refreshingData, dartsGames]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Finished at</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Podiums</TableHead>
              <TableHead className='text-center'>Podium</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Game mode</TableHead>
              <TableHead>Start points</TableHead>
              <TableHead>Checkout</TableHead>
              <TableHead>Sets</TableHead>
              <TableHead>Legs</TableHead>
              <TableHead>Game code</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dartsGames.map((game) => (
              <TableRow key={game._id}>
                <TableCell className="font-medium">{game._id}</TableCell>
                <TableCell>{game.created_by}</TableCell>
                <TableCell>
                  <MyTooltip title={new Date(game.created_at).toLocaleString()}>
                    <span className="timedate">{new Date(game.created_at).toLocaleDateString()}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>
                  <MyTooltip title={new Date(game.finished_at).toLocaleString()}>
                    <span className="timedate">{new Date(game.finished_at).toLocaleDateString()}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>
                  <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
                    <span>{game.users.length}</span>
                  </MyTooltip>
                </TableCell>
                <TableCell>{game.podiums}</TableCell>
                <TableCell className='text-center flex items-center justify-center gap-1'>
                  {game.podium[1] && <span>1. {game.podium[1]}</span>}
                  {game.podium[2] && <span>2. {game.podium[2]}</span>}
                  {game.podium[3] && <span>3. {game.podium[3]}</span>}
                </TableCell>
                <TableCell>{game.active ? "Yes" : "No"}</TableCell>
                <TableCell>{game.gameMode}</TableCell>
                <TableCell>{game.startPoints}</TableCell>
                <TableCell>{game.checkOut}</TableCell>
                <TableCell>{game.sets}</TableCell>
                <TableCell>{game.legs}</TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    {game.gameCode}
                    <CopyTextButton textToCopy={game.gameCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
                      <MyTooltip title="Copy code to clipboard">
                        <Copy height={15} />
                      </MyTooltip>
                    </CopyTextButton>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost'><Grip /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5'>
                      <DropdownMenuLabel>{game._id}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDialogOpen(game)}><Trash height={20} /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table >
      )
      }
      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>Delete {selectedGame?.displayName}</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription>
              Are you sure you want to delete game with ID: {selectedGame?._id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_red' onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='outline_green' onClick={handleDeleteGame}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DartsGamesTable