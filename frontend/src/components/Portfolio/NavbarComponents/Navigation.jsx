import React, { useContext } from "react";
import { motion } from "framer-motion";
import MenuItem from "./MenuItem";
import { PortfolioContext } from "@/context/Portfolio/PortfolioContext";

const layoutVariants = {
  open: {
    display: 'block',
    opacity: 1,
  },
  closed: {
    opacity: 0,
    display: 'none',
  },
};

function Navigation() {
  const { lang } = useContext(PortfolioContext);

  const handleLangChange = (langP) => {
    if (langP !== lang) {
      location.reload();
      localStorage.setItem('lang', langP);
    }
  }

  return (
    <motion.div transition={{ duration: 0.3 }} variants={layoutVariants}>
      <motion.ul className="bg-black z-50">
        <MenuItem>
          <span><span className={`${lang === "pl" ? 'text-lime font-bold' : 'text-white hover:text-pink'} transition-all`} onClick={() => handleLangChange('pl')}>PL</span>
            <span> | </span>
            <span className={`${lang === "en" ? 'text-lime font-bold' : 'text-white hover:text-pink'} transition-all `} onClick={() => handleLangChange('en')}>EN</span></span>
        </MenuItem>
      </motion.ul>
    </motion.div>
  );
}

export default Navigation;