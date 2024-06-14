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
          className='particles fixed h-screen w-full'
        >
          <Particles className='h-full' />
        </motion.div>
        <div className='home-portfolio-content h-full flex flex-col items-center text-white'>
          <div className='w-full h-[600px] pt-20'>
            <div className='relative flex flex-col items-center gap-3 h-36'>
              <FadeText className='text-5xl' text='Jakub' framerProps={{ show: { transition: { delay: 0.3 } } }} />
              <FadeText className='text-5xl' text='Ołdziejewski' framerProps={{ show: { transition: { delay: 0.6 } } }} />
              <BoxReveal duration={1}>
                Full-stack Developer
              </BoxReveal>
            </div>
          </div>
          <div className='flex flex-col items-center w-full h-80 border-t border-[#b7eb34] '>
            <div className='flex items-center justify-center bg-slate-500 w-full h-10 p-6'>
              Home
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home