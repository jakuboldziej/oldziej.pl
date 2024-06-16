import React, { useContext, useEffect, useRef, useState } from 'react'
import { motion, useCycle } from "framer-motion"
import { createNumberArray, handleCurrentPagesNames, useDimensions } from '../utils';
import { BreadcrumbSeparator } from '../../ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import MenuToggle from './MenuToggle';
import Navigation from './Navigation';
import WordFadeIn from '@/components/magicui/word-fade-in';
import { LangContext } from '@/context/LangContext';

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at 40px 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

function Navbar({ currentPage, pagesRefs }) {
  const { lang } = useContext(LangContext)
  const [currentPagesNames, setCurrentPagesNames] = useState(handleCurrentPagesNames(createNumberArray(currentPage)));
  const [highestPage, setHighestPage] = useState(1);

  const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef)

  useEffect(() => {
    if (currentPage > highestPage) {
      setCurrentPagesNames(handleCurrentPagesNames(createNumberArray(currentPage), lang));
      setHighestPage(currentPage);
    }
  }, [currentPage]);

  const handlePaginationClick = (event, i) => {
    event.preventDefault();
    window.scrollTo({ top: pagesRefs[i].current.offsetTop, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.8 }}
      viewport={{ once: true }}
      className='portfolio-navbar fixed justify-between top-0 left-0 flex w-full p-5 text-white z-40'>
      <div className='current-pages-names flex gap-2'>
        {currentPagesNames.map((name, i) => (
          <div key={name} className='flex items-center gap-2 h-[24px]'>
            <WordFadeIn onClick={(e) => handlePaginationClick(e, i)} className='cursor-pointer' words={name} />
            {currentPagesNames.length > 1 && i !== currentPagesNames.length - 1 && <BreadcrumbSeparator className='[&>svg]:size-5' />}
            {currentPagesNames.length === 1 &&
              <>
                <BreadcrumbSeparator className='[&>svg]:size-5' />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='text-md'>...</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Scroll to see what happens</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            }
          </div>
        ))}
      </div>
      <motion.nav
        initial={false}
        animate={isOpen ? "open" : "closed"}
        custom={height}
        ref={containerRef}
      >
        <motion.div className="background" variants={sidebar} />
        <Navigation isOpen={isOpen} />
        <MenuToggle toggle={() => toggleOpen()} />
      </motion.nav>

    </motion.div>
  )
}

export default Navbar