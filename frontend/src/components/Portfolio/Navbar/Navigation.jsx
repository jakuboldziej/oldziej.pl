import * as React from "react";
import { motion } from "framer-motion";
import MenuItem from "./MenuItem";

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
  return (
    <motion.div variants={layoutVariants} >
      <motion.ul variants={variants} className="backdrop-filter backdrop-blur">
        <MenuItem>
          asdf11
        </MenuItem>
        <MenuItem>
          <span><span className="hover:text-lime transition-all">PL</span> | <span className="hover:text-lime transition-all">EN</span></span>
        </MenuItem>
      </motion.ul>
    </motion.div>
  );
}

const itemIds = [0, 1, 2, 3, 4];

export default Navigation;