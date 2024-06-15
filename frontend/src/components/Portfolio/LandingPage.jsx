import React from 'react'
import { FadeText } from '@/components/magicui/fade-text'
import { motion } from "framer-motion"
import BoxReveal from '@/components/magicui/box-reveal'
import TypingAnimation from '@/components/magicui/typing-animation'

function LandingPage({ landingPageRef }) {
  return (
    <section ref={landingPageRef} id='landing-page' className='pointer-events-none'>
      <div className='portfolio-desc w-full flex flex-col justify-evenly mt-[64px]'>
        <div className='flex flex-col items-center gap-3 h-36'>
          <FadeText className='text-5xl font-bold' text='Jakub' framerProps={{ show: { transition: { delay: 0.3 } } }} />
          <FadeText className='text-5xl font-bold' text='Ołdziejewski' framerProps={{ show: { transition: { delay: 0.6 } } }} />
          <BoxReveal duration={1}>
            Full-stack Developer
          </BoxReveal>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className='flex justify-center'>
          <TypingAnimation className='w-[41rem] min-h-[15rem]	leading-[3rem]' duration={60}
            text={`I'm a ${new Date().getFullYear() - 2004}-year-old freelance full-stack developer. I enjoy tackling development challenges and automating processes to improve efficiency.`} />
        </motion.div>
      </div>
    </section>
  )
}

export default LandingPage