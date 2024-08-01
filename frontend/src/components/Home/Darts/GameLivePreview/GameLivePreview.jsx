import React, { useEffect, useState } from 'react';
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { handleTimePlayed } from '../game logic/gameUtils';

function GameLivePreview({ liveGame, setLiveGame }) {
  const [users, setUsers] = useState(liveGame.users);
  const [showDialog, setShowDialog] = useState(false);
  const [timePlayed, setTimePlayed] = useState(0);

  const handleCurrentUserTurn = (user, turn) => {
    if (turn) {
      if (user.currentTurn === turn && user.turn) return "text-green";
    } else {
      if (user.turn) return "text-green"
      else return "text-slate-400"
    }
  }

  useEffect(() => {
    if (liveGame?.record) {
      const lastRecord = liveGame.record[liveGame.record.length - 1];
      setUsers(lastRecord.users);
    }

    if (!liveGame.active) {
      const formattedTime = handleTimePlayed(liveGame.created_at, liveGame.finished_at);
      setTimePlayed(formattedTime);
      setShowDialog(true);
    }
    else setShowDialog(false);
  }, [liveGame]);

  return (
    <>
      <div className='live-game text-white p-5'>
        <div className='text-3xl top-bar flex justify-around'>
          <span>Round: {liveGame.round}</span>
          <span>Gamemode: {liveGame.gameMode}</span>
          <span className='flex items-center gap-2'>Live: <img className='h-[15px]' src={liveGame.active ? GreenDot : RedDot} /></span>
        </div>
        <div className='users-playing flex flex-wrap items-center justify-center gap-10 w-full container_no_nav'>
          {users && users.map((user) => (
            <div key={user._id} className='user'>
              <div className="p-1">
                <div className="flex flex-col aspect-auto items-center justify-center p-6 gap-10">
                  <span className={`text-5xl ${handleCurrentUserTurn(user)}`}>{user.displayName}</span>
                  <span className="text-6xl">{user.points}</span>
                  <div className="flex gap-16 min-h-[80px] w-[265px] text-3xl">
                    <div className='flex flex-col items-center gap-2 min-w-[46px]'>
                      <span className={handleCurrentUserTurn(user, 1)}>T1</span>
                      <span>{user.turns[1]}</span>
                    </div>
                    <div className='flex flex-col items-center gap-2 min-w-[46px]'>
                      <span className={handleCurrentUserTurn(user, 2)}>T2</span>
                      <span>{user.turns[2]}</span>
                    </div>
                    <div className='flex flex-col items-center gap-2 min-w-[46px]'>
                      <span className={handleCurrentUserTurn(user, 3)}>T3</span>
                      <span>{user.turns[3]}</span>
                    </div>
                  </div>
                  <span className='text-3xl'>Ø {user.avgPointsPerTurn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={showDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-3xl'>This game has ended</DialogTitle>
            <div className="summary flex flex-col items-center gap-5 text-white">
              <div className='podium flex justify-center text-center gap-5 m-5'>
                <span className="place seconds-place">{liveGame.podium[2] ? liveGame.podium[2] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="second-place-ribbon" /></span>
                <span className="place first-place -translate-y-3">{liveGame.podium[1] ? liveGame.podium[1] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" /></span>
                <span className="place third-place">{liveGame.podium[3] ? liveGame.podium[3] : 'None'}<img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="third-place-ribbon" /></span>
              </div>
              <div className="flex gap-4">
                <span>Time played: {timePlayed}</span>
                <span>Start Points: {liveGame.startPoints}</span>
              </div>
              <span>
                Gamemode: {liveGame.gameMode}
                {liveGame.gameMode === "X01" && <span> | Legs: {liveGame.legs} | Sets: {liveGame.sets}</span>}
              </span>
              <span className='flex flex-col items-center gap-5 mt-5'>
                <span className='text-sm text-slate-400'>Wait until host clicks play again button or</span>
                <Button onClick={() => setLiveGame(null)} variant="outline_white">Join new game</Button>
              </span>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GameLivePreview