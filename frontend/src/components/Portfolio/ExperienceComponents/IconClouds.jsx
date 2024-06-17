import IconCloud from '@/components/ui/magicui/icon-cloud';
import React from 'react'

const programmingLanguages = [
  "typescript",
  "javascript",
  "python",
  "html5",
  "css3",
  "csharp",
  "cplusplus",
  "php",
  "java",
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
  "chartdotjs"
];

const services = [
  "mongodb",
  "oracle",
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
  "digitalocean"
]

function IconClouds() {
  return (
    <div className='flex gap-10 flex-col sm:flex-row'>
      <IconCloud iconSlugs={programmingLanguages} />
      <IconCloud iconSlugs={frameworks} />
      <IconCloud iconSlugs={services} />
    </div>
  )
}

export default IconClouds