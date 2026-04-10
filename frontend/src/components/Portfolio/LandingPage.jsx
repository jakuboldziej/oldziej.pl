import React, { useContext } from 'react'
import { FadeText } from '@/components/ui/magicui/fade-text'
import { motion } from "framer-motion"
import BoxReveal from '@/components/ui/magicui/box-reveal'
import { PortfolioContext } from '@/context/Portfolio/PortfolioContext'

const ReliableTypingAnimation = ({ text, className }) => {
  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.8,
        staggerChildren: 0.033,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={childVariants}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

function LandingPage({ landingPageRef }) {
  const { lang, langText } = useContext(PortfolioContext);

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

        <div className='flex justify-center'>
          {langText.landingPage &&
            <ReliableTypingAnimation
              className={`${lang === "en" ? 'w-[40.5rem] min-h-[288px]' : 'w-[42rem] min-h-[336px]'}  px-[4vw] sm:px-0 text-3xl sm:text-4xl sm:leading-[3rem] text-center`}
              text={langText.landingPage.desc}
            />
          }
        </div>
      </div>
    </section>
  )
}

export default LandingPage