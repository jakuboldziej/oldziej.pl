import React from 'react'
import Darts from "@/assets/images/Portfolio/AboutPage/darts.jpg"
import Cloud from "@/assets/images/Portfolio/ExperiencePage/cloud.png"
import Oldziej from "@/assets/images/Portfolio/ExperiencePage/oldziej.png"
import Hagapolska from "@/assets/images/Portfolio/ExperiencePage/hagapolska.png"
import Mmagusiak from "@/assets/images/Portfolio/ExperiencePage/mmagusiak.jpg"
import ProjectCard from './ProjectCard'

function ExperienceProjects() {
  return (
    <div className='projects flex flex-wrap justify-center gap-10 w-full h-full'>
      <ProjectCard image={Mmagusiak} link='https://www.mmagusiak.com' linkText="www.mmagusiak.com" redirect="/test/projects/mmagusiak" />
      <ProjectCard image={Hagapolska} link='https://hagapolska.pl' linkText="hagapolska.pl" redirect="/test/projects/hagapolska" />
      <ProjectCard image={Oldziej} link='https://oldziej.pl' linkText="oldziej.pl" redirect="/test/projects/oldziej" />
      <ProjectCard image={Darts} link='https://home.oldziej.pl/darts' linkText="Darts Web App" redirect="/test/projects/darts" />
      <ProjectCard image={Cloud} link='https://home.oldziej.pl/ftp' linkText="Cloud Web App" redirect="/test/projects/cloud" />
    </div>
  )
}

export default ExperienceProjects