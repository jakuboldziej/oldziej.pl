import "@/assets/styles/portfolio.scss"
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import MyParticles from '@/components/Portfolio/MyParticles'
import LandingPage from '@/components/Portfolio/LandingPage'
import Navbar from '@/components/Portfolio/Navbar'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import Experience from '@/components/Portfolio/Experience'
import Footer from '@/components/Portfolio/Footer'
import About from '@/components/Portfolio/About'
import { useLocation } from "react-router"
import { calcCurrentPage, scrollToTop } from "@/components/Portfolio/utils"

function Home() {
  document.title = "Oldziej | Portfolio";

  const isMobile = window.innerWidth < 640;

  const location = useLocation();
  const projectsRedirect = location.state?.projectsRedirect || false;
  const [scrolledToProjects, setScrolledToProjects] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination
  const [isScrolling, setIsScrolling] = useState(false);
  const landingPageRef = useRef(null);
  const experienceRef = useRef(null);
  const aboutRef = useRef(null);

  const pagesRefs = [landingPageRef, experienceRef, aboutRef];

  const [currentPage, setCurrentPage] = useState(1);

  const { scrollY } = useScroll();

  // Calculate current page
  useMotionValueEvent(scrollY, "change", (latest) => {
    if(!drawerOpen) calcCurrentPage(latest, pagesRefs, currentPage, setCurrentPage, isMobile);
    setIsScrolling(true);
  });

  // Scroll to top on refresh
  useLayoutEffect(() => {
    window.history.replaceState({}, '');
    if (!projectsRedirect) scrollToTop(0);
  }, []);

  useEffect(() => {
    console.log(drawerOpen);
  }, [drawerOpen]);

  const experienceParams = { experienceRef, projectsRedirect, scrolledToProjects, drawerOpen, setDrawerOpen };

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className='home-portfolio rubik relative'
    >
      <Navbar currentPage={currentPage} pagesRefs={pagesRefs} projectsRedirect={projectsRedirect} setScrolledToProjects={setScrolledToProjects} />
      <MyParticles />
      <div className='home-portfolio-content text-white'>
        <LandingPage landingPageRef={landingPageRef} />
        <Experience params={experienceParams} />
        <About aboutRef={aboutRef} />
        <Footer />
      </div>
    </motion.div>
  )
}

export default Home