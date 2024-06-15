import React, { useEffect, useRef, useState } from 'react'
import MyParticles from '@/components/Portfolio/MyParticles'
import LandingPage from '@/components/Portfolio/LandingPage'
import "@/assets/styles/portfolio.scss"
import Navbar from '@/components/Portfolio/Navbar/Navbar'
import { useScroll } from 'framer-motion'
import Projects from '@/components/Portfolio/Projects'
import Footer from '@/components/Portfolio/Footer'
import About from '@/components/Portfolio/About'

function Home() {
  document.title = "Oldziej | Portfolio";

  const { scrollY } = useScroll();
  const [currentPage, setCurrentPage] = useState(1);
  const landingPageRef = useRef(null);
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);

  const pagesRefs = [landingPageRef, projectsRef, aboutRef];

  scrollY.on('change', () => {
    const calcCurrentPage = scrollY.current / window.innerHeight
    if (calcCurrentPage % 1 === 0) {
      setCurrentPage(calcCurrentPage + 1);
    }
  });

  window.onbeforeunload = () => {
    window.scrollTo(0, 0);
  }

  return (
    <>
      <div className='home-portfolio rubik'>
        <Navbar currentPage={currentPage} pagesRefs={pagesRefs} />
        <MyParticles />
        <div className='home-portfolio-content text-white'>
          <LandingPage landingPageRef={landingPageRef} />
          <Projects projectsRef={projectsRef} />
          <About aboutRef={aboutRef} />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Home