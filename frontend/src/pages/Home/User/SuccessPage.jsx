import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [secondsLeft, setSecondsLeft] = useState(5);
  const [successText, setSuccessText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    if (searchParams.size === 0) {
      clearTimeout(interval);
      clearTimeout(timer);
      return navigate('/');
    }
    if (searchParams.get("newUserEmail") === "true") {
      setSuccessText("Your new email was verified successfully!");
    } else if (searchParams.get("verified") === "true") {
      setSuccessText("Your email was verified successfully!");
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  useEffect(() => {

  }, []);

  return (
    <div className='text-center text-white h-screen flex flex-col gap-2 justify-center items-center'>
      <span className='text-3xl'>
        {successText}
      </span>
      <span className='text-xl'>You will be redirected in {secondsLeft} seconds...</span>
    </div>
  )
}

export default SuccessPage