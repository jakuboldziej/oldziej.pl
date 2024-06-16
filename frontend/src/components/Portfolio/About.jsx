import React, { useContext, useEffect, useState } from 'react'
import { BentoCard, BentoGrid } from '../magicui/bento-grid'
import { Car, MountainSnow, PersonStanding, Target } from 'lucide-react'
import Bouldering from "@/assets/images/bouldering.jfif"
import Formula1 from "@/assets/images/formula1.jpg"
import Formula1Mobile from "@/assets/images/formula1_mobile.png"
import Darts from "@/assets/images/darts.webp"
import Breaking from "@/assets/videos/breaking.mp4"
import { LangContext } from '@/context/LangContext'
import { motion, useInView } from 'framer-motion'

function About({ aboutRef }) {
  const { langText } = useContext(LangContext);

  const aboutInView = useInView(aboutRef, {amount: 0.9});

  const [cardFeatuers, setCardFeatuers] = useState();

  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    if (langText.about) {
      setCardFeatuers([
        {
          Icon: PersonStanding,
          name: "Breaking",
          description: langText.about.descBreaking,
          href: "https://www.instagram.com/bbkubek/",
          target: "_blank",
          cta: langText.about.ctaBreaking,
          background: <video src={Breaking} loop muted={true} autoPlay={!aboutInView} className="absolute top-0 h-max [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
          className: "sm:col-start-1 sm:col-end-1 sm:row-start-1 sm:row-end-4 max-w-[410px]",
        },
        {
          Icon: MountainSnow,
          name: "Bouldering",
          description: langText.about.descBouldering,
          href: "https://groto.pl/wroclaw/",
          target: "_blank",
          cta: langText.about.ctaBouldering,
          background: <img alt='Bouldering' src={Bouldering} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
          className: "sm:col-start-2 sm:col-end-2 sm:row-start-1 sm:row-end-3 max-w-[410px]",
        },
        {
          Icon: Target,
          name: "Darts",
          numberTicker: true,
          href: "/projects/darts",
          target: "_parent",
          cta: langText.about.ctaDarts,
          background: <img alt='Darts' src={Darts} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
          className: "sm:col-start-2 sm:col-end-2 sm:row-start-3 sm:row-end-4 max-w-[410px]",
        },
        {
          Icon: Car,
          name: "Formula 1",
          description: langText.about.descFormulaOne,
          href: "https://en.wikipedia.org/wiki/Formula_One",
          target: "_blank",
          cta: "Wikipedia",
          background: <img alt='Formula 1' src={isMobile ? Formula1Mobile : Formula1} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
          className: "sm:col-start-3 sm:col-end-3 sm:row-start-1 sm:row-end-4 max-w-[410px]",
        },
      ])
    }
  }, [langText]);

  return (
    <section ref={aboutRef} id='about-me'>
      <motion.div
        initial={{ y: isMobile ? 0 : -100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        className='portfolio-about-me w-full flex sm:items-center justify-center'
      >
        {cardFeatuers &&
          <BentoGrid className="sm:grid-rows-2 h-3/4">
            {cardFeatuers.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        }
      </motion.div>
    </section>
  )
}

export default About