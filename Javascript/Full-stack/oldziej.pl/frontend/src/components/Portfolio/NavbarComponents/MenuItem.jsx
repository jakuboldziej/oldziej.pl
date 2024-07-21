import React from 'react'
import { motion } from "framer-motion";

const variants = {
  open: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

function MenuItem({ children }) {
  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.li>
  )
}

export default MenuItem