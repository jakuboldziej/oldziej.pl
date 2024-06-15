import { motion } from "framer-motion"
import Particles from '../magicui/particles'

function MyParticles() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 3 }}
      className='particles fixed h-screen w-full'
    >
      <Particles className='h-full' />
    </motion.div>
  )
}

export default MyParticles