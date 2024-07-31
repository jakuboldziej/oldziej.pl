import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'
import { joinLiveGamePreview } from '@/fetch';
import { socket } from '@/lib/socketio';
import { Label } from '@radix-ui/react-label';
import confetti from 'canvas-confetti';
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';

function JoinFromAnotherDevice() {
  const [searchParams, setSearchParamss] = useSearchParams();
  const [inputGameCode, setInputGameCode] = useState('');
  const [joinedGame, setJoinedGame] = useState(false);

  const socketId = searchParams.get("socketId");
  console.log(socketId);

  const handleJoinLiveGame = async (e) => {
    e.preventDefault();

    const response = await joinLiveGamePreview(inputGameCode);
    if (response.ok) {
      socket.emit("joinLiveGameFromQrCode", JSON.stringify({
        socketId: socketId,
        game: response.game
      }));

      setJoinedGame(true);
      turnOnConfetti();
    } else {
      ShowNewToast("Live Game Preview", "Game code is not valid.");
    }
  }

  const turnOnConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <div className='text-white flex flex-col items-center justify-center gap-5 h-screen w-full p-2'>
      {socketId ? (
        joinedGame ? (
          <span className='text-3xl text-center'>You joined the live game on another device!</span>
        ) : (
          <>
            <span className='text-3xl text-center'>Join the live game on another device</span>
            <form onSubmit={handleJoinLiveGame} className="flex w-full max-w-sm items-end space-x-2 gap-1.5">
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label htmlFor='game-code'>Code</Label>
                <Input id='game-code' placeholder='1234' autoFocus required value={inputGameCode} onChange={(e) => setInputGameCode(e.target.value)} />
              </div>
              <Button type="submit">Join</Button>
            </form>
          </>
        )
      ) : (
        <span className='text-3xl text-center'>You didn't scan any qr codes</span>
      )}
    </div>
  )
}

export default JoinFromAnotherDevice