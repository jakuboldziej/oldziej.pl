import React, { useEffect, useRef, useState } from 'react';
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { handleTimePlayed } from '../game logic/gameUtils';
import MostCommonCheckout from '../MostCommonCheckout';
import { socket } from '@/lib/socketio';
import { getLatestRecord } from '@/lib/recordUtils';

function GameLivePreview({ props }) {
  const { liveGame, setLiveGame, overthrow } = props;
  const [users, setUsers] = useState(liveGame.users);
  const [showDialog, setShowDialog] = useState(false);
  const [timePlayed, setTimePlayed] = useState(0);

  useEffect(() => {
    const latestRecord = getLatestRecord(liveGame);
    if (latestRecord) {
      setUsers(latestRecord.users);
    }

    if (!liveGame.active) {
      const formattedTime = handleTimePlayed(liveGame.created_at, liveGame.finished_at || 0);
      setTimePlayed(formattedTime);
      setShowDialog(true);
    }
    else setShowDialog(false);
  }, [liveGame]);

  useEffect(() => {
    const gameEndClient = (data) => {
      const endedGame = JSON.parse(data);
      setLiveGame(endedGame);
    }

    socket.on('gameEndClient', gameEndClient);

    return () => {
      socket.off('gameEndClient', gameEndClient);
    }
  }, [setLiveGame]);

  // Scroll to user
  const usersContainerRef = useRef(null);

  useEffect(() => {
    const userWithTurn = users.find((user) => user.turn);

    if (userWithTurn && usersContainerRef.current) {
      const userElement = usersContainerRef.current.querySelector(`[data-userid="${userWithTurn._id}"]`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [users, liveGame.turn]);

  const userDynamicStyle = (user) => {
    return {
      color: overthrow === user.displayName ? 'red' : null,
    }
  }

  const handleCurrentUserTurn = (user, turn) => {
    if (user.currentTurn === turn && user.turn) {
      return overthrow === user.displayName ? 'text-red' : "text-green";
    }
  }

  const handleShowingSetsAndLegs = () => {
    return liveGame.gameMode === "X01" && (liveGame.sets > 1 || liveGame.legs > 1);
  }

  return (
    <>
      <div className='live-game text-white'>
        <div className='top-bar backdrop-blur-sm fixed top-0 flex justify-around items-center w-full p-2 sm:p-3 md:p-5 z-20 text-[10px] sm:text-xl md:text-3xl'>
          <span className="truncate">R: {liveGame.round}</span>
          {handleShowingSetsAndLegs() && <span className="hidden md:inline truncate">Legs: {liveGame.legs}</span>}
          <span className="truncate">{liveGame.gameMode}</span>
          {handleShowingSetsAndLegs() && <span className="hidden md:inline truncate">Sets: {liveGame.sets}</span>}
          <span className='flex items-center gap-1 truncate'>
            <img className='h-[10px] sm:h-[12px] md:h-[15px]' src={liveGame.active ? GreenDot : RedDot} />
          </span>
        </div>
        <div className='fixed top-12 sm:top-16 md:top-24 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-4xl px-1 sm:px-2 md:px-4'>
          <MostCommonCheckout users={users} game={liveGame} compact={true} />
        </div>
        <div ref={usersContainerRef} className='users-playing flex flex-wrap items-center justify-center gap-4 sm:gap-8 w-full pt-24 sm:pt-32 md:pt-40 min-h-screen'>
          {users && users.map((user) => (
            <div key={user._id} data-userid={user._id} className='user transition-colors' style={userDynamicStyle(user)}>
              <div className="p-1">
                <div className="relative flex flex-col aspect-auto items-center justify-center p-6 gap-8">
                  <span className="text-5xl">{user.displayName}</span>
                  <span className="text-6xl">{user.points}</span>
                  {handleShowingSetsAndLegs() && <div className='absolute top-0 flex justify-around w-full'>
                    <span>L: {user.legs}</span>
                    <span>S: {user.sets}</span>
                  </div>}
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
              {liveGame.podium[1] !== null ? (
                <>
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
                </>
              ) : (
                <span className='text-xl pt-5 text-red-500'>This game was abandoned</span>
              )}
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