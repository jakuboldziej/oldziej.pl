import React, { useContext } from "react";
import { motion } from "framer-motion";
import MenuItem from "./MenuItem";
import { LangContext } from "@/context/LangContext";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const layoutVariants = {
  open: {
    display: 'block',
    height: "auto",
  },
  closed: {
    display: 'none',
    height: 0,
  },
};

function Navigation({ isOpen }) {
  const { lang, setLang } = useContext(LangContext);

  const handleLangChange = (langP) => {
    if (langP !== lang) {
      location.reload();
      setLang(langP);
      localStorage.setItem('lang', langP);
    }
  }

  return (
    <motion.div variants={layoutVariants} >
      <motion.ul variants={variants} className={"bg-black"}>
        <MenuItem>
          <span><span className={`${lang === "pl" ? 'text-lime font-bold' : 'text-white hover:text-pink'} transition-all`} onClick={() => handleLangChange('pl')}>PL</span>
          <span> | </span>
          <span className={`${lang === "en" ? 'text-lime font-bold' : 'text-white hover:text-pink'} transition-all `} onClick={() => handleLangChange('en')}>EN</span></span>
        </MenuItem>
      </motion.ul>
    </motion.div>
  );
}

const itemIds = [0, 1, 2, 3, 4];

export default Navigation;