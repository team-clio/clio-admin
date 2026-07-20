import { useState } from 'react'
import { ProjectPicker } from './ProjectPicker'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export default { title: 'Organisms/Navigation', parameters: { layout: 'fullscreen' } }

function PickerDemo() {
  const [projects, setProjects] = useState(['Clio Product', 'Clio Web'])
  const [selectedProject, setSelectedProject] = useState('Clio Product')
  return <div className="w-56"><ProjectPicker {...{ projects, setProjects, selectedProject, setSelectedProject }} /></div>
}

function SidebarDemo({ page = 'reports' }) {
  const [projects, setProjects] = useState(['Clio Product', 'Clio Web'])
  const [selectedProject, setSelectedProject] = useState('Clio Product')
  return <div className="relative h-[720px] bg-[#f5f6f8]"><Sidebar page={page} navigate={() => {}} projects={projects} setProjects={setProjects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} className="flex !absolute !bottom-0 !top-0" /></div>
}

export const ProjectSelector = { parameters: { layout: 'centered' }, render: () => <PickerDemo /> }
export const SidebarReports = { render: () => <SidebarDemo /> }
export const SidebarSystemSettings = { render: () => <SidebarDemo page="system" /> }
export const Header = { render: () => <div className="h-20"><TopBar onMenu={() => {}} /></div> }
