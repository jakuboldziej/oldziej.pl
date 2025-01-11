import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { getDartsGame, joinDartsGame } from '@/lib/fetch';
import React, { useContext, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import ShowNewToast from '../../MyComponents/ShowNewToast';
import { socket } from '@/lib/socketio';
import { SocketIoContext } from '@/context/Home/SocketIoContext';
import { Link } from 'react-router-dom';

function JoiningLiveGame({ props }) {
  const { setLiveGame } = props;

  const { isServerConnected } = useContext(SocketIoContext);

  const origin = window.location.origin;

  const [inputGameCode, setInputGameCode] = useState('');
  const [qrCodeLink, setQrCodeLink] = useState('');

  const handleJoinLiveGame = async (e) => {
    e.preventDefault();

    const response = await joinDartsGame(inputGameCode);

    if (response) {
      socket.emit("joinLiveGamePreview", JSON.stringify({
        gameCode: response.gameCode
      }));

      setLiveGame(response);
      ShowNewToast("Live Game Preview", `You joined live game preview hosted by ${response.created_by}!`);
    } else {
      ShowNewToast("Live Game Preview", "Game code is not valid.");
    }
  }

  useEffect(() => {
    setQrCodeLink(`${origin}/darts/game/join-game-from-qrcode?socketId=${socket.id}`);
  }, [isServerConnected]);

  return (
    <div className='joininig-live-game text-white flex flex-col items-center justify-center gap-5 h-screen w-full p-2'>
      <div className='flex flex-col items-center gap-5'>
        <span className='text-center text-3xl'>Join the live game by entering the game code here</span>
        <form onSubmit={handleJoinLiveGame} className="flex w-fit items-center space-x-2">
          <Input autoFocus required type='number' placeholder='1234' value={inputGameCode} onChange={(e) => setInputGameCode(e.target.value)} />
          <Button type="submit">Join</Button>
        </form>
      </div>
      <span className='text-center'>Or scan the QR code</span>
      <Link
        title="Join the live game from another device"
        to={qrCodeLink}
        target='_blank'
        className='qr-container bg-white p-4 sm:w-2/5 cursor-pointer'
      >
        <QRCode
          size={256}
          style={{ height: "auto", width: "100%" }}
          value={qrCodeLink}
          viewBox={`0 0 256 256`}
        />
      </Link>

    </div>
  )
}

export default JoiningLiveGame