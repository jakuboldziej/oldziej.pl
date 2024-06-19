import React, { useContext } from 'react'
import { FadeText } from '@/components/ui/magicui/fade-text'
import { motion } from "framer-motion"
import BoxReveal from '@/components/ui/magicui/box-reveal'
import TypingAnimation from '@/components/ui/magicui/typing-animation'
import { LangContext } from '@/context/LangContext'

function LandingPage({ landingPageRef }) {
  const { lang, langText } = useContext(LangContext);

  return (
    <section ref={landingPageRef} id='landing-page'>
      <div className='portfolio-landing-page w-full flex flex-col justify-evenly h-screen sm:h-screen'>
        <div className='flex flex-col items-center gap-3 h-36'>
          <FadeText className='text-5xl font-bold' text='Jakub' framerProps={{ show: { transition: { delay: 0.3 } } }} />
          <FadeText className='text-5xl font-bold' text='Ołdziejewski' framerProps={{ show: { transition: { delay: 0.6 } } }} />
          <BoxReveal duration={1}>
            Full-stack Developer
          </BoxReveal>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className='flex justify-center'
        >
          {langText.landingPage &&
            <TypingAnimation
              className={`${lang === "en" ? 'w-[41rem] min-h-[252px]' : 'w-[42rem] min-h-[324px]'}  px-[5vw] sm:px-0 text-3xl sm:text-4xl sm:leading-[3rem]`}
              duration={60}
              text={langText.landingPage.desc} />
          }
        </motion.div>
      </div>
    </section>
  )
}

export default LandingPage