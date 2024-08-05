import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EmailVerified() {
  const navigate = useNavigate();

  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);


  return (
    <div className='text-center text-white h-screen flex flex-col gap-2 justify-center items-center'>
      <span className='text-3xl'>Your email was verified successfully!</span>
      <span className='text-xl'>You will be redirected in {secondsLeft} seconds...</span>
    </div>
  )
}

export default EmailVerified