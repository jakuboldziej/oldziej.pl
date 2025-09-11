import Zaslepka from '@/components/Portfolio/Zaslepka'
import Home from '@/pages/Portfolio/Home'
import NotFoundPortfolio from '@/pages/Portfolio/NotFoundPortfolio'
import Project from '@/pages/Portfolio/Project'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Dictionary from '@/pages/Portfolio/Dictionary'

function AppRoutesPortfolio() {
  return (
    <Routes>
      {/* <Route path="/">
        <Route index element={<Zaslepka />} />
      </Route> */}
      <Route path="/">
        <Route index element={<Home />} />
        <Route path="dictionary" element={<Dictionary />} />
        <Route path='projects' element={<Navigate to="/" replace state={{ projectsRedirect: true }} />} />
        <Route path='projects/:projectName' element={<Project />} />
      </Route>
      <Route path="*" element={<NotFoundPortfolio />} />
    </Routes>
  )
}

export default AppRoutesPortfolio