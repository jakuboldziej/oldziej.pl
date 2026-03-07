import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { deleteDartsTournament, getDartsTournaments } from '@/lib/fetch';
import { Copy, Grip, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import CopyTextButton from '@/components/Home/CopyTextButton';
import { ScrollArea, ScrollBar } from '@/components/ui/shadcn/scroll-area';
import { useNavigate } from 'react-router';
import Loading from '@/components/Home/Loading';

function DartsTournamentsTable({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [dartsTournaments, setDartsTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState({
    data: true,
    delete: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const handleDialogOpen = (tournament) => {
    setDialogOpen(true);
    setSelectedTournament(tournament);
  }

  const handleDeleteTournament = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, delete: true }));

      await deleteDartsTournament(selectedTournament._id);
      setDialogOpen(false);
      setDartsTournaments((prev) => prev.filter((tournament) => tournament._id !== selectedTournament._id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  }

  const handleDisplayDate = (tournamentDate) => {
    if (tournamentDate === undefined) return "";
    return new Date(tournamentDate).toLocaleString();
  }

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const fetchMoreTournaments = async () => {
    try {
      const fetchedTournaments = await getDartsTournaments(null, 10 * currentPage, null);
      setDartsTournaments(fetchedTournaments);
    } catch (err) {
      console.error('Error fetching more tournaments', err);
    }
  };

  useEffect(() => {
    if (currentPage > 1) {
      fetchMoreTournaments();
    }
  }, [currentPage]);

  useEffect(() => {
    const fetchInitialDartsTournaments = async () => {
      setIsLoading((prev) => ({ ...prev, data: true }));
      try {
        const fetchedDartsTournaments = await getDartsTournaments(null, 10, null);
        setDartsTournaments(fetchedDartsTournaments);
      } catch (err) {
        console.error('Error fetching', err);
      } finally {
        setIsLoading((prev) => ({ ...prev, data: false }));
      }
    }

    if (refreshingData === true || dartsTournaments.length === 0) {
      fetchInitialDartsTournaments();
      setRefreshingData(false);
    }
  }, [refreshingData]);

  const visibleTournaments = dartsTournaments.length > 0 && dartsTournaments.slice(0, 10 * currentPage);

  return (
    <>
      {isLoading.data ? (
        <Loading />
      ) : (
        <div className="w-full overflow-x-auto">
          <ScrollArea className="h-[700px] w-full" onScroll={handleScroll}>
            <Table className="min-w-[1400px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tournament Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTournaments.length > 0 && visibleTournaments.map((tournament) => (
                  <TableRow onClick={() => navigate(`/darts/tournament/${tournament.tournamentCode}`)} className='hover:bg-slate-900 cursor-pointer' key={tournament._id}>
                    <TableCell className="font-medium">{tournament._id}</TableCell>
                    <TableCell>{tournament.name}</TableCell>
                    <TableCell>{tournament.settings.type}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {tournament.tournamentCode}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <CopyTextButton
                            textToCopy={tournament.tournamentCode}
                            toastTitle="Code copied"
                            toastDesc="Code copied to clipboard"
                          >
                            <MyTooltip title="Copy code to clipboard">
                              <Copy height={15} />
                            </MyTooltip>
                          </CopyTextButton>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tournament.status}</TableCell>
                    <TableCell>{tournament.admin}</TableCell>
                    <TableCell>
                      <MyTooltip
                        title={Object.entries(tournament.settings).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      >
                        <span>Settings</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={tournament.participants.map((participant) => participant).join(", ")} >
                        <span>Participants</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={tournament.matches.map((match) => `R: ${match.round} M: ${match.matchIndex}`).join(", ")} >
                        <span>Matches</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell>
                      <MyTooltip title={handleDisplayDate(tournament.createdAt || tournament.created_at)}>
                        <span className="timedate">{handleDisplayDate(tournament.createdAt || tournament.created_at)}</span>
                      </MyTooltip>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                              <Grip />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="mr-5">
                            <DropdownMenuLabel>{tournament.tournamentCode}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDialogOpen(tournament)}>
                              <Trash height={20} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div >
      )
      } <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader className="text-white">
            <DialogTitle className='flex justify-center text-2xl'>Delete {selectedTournament?.displayName}</DialogTitle>
            <DialogClose onClick={() => setDialogOpen(false)}>
              <X className="absolute right-2 top-2" />
            </DialogClose>
            <DialogDescription>
              Are you sure you want to delete tournament with ID: {selectedTournament?._id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="text-white">
            <Button variant='outline_red' disabled={isLoading.delete} onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='outline_green' disabled={isLoading.delete} onClick={handleDeleteTournament}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DartsTournamentsTable;