import MyParticles from '@/components/Portfolio/MyParticles'
import Navbar from '@/components/Portfolio/Navbar'
import { useParams } from 'react-router';
import ImgMmagusiak from "@/assets/images/Portfolio/ProjectsImages/mmagusiak.png"
import ImgMmagusiakMobile from "@/assets/images/Portfolio/ProjectsImages/mmagusiak_mobile.png"
import ImgHagaPolska from "@/assets/images/Portfolio/ProjectsImages/hagapolska.png"
import ImgHagaPolskaMobile from "@/assets/images/Portfolio/ProjectsImages/hagapolska_mobile.png"
import ImgDarts from "@/assets/images/Portfolio/ProjectsImages/darts.png"
import ImgDartsMobile from "@/assets/images/Portfolio/ProjectsImages/darts_mobile.png"
import ImgOldziej from "@/assets/images/Portfolio/ProjectsImages/oldziej.png"
import ImgOldziejMobile from "@/assets/images/Portfolio/ProjectsImages/oldziej_mobile.png"
import ImgCloud from "@/assets/images/Portfolio/ProjectsImages/cloud.png"
import ImgCloudMobile from "@/assets/images/Portfolio/ProjectsImages/cloud_mobile.png"
import MagicUiIcon from "@/assets/images/icons/magicui_icon.png"
import LucideIcon from "@/assets/images/icons/lucide_icon.svg"
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { SiBootstrap, SiChartdotjs, SiExpress, SiFirebase, SiFramer, SiIcons8, SiLeaflet, SiMongodb, SiReact, SiSanity, SiSass, SiShadcnui, SiSimpleicons, SiTailwindcss } from '@icons-pack/react-simple-icons';
import { PortfolioContext } from '@/context/PortfolioContext';
import { scrollToTop } from '@/components/Portfolio/utils';

function Project() {
  const { langText } = useContext(PortfolioContext);
  const { projectName } = useParams();

  const isMobile = window.innerWidth < 640;

  const [mainImage, setMainImage] = useState(null);
  const [mainLink, setMainLink] = useState({ text: '', href: '' });
  const [designedBy, setDesignedBy] = useState('');
  const [techStackIcons, setTechStackIcons] = useState([]);

  useEffect(() => {
    if (projectName === "mmagusiak") {
      setMainImage(isMobile ? ImgMmagusiakMobile : ImgMmagusiak);
      setMainLink({ text: "www.mmagusiak.com", href: 'https://www.mmagusiak.com' });
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
      setMainLink({ text: "hagapolska.pl", href: 'https://hagapolska.pl' });
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
      setMainLink({ text: "home.oldziej.pl/darts", href: 'https://home.oldziej.pl/darts' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiMongodb key={'#47A248'} width={46} height={46} fill='#47A248' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiIcons8 key={'#1FB141'} width={46} height={46} fill='#1FB141' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <SiChartdotjs key={'#FF6384'} width={46} height={46} fill='#FF6384' />,
      ]);
    } else if (projectName === "cloud") {
      setMainImage(isMobile ? ImgCloudMobile : ImgCloud);
      setMainLink({ text: "home.oldziej.pl/cloud", href: 'https://home.oldziej.pl/cloud' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiMongodb key={'#47A248'} width={46} height={46} fill='#47A248' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <img key='lucide-react' title='lucide-react' alt='lucide-react' src={LucideIcon} width={46} height={46} />,
      ]);
    } else if (projectName === "oldziej") {
      setMainImage(isMobile ? ImgOldziejMobile : ImgOldziej);
      setMainLink({ text: "oldziej.pl", href: 'https://oldziej.pl' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <img key={'magicui'} title='magicui' alt='magicui' src={MagicUiIcon} width={46} height={46} />,
        <SiSimpleicons key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
      ]);
    }
  }, [projectName]);

  useEffect(() => {
    document.title = "Oldziej | " + mainLink.text;
  }, [mainLink]);

  useLayoutEffect(() => {
    scrollToTop(0, 'instant');
  }, [])

  return (
    <div className='project-portfolio rubik'>
      <Navbar isNotHome={true} isProjects={true} />
      <MyParticles />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className='project-portfolio-content relative text-2xl mt-[64px] p-5 pt-0 sm:p-[3vw] sm:pt-0 text-white flex flex-col gap-10'
      >

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