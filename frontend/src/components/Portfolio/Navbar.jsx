import "@/assets/styles/portfolio.scss"
import React, { useContext, useEffect, useRef, useState } from 'react'
import { motion, useCycle, useMotionValueEvent, useScroll } from "framer-motion"
import { createNumberArray, handleCurrentPagesNames, scrollToTop, useDimensions } from './utils';
import { BreadcrumbSeparator } from '@/components/ui/shadcn/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/shadcn/tooltip';
import MenuToggle from './NavbarComponents/MenuToggle';
import Navigation from './NavbarComponents/Navigation';
import { PortfolioContext } from '@/context/PortfolioContext';
import { Link } from 'react-router-dom';

function Navbar({ currentPage, pagesRefs, projectsRedirect, setScrolledToProjects, isNotHome, isProjects = false }) {
  const { lang, langText } = useContext(PortfolioContext)

  const [currentPagesNames, setCurrentPagesNames] = useState(handleCurrentPagesNames(createNumberArray(projectsRedirect ? 2 : currentPage), lang));
  const [highestPage, setHighestPage] = useState(projectsRedirect ? 2 : 1);

  const isMobile = window.innerWidth < 640;

  const [isHidden, setIsHidden] = useState(false);
  const [firstAnimation, setFirstAnimation] = useState(true);
  const { scrollY } = useScroll();

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
    scrollToTop(pagesRefs[i].current.offsetTop - 128);
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target) && isOpen) {
      toggleOpen();
    }
  }

  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   const previous = scrollY.getPrevious();
  //   if (latest > previous && latest > 150 && isMobile) {
  //     setFirstAnimation(false);
  //     setIsHidden(true);
  //   } else {
  //     setIsHidden(false);
  //   }
  // });

  useEffect(() => {
    if (isHidden && isOpen) toggleOpen();
  }, [isHidden]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)

    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (projectsRedirect) {
      scrollToTop(pagesRefs[1].current.offsetTop - 128, "instant");
      setScrolledToProjects(true);
    }
  }, [projectsRedirect]);

  return (
    <motion.div
      initial={isNotHome ? { opacity: 0 } : { y: '-100%' }}
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%" }
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: firstAnimation && !isNotHome ? 1.8 : 0.35, ease: 'easeInOut' }}
      className={`portfolio-navbar ${isNotHome ? 'absolute' : 'fixed'} justify-between top-0 left-0 flex w-full p-5 text-white z-40 backdrop-filter backdrop-blur sm:backdrop-blur-none`}
    >
      {!isNotHome ? (
        <div className='current-pages-names flex gap-2'>
          {currentPagesNames.map((name, i) => (
            <div key={name} className='flex items-center gap-2 h-[24px]'>
              <div
                onClick={(e) => handlePaginationClick(e, i)}
                className={`fadein-anim font-bold cursor-pointer ${currentPage === i + 1 ? 'underline transition-all decoration-lime underline-offset-4' : 'no-underline'} text-white`}
              >{name}</div>
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
                        <p>{langText.pagination?.dots}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              }
            </div>
          ))}
        </div>
      ) : (
        <div className='flex gap-2'>
          <Link to="/test" className='font-bold'>Home</Link>
          {isProjects && (
            <>
              <BreadcrumbSeparator className='[&>svg]:size-5' />
              <Link to="/test" state={{ projectsRedirect: true }} className='font-bold'>{langText.pagination?.projects}</Link>
            </>
          )}
        </div>

      )}
      <motion.nav
        initial={false}
        animate={isOpen ? "open" : "closed"}
        custom={height}
        ref={containerRef}
      >
        <Navigation isOpen={isOpen} />
        <MenuToggle toggle={() => toggleOpen()} />
      </motion.nav>
    </motion.div>
  )
}

export default Navbar