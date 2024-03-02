/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react';

export const ToastsContext = createContext();

export const ToastsContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showNewToast = (title, description) => {
    if (toasts.length > 0 && description === toasts[toasts.length - 1].description) return;
    const newToast = {
      title,
      description,
      timestamp: Date.now(),
      show: true
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
  };


  useEffect(() => {
    if (toasts.length > 0) {
      const removeInactiveToasts = setTimeout(() => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.show));
      }, 500);
  
      return () => clearTimeout(removeInactiveToasts);
    }
  }, [toasts]);

  return (
    <ToastsContext.Provider value={{ toasts, showNewToast, setToasts }}>
      {children}
    </ToastsContext.Provider>
  );
};