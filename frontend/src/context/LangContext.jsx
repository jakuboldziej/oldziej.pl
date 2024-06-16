/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react'
import { textData } from '@/assets/text'

export const LangContext = createContext();

export function LangContextProvider({ children }) {
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
    <LangContext.Provider value={{ lang, setLang, langText }}>
      {children}
    </LangContext.Provider>
  )
}
