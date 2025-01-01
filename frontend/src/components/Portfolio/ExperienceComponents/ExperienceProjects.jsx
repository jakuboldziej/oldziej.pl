import React from 'react'
import Darts from "@/assets/images/Portfolio/AboutPage/darts.jpg"
import Cloud from "@/assets/images/Portfolio/ExperiencePage/cloud.webp"
import Oldziej from "@/assets/images/Portfolio/ExperiencePage/oldziej.webp"
import Hagapolska from "@/assets/images/Portfolio/ExperiencePage/hagapolska.webp"
import Mmagusiak from "@/assets/images/Portfolio/ExperiencePage/mmagusiak.webp"
import PromaxSport from "@/assets/images/Portfolio/ExperiencePage/promaxsport.webp"
import HomeApp from "@/assets/images/Portfolio/ExperiencePage/home-app.png"
import ProjectCard from './ProjectCard'

function ExperienceProjects() {
  return (
    <div className='projects flex flex-wrap justify-center gap-10 w-full h-full'>
      <ProjectCard image={PromaxSport} link='https://promaxsport.pl' linkText="promaxsport.pl" redirect="/projects/promaxsport" />
      <ProjectCard image={Mmagusiak} link='https://www.mmagusiak.com' linkText="www.mmagusiak.com" redirect="/projects/mmagusiak" />
      <ProjectCard image={Hagapolska} link='https://www.hagapolska.pl' linkText="www.hagapolska.pl" redirect="/projects/hagapolska" />
      <ProjectCard image={Oldziej} link='https://oldziej.pl' linkText="oldziej.pl" redirect="/projects/oldziej" />
      <ProjectCard image={Darts} link='https://home.oldziej.pl/darts' linkText="Darts Web App" redirect="/projects/darts" />
      <ProjectCard image={Cloud} link='https://home.oldziej.pl/cloud' linkText="Cloud Web App" redirect="/projects/cloud" />
      {/* <ProjectCard image={HomeApp} link='https://home.oldziej.pl/' linkText="Home App" redirect="/projects/home-app" /> */}
    </div>
  )
}

export default ExperienceProjects