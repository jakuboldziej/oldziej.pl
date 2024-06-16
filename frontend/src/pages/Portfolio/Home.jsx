import "@/assets/styles/portfolio.scss"
import React, { useEffect, useRef, useState } from 'react'
import MyParticles from '@/components/Portfolio/MyParticles'
import LandingPage from '@/components/Portfolio/LandingPage'
import Navbar from '@/components/Portfolio/Navbar/Navbar'
import { useInView } from 'framer-motion'
import Experience from '@/components/Portfolio/Experience'
import Footer from '@/components/Portfolio/Footer'
import About from '@/components/Portfolio/About'

function Home() {
  document.title = "Oldziej | Portfolio";

  // Pagination
  const landingPageRef = useRef(null);
  const experienceRef = useRef(null);
  const aboutRef = useRef(null);

  const pagesRefs = [landingPageRef, experienceRef, aboutRef];

  const [currentPage, setCurrentPage] = useState(1);
  const projectsInView = useInView(experienceRef, { amount: 0.3, once: true });
  const aboutInView = useInView(aboutRef, { amount: 0.3, once: true });

  useEffect(() => {
    if (aboutInView || projectsInView) setCurrentPage((prev) => prev + 1);
  }, [aboutInView, projectsInView]);

  // Scroll to top on refresh
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
          <Experience experienceRef={experienceRef} />
          <About aboutRef={aboutRef} />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Home