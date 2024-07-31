import React, { useState } from 'react'
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";

function GameLivePreview({ liveGame }) {
  const [currentUser, setCurrentUser] = useState(liveGame.users.find(user => user.turn));


  return (
    <div className='live-game text-white p-5'>
      <div className='text-3xl top-bar flex justify-around'>
        <span>Round: {liveGame.round}</span>
        <span>Gamemode: {liveGame.gameMode}</span>
        <span className='flex items-center gap-2'>Live: <img className='h-[15px]' src={liveGame.active ? GreenDot : RedDot} /></span>
      </div>
      <div className='current-user'>

        <span></span>
      </div>
    </div>
  )
}

export default GameLivePreview