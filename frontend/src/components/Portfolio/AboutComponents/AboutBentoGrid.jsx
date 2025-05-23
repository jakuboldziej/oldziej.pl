import React, { useContext, useEffect, useState } from 'react'
import { BentoCard, BentoGrid } from '@/components/ui/magicui/bento-grid'
import { Car, MountainSnow, PersonStanding, Target } from 'lucide-react'
import Bouldering from "@/assets/images/Portfolio/AboutPage/bouldering.jfif"
import Formula1 from "@/assets/images/Portfolio/AboutPage/formula1.jpg"
import Formula1Mobile from "@/assets/images/Portfolio/AboutPage/formula1_mobile.png"
import Darts from "@/assets/images/Portfolio/AboutPage/darts.jpg"
import Breaking from "@/assets/videos/breaking.mp4"
import { PortfolioContext } from '@/context/Portfolio/PortfolioContext'

function AboutBentoGrid({ aboutInView, isMobile }) {
  const { langText } = useContext(PortfolioContext);

  const [cardFeatuers, setCardFeatuers] = useState();

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
          background: <video src={Breaking} loop muted={true} autoPlay={!aboutInView} className="absolute top-0 [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
          className: "sm:col-start-1 sm:col-end-1 sm:row-start-1 sm:row-end-3 max-w-[410px] min-h-[410px] sm:min-h-fit",
        },
        {
          Icon: MountainSnow,
          name: "Bouldering",
          description: langText.about.descBouldering,
          href: "https://groto.pl/wroclaw/",
          target: "_blank",
          cta: langText.about.ctaBouldering,
          background: <img alt='Bouldering' src={Bouldering} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
          className: "sm:col-start-2 sm:col-end-2 sm:row-start-1 sm:row-end-2 max-w-[410px] min-h-[410px] sm:min-h-fit",
        },
        {
          Icon: Target,
          name: "Darts",
          numberTicker: true,
          href: "/projects/darts",
          target: "_parent",
          cta: langText.about.ctaDarts,
          background: <img alt='Darts' src={Darts} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
          className: "sm:col-start-2 sm:col-end-2 sm:row-start-2 sm:row-end-3 max-w-[410px] min-h-[410px] sm:min-h-fit",
        },
        {
          Icon: Car,
          name: "Formula 1",
          description: langText.about.descFormulaOne,
          href: "https://en.wikipedia.org/wiki/Formula_One",
          target: "_blank",
          cta: "Wikipedia",
          background: <img alt='Formula 1' src={isMobile ? Formula1Mobile : Formula1} className="absolute w-full h-5/6 [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
          className: "sm:col-start-3 sm:col-end-3 sm:row-start-1 sm:row-end-3 max-w-[410px] min-h-[410px] sm:min-h-fit",
        },
      ])
    }
  }, [langText]);

  return (
    <>
      {cardFeatuers &&
        <BentoGrid className="sm:grid-rows-2 sm:h-5/6 xl:h-3/4 ">
          {cardFeatuers.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      }
    </>
  )
}

export default AboutBentoGrid