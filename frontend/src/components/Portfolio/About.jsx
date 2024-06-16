import React from 'react'
import { motion, useInView } from 'framer-motion'
import AboutBentoGrid from './AboutComponents/AboutBentoGrid'

function About({ aboutRef }) {
  const aboutInView = useInView(aboutRef, { amount: 0.9 });

  const isMobile = window.innerWidth < 640;

  return (
    <section ref={aboutRef} id='about-me'>
      <motion.div
        initial={{ y: isMobile ? 0 : -100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className='portfolio-about-me w-full flex sm:items-center justify-center'
      >
        <AboutBentoGrid aboutInView={aboutInView} isMobile={isMobile} />
      </motion.div>
    </section>
  )
}

export default About