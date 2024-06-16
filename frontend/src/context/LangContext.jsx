/* eslint-disable react/prop-types */
import { createContext, useState } from 'react'

export const LangContext = createContext();

export function LangContextProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const storedLang = localStorage.getItem('lang');
    return storedLang ? storedLang : 'pl';
  });

  return (
    <LangContext.Provider value={{lang, setLang}}>
      {children}
    </LangContext.Provider>
  )
}
