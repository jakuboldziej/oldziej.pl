import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { joinLiveGamePreview } from '@/fetch';
import React, { useContext, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
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

    const response = await joinLiveGamePreview(inputGameCode);
    if (response.ok) {
      socket.emit("joinLiveGamePreview", JSON.stringify({
        socketId: socket.id,
        gameCode: response.game.gameCode
      }));

      setLiveGame(response.game);
      ShowNewToast("Live Game Preview", `You joined live game preview hosted by ${response.game.created_by}!`);
    } else {
      ShowNewToast("Live Game Preview", "Game code is not valid.");
    }
  }

  console.log(qrCodeLink, socket.id);

  useEffect(() => {
    setQrCodeLink(`${origin}/darts/game/join-game-from-qrcode?socketId=${socket.id}`);
  }, [isServerConnected]);

  return (
    <div className='joininig-live-game text-white flex flex-col items-center justify-center gap-5 h-screen w-full p-2'>
      <span className='text-3xl text-center'>Join the live game from another device by scanning the QR code</span>
      <Link to={qrCodeLink} target='_blank' className='qr-container bg-white p-4 sm:w-2/5 cursor-pointer'>
        <QRCode
          size={256}
          style={{ height: "auto", width: "100%" }}
          value={qrCodeLink}
          viewBox={`0 0 256 256`}
        />
      </Link>
      <div className='flex flex-col gap-5'>
        <span className='text-center'>Or put the code manually</span>
        <form onSubmit={handleJoinLiveGame} className="flex w-full max-w-sm items-center space-x-2">
          <Input autoFocus required placeholder='1234' value={inputGameCode} onChange={(e) => setInputGameCode(e.target.value)} />
          <Button type="submit">Join</Button>
        </form>
      </div>
    </div>
  )
}

export default JoiningLiveGame