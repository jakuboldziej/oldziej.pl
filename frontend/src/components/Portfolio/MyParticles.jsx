import { motion } from "framer-motion"
import Particles from '@/components/ui/magicui/particles'

function MyParticles() {
  const isMobile = window.innerWidth < 640;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 3 }}
      className='particles fixed top-0 left-0 h-screen w-full'
    >
      <Particles className='h-full' quantity={isMobile ? 250 : 500} />
    </motion.div>
  )
}

export default MyParticles