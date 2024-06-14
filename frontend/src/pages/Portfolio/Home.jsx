import BoxReveal from '@/components/magicui/box-reveal'
import { FadeText } from '@/components/magicui/fade-text'
import Particles from '@/components/magicui/particles.tsx'
import React from 'react'
import { motion } from "framer-motion"

function Home() {
  return (
    <>
      <div className='home-portfolio'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className='particles fixed h-screen w-full'>
          <Particles className='h-full' />
        </motion.div>
        <div className='home-portfolio-content h-screen flex flex-col items-center text-white'>
          <div className='w-full h-80 mt-20'>
            <div className='relative flex flex-col items-center gap-3 h-36'>
              <FadeText className='text-5xl' text='Jakub' framerProps={{ show: { transition: { delay: 0.3 } } }} />
              <FadeText className='text-5xl' text='Ołdziejewski' framerProps={{ show: { transition: { delay: 0.6 } } }} />
              <BoxReveal duration={1}>
                Full-stack Developer
              </BoxReveal>
            </div>
          </div>
          <div className='flex flex-col items-center w-full h-80'>
            <span>asdf</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home