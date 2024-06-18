import MyParticles from '@/components/Portfolio/MyParticles'
import Navbar from '@/components/Portfolio/Navbar'
import { useParams } from 'react-router';
import ImgMainMmagusiak from "@/assets/images/ProjectsImages/main-mmagusiak.png"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { SiBootstrap, SiFirebase, SiFramer, SiReact, SiSanity, SiUbuntu } from '@icons-pack/react-simple-icons';

function Project() {
  const { projectName } = useParams();

  const [mainImage, setMainImage] = useState(null);
  const [mainLink, setMainLink] = useState('');
  const [designedBy, setDesignedBy] = useState('');
  const [techStackIcons, setTechStackIcons] = useState([]);

  useEffect(() => {
    if (projectName === "mmagusiak") {
      setMainImage(ImgMainMmagusiak);
      setMainLink("www.mmagusiak.com");
      setDesignedBy('Mateusz Magusiak')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiBootstrap key={'#7952B3'} width={46} height={46} fill='#7952B3' />,
        <SiSanity key={'#F03E2F'} width={46} height={46} fill='#F03E2F' />,
        <SiFirebase key={'#DD2C00'} width={46} height={46} fill='#DD2C00' />,
      ]);
    } else if (projectName === "hagapolska") {
      setMainImage(ImgMainMmagusiak);
      setMainLink("www.mmagusiak.com");
      setDesignedBy('Mateusz Magusiak')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiBootstrap key={'#7952B3'} width={46} height={46} fill='#7952B3' />,
        <SiSanity key={'#F03E2F'} width={46} height={46} fill='#F03E2F' />,
        <SiFirebase key={'#DD2C00'} width={46} height={46} fill='#DD2C00' />,
      ]);
    }
  }, [projectName]);

  return (
    <div className='project-portfolio rubik'>
      <Navbar isNotHome={true} />
      <MyParticles />
      <motion.div className='project-portfolio-content relative text-2xl p-1 sm:p-[3vw] sm:pt-0 h-[200vh] text-white flex flex-col gap-10'>
        <img alt={mainImage} src={mainImage} />
        <Button
          title={mainLink}
          onClick={() => window.open(mainLink)}
          variant='outline_white'
          className='flex items-center gap-3 w-fit'
        >
          {mainLink}
          <SquareArrowOutUpRight />
        </Button>
        <span><span className='font-bold'>Designed by: </span>{designedBy}</span>
        <div className='flex flex-col'>
          <span className='font-bold'>Tech Stack:</span>
          <div className='icons flex flex-row gap-5 p-5'>
            {techStackIcons}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Project