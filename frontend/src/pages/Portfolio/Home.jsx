import React, { useEffect, useRef, useState } from 'react'
import MyParticles from '@/components/Portfolio/MyParticles'
import LandingPage from '../../components/Portfolio/LandingPage'
import "/src/styles/portfolio.scss"
import Navbar from '@/components/Portfolio/Navbar'
import { useScroll } from 'framer-motion'
import Projects from '@/components/Portfolio/Projects'

function Home() {
  const { scrollY } = useScroll();
  const [currentPage, setCurrentPage] = useState(1);
  const landingPageRef = useRef(null);
  const projectsRef = useRef(null);

  const pagesRefs = [landingPageRef, projectsRef];

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
      <Navbar currentPage={currentPage} pagesRefs={pagesRefs} />
      <div className='home-portfolio rubik'>
        <MyParticles />
        <div className='home-portfolio-content text-white'>
          <LandingPage landingPageRef={landingPageRef} />
          <Projects projectsRef={projectsRef} />
        </div>
      </div>
    </>
  )
}

export default Home