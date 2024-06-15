import React from 'react'

function Projects({ projectsRef }) {
  return (
    <section ref={projectsRef} id='projects'>
      <div className='portfolio-projects w-full flex flex-col justify-evenly'>
        Projects
      </div>
    </section>
  )
}

export default Projects