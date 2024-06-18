import MyParticles from '@/components/Portfolio/MyParticles'
import Navbar from '@/components/Portfolio/Navbar'
import { useParams } from 'react-router';
import ImgMmagusiak from "@/assets/images/ProjectsImages/mmagusiak.png"
import ImgMmagusiakMobile from "@/assets/images/ProjectsImages/mmagusiak_mobile.png"
import ImgHagaPolska from "@/assets/images/ProjectsImages/hagapolska.png"
import ImgHagaPolskaMobile from "@/assets/images/ProjectsImages/hagapolska_mobile.png"
import ImgDarts from "@/assets/images/ProjectsImages/darts.png"
import ImgDartsMobile from "@/assets/images/ProjectsImages/darts_mobile.png"
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { SiBootstrap, SiExpress, SiFirebase, SiFramer, SiLeaflet, SiReact, SiSanity, SiSass, SiShadcnui, SiTailwindcss } from '@icons-pack/react-simple-icons';
import { LangContext } from '@/context/LangContext';

function Project() {
  const { langText } = useContext(LangContext);
  const { projectName } = useParams();

  const isMobile = window.innerWidth < 640;

  const [mainImage, setMainImage] = useState(null);
  const [mainLink, setMainLink] = useState({text: '', href: ''});
  const [designedBy, setDesignedBy] = useState('');
  const [techStackIcons, setTechStackIcons] = useState([]);

  useEffect(() => {
    if (projectName === "mmagusiak") {
      setMainImage(isMobile ? ImgMmagusiakMobile : ImgMmagusiak);
      setMainLink({text: "www.mmagusiak.com", href: 'https://www.mmagusiak.com'});
      setDesignedBy('Mateusz Magusiak')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiBootstrap key={'#7952B3'} width={46} height={46} fill='#7952B3' />,
        <SiSanity key={'#F03E2F'} width={46} height={46} fill='#F03E2F' />,
        <SiFirebase key={'#DD2C00'} width={46} height={46} fill='#DD2C00' />,
      ]);
    } else if (projectName === "hagapolska") {
      setMainImage(isMobile ? ImgHagaPolskaMobile : ImgHagaPolska);
      setMainLink({text: "hagapolska.pl", href: 'https://hagapolska.pl'});
      setDesignedBy('Mateusz Magusiak')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <SiSanity key={'#F03E2F'} width={46} height={46} fill='#F03E2F' />,
        <SiLeaflet key={'#199900'} width={46} height={46} fill='#199900' />,
      ]);
    } else if (projectName === "darts") {
      setMainImage(isMobile ? ImgDartsMobile : ImgDarts);
      setMainLink({text: "oldziej.pl/darts", href: 'https://oldziej.pl/darts'});
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
      ]);
    }
  }, [projectName]);

  return (
    <div className='project-portfolio rubik'>
      <Navbar isNotHome={true} isProjects={true} />
      <MyParticles />
      <motion.div className='project-portfolio-content relative text-2xl mt-[64px] p-5 pt-0 sm:p-[3vw] sm:pt-0 h-[200vh] text-white flex flex-col gap-10'>
        <img alt={mainImage} src={mainImage} />
        <Button
          title={mainLink.href}
          onClick={() => window.open(mainLink.href)}
          variant='outline_white'
          className='flex items-center gap-3 w-fit'
        >
          {mainLink.text}
          <SquareArrowOutUpRight />
        </Button>
        <span className='flex flex-wrap gap-2'>
          <div className='font-bold'>{langText.project?.designedBy}</div>
          <div>{designedBy}</div>
          </span>
        <div className='flex flex-col'>
          <span className='font-bold'>Tech Stack:</span>
          <div className='icons flex flex-row flex-wrap gap-5 pt-5'>
            {techStackIcons}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Project