import React from 'react'
import { BentoCard, BentoGrid } from '../magicui/bento-grid'
import { Car, MountainSnow, PersonStanding, Target } from 'lucide-react'
import Bouldering from "@/assets/images/bouldering.jfif"
import Formula1 from "@/assets/images/formula1.jpg"
import Darts from "@/assets/images/darts.webp"
import Breaking from "@/assets/videos/breaking.mp4"

const features = [
  {
    Icon: PersonStanding,
    name: "Breaking",
    description: "A culture that I grew up in, dancing since 2010.",
    href: "https://www.instagram.com/bbkubek/",
    target: "_blank",
    cta: "See more of me",
    background: <video src={Breaking} loop muted autoPlay={true} className="absolute top-0 h-max [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
    className: "sm:col-start-1 sm:col-end-1 sm:row-start-1 sm:row-end-4 max-w-[410px]",
  },
  {
    Icon: MountainSnow,
    name: "Bouldering",
    description: "I started my climbing journey in 2019 and since then I've become around 6C level climber.",
    href: "https://groto.pl/wroclaw/",
    target: "_blank",
    cta: "Where do I climb?",
    background: <img src={Bouldering} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
    className: "sm:col-start-2 sm:col-end-2 sm:row-start-1 sm:row-end-3 max-w-[410px]",
  },
  {
    Icon: Target,
    name: "Darts",
    description: '',
    numberTicker: true,
    href: "/projects/darts",
    target: "_parent",
    cta: "Check out my app",
    background: <img src={Darts} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />,
    className: "sm:col-start-2 sm:col-end-2 sm:row-start-3 sm:row-end-4 max-w-[410px]",
  },
  {
    Icon: Car,
    name: "Formula 1",
    description: "My brother-in-law introduced me to the world of Formula 1, on the weekends except for dancing in breaking events I like to watch people drive in circles.",
    href: "https://en.wikipedia.org/wiki/Formula_One",
    target: "_blank",
    cta: "Wikipedia",
    background: <img src={Formula1} className="absolute w-full h-full [mask-image:linear-gradient(to_top,transparent_1%,#000_100%)]" />,
    className: "sm:col-start-3 sm:col-end-3 sm:row-start-1 sm:row-end-4 max-w-[410px]",
  },
]

function About({ aboutRef }) {

  return (
    <section ref={aboutRef} id='about-me'>
      <div className='portfolio-about-me w-full flex sm:items-center justify-center'>
        <BentoGrid className="sm:grid-rows-2 h-3/4">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

export default About