import React from 'react'
import Darts from "@/assets/images/AboutPage/darts.jpg"
import Cloud from "@/assets/images/ExperiencePage/cloud.png"
import Hagapolska from "@/assets/images/ExperiencePage/hagapolska.png"
import Mmagusiak from "@/assets/images/ExperiencePage/mmagusiak.jpg"
import ProjectCard from './ProjectCard'

function ExperienceProjects() {
  return (
    <div className='projects flex flex-wrap justify-center gap-10 w-full h-full'>
      <ProjectCard image={Mmagusiak} link={'https://www.mmagusiak.com'} linkText={"www.mmagusiak.com"} redirect={"/test/projects/mmagusiak"} />
      <ProjectCard image={Hagapolska} link={'https://hagapolska.pl'} linkText={"hagapolska.pl"} redirect={"/test/projects/hagapolska"} />
      <ProjectCard image={Darts} link={'https://home.oldziej.pl/darts'} linkText={"Darts Web App"} redirect={"/test/projects"} />
      <ProjectCard image={Cloud} link={'https://home.oldziej.pl/ftp'} linkText={"Cloud Web App"} redirect={"/test/projects"} />
    </div>
  )
}

export default ExperienceProjects