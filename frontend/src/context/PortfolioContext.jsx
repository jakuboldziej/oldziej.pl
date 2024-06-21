/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react'
import { textData } from '@/assets/text'

export const PortfolioContext = createContext();

export function PortfolioContextProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const storedLang = localStorage.getItem('lang');
    return storedLang ? storedLang : 'pl';
  });

  const [langText, setLangText] = useState({});

  useEffect(() => {
    if (lang === 'pl') {
      setLangText(textData.pl);
    } else if (lang === 'en') {
      setLangText(textData.en);
    }
  }, [lang]);

  return (
    <PortfolioContext.Provider value={{ lang, setLang, langText }}>
      {children}
    </PortfolioContext.Provider>
  )
}
