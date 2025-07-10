import IconCloud from '@/components/ui/magicui/icon-cloud';
import { motion } from 'framer-motion';
import React, { memo } from 'react'

const programmingLanguages = [
  "typescript",
  "javascript",
  "python",
  "html5",
  "css3",
  "cplusplus",
  "php",
  "openjdk"
];

const frameworks = [
  "nextdotjs",
  "nodedotjs",
  "threedotjs",
  "express",
  "fastapi",
  "flask",
  "django",
  "react",
  "socketdotio",
  "electron",
  "tailwindcss",
  "framer",
  "sass",
  "npm",
  "shadcnui",
  "auth0",
  "chartdotjs",
  "svelte"
];

const services = [
  "mongodb",
  "firebase",
  "figma",
  "github",
  "git",
  "postman",
  "replit",
  "apache",
  "postgresql",
  "mysql",
  "vercel",
  "netlify",
  "trello",
  "digitalocean",
  "openjdk",
  "jira",
  "confluence",
  "gitlab"
]

function IconClouds() {
  const isMobile = window.innerWidth < 640;

  return (
    <motion.div
      initial={{ opacity: isMobile ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3, offset: 0 }}
      className='flex gap-10 flex-col sm:flex-row pointer-events-none sm:pointer-events-auto'
    >
      <IconCloud iconSlugs={programmingLanguages} />
      <IconCloud iconSlugs={frameworks} />
      <IconCloud iconSlugs={services} />
    </motion.div>
  )
}

export default memo(IconClouds);