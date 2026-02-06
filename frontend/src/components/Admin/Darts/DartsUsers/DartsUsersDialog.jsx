import { Button } from '@/components/ui/shadcn/button';
import React, { useContext } from 'react';
import Loading from '../../../Home/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { patchDartsUser } from '@/lib/fetch';
import { DartsUsersContext } from './DartsUsersContext';
import DartsUsersDialogCompare from './DartsUsersDialogCompare';

const DartsUsersDialog = ({ setDartsUsers }) => {
  const { dialogOpen, setDialogOpen, selectedUser, modalType, modalDesc } = useContext(DartsUsersContext);

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
        podiums: modalDesc.podiums,
        throws: modalDesc.throws,
      });

      setDartsUsers((prev) => prev.map((user) => user.displayName === updatedUser.displayName ? updatedUser : user));
    } catch (err) {
      console.error(err);
    } finally {
      setDialogOpen(false);
    }
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader className="text-white">
          <DialogTitle className='flex justify-center text-2xl'>{modalType === "reset" ? "Reset" : "Sync"} {selectedUser?.displayName}'s darts data</DialogTitle>
          <DialogDescription className='text-center text-xl'>
            {modalType === "reset" && (
              <span>Are you sure you want to reset {selectedUser?.displayName}'s darts data?</span>
            )}
            {modalType === "sync" && (
              <span className='flex flex-col gap-3'>
                <span>Are you sure you want to sync {selectedUser?.displayName}'s darts data?</span>
                {modalDesc ? (
                  <span className='flex flex-col gap-1'>
                    <DartsUsersDialogCompare title="gamesPlayed" firstData={selectedUser.gamesPlayed} secondData={modalDesc.gamesPlayed} />
                    <DartsUsersDialogCompare title="highestCheckout" firstData={selectedUser.highestCheckout} secondData={modalDesc.highestCheckout} />
                    <DartsUsersDialogCompare title="highestEndingAvg" firstData={parseFloat(selectedUser.highestEndingAvg)} secondData={parseFloat(modalDesc.highestEndingAvg)} />
                    <DartsUsersDialogCompare title="highestTurnPoints" firstData={selectedUser.highestTurnPoints} secondData={modalDesc.highestTurnPoints} />
                    <DartsUsersDialogCompare title="overAllPoints" firstData={selectedUser.overAllPoints} secondData={modalDesc.overAllPoints} />
                    <span className='border-t'>Podiums:</span>
                    <DartsUsersDialogCompare title="firstPlace" firstData={selectedUser.podiums.firstPlace} secondData={modalDesc.podiums.firstPlace} />
                    <DartsUsersDialogCompare title="secondPlace" firstData={selectedUser.podiums.secondPlace} secondData={modalDesc.podiums.secondPlace} />
                    <DartsUsersDialogCompare title="thirdPlace" firstData={selectedUser.podiums.thirdPlace} secondData={modalDesc.podiums.thirdPlace} />
                    <span className='border-t'>Throws:</span>
                    <DartsUsersDialogCompare title="normal" firstData={selectedUser.throws.normal} secondData={modalDesc.throws.normal} />
                    <DartsUsersDialogCompare title="doubles" firstData={selectedUser.throws.doubles} secondData={modalDesc.throws.doubles} />
                    <DartsUsersDialogCompare title="triples" firstData={selectedUser.throws.triples} secondData={modalDesc.throws.triples} />
                    <DartsUsersDialogCompare title="overthrows" firstData={selectedUser.throws.overthrows} secondData={modalDesc.throws.overthrows} />
                    <DartsUsersDialogCompare title="doors" firstData={selectedUser.throws.doors} secondData={modalDesc.throws.doors} />
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
  )
}

export default DartsUsersDialog