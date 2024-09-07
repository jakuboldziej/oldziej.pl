import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'
import { socket } from '@/lib/socketio';
import { Label } from '@radix-ui/react-label';
import confetti from 'canvas-confetti';
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';

function JoinFromAnotherDevice() {
  const [isServerConnected, setIsServerConnected] = useState(socket.connected);
  const [searchParams] = useSearchParams();
  const [inputGameCode, setInputGameCode] = useState('');
  const [joinedGame, setJoinedGame] = useState(false);

  const socketId = searchParams.get("socketId");

  const handleJoinLiveGame = async (e) => {
    e.preventDefault();

    const response = await getDartsGame(inputGameCode);
    if (response) {
      socket.emit("joinLiveGameFromQrCode", JSON.stringify({
        socketId: socketId,
        game: response
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

  useEffect(() => {
    socket.connect();
    const connectToServer = () => {
      setIsServerConnected(true);
    }

    const disconnectFromServer = () => {
      setIsServerConnected(false);
    }

    socket.on('connect', connectToServer);
    socket.on('disconnect', disconnectFromServer);

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('connect', connectToServer);
      socket.off('disconnect', disconnectFromServer);
    };
  }, []);

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
                <Input type='number' id='game-code' placeholder='1234' autoFocus required value={inputGameCode} onChange={(e) => setInputGameCode(e.target.value)} />
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