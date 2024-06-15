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
    <motion.div variants={layoutVariants} whileHover={{ ...layoutVariants[isOpen ? "open" : "closed"] }}>
      <motion.ul variants={variants}>
        {itemIds.map((i) => (
          <MenuItem i={i} key={i} />
        ))}
      </motion.ul>
    </motion.div>
  );
}

const itemIds = [0, 1, 2, 3, 4];

export default Navigation;