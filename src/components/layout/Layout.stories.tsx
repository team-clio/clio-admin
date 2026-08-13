import { useState } from 'react'
import { ProjectPicker } from './ProjectPicker'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export default { title: 'Organisms/Navigation', parameters: { layout: 'fullscreen' } }

const demoProjects = [{ id: 'clio-product', name: 'Clio Product' }, { id: 'clio-web', name: 'Clio Web' }]

function PickerDemo() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(demoProjects[0].id)
  return <div className="w-56"><ProjectPicker projects={demoProjects} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} loading={false} loadError="" onCreateProject={async (name) => ({ id: name, name })} /></div>
}

function SidebarDemo({ page = 'reports' }: { page?: 'reports' | 'issues' | 'mcp' | 'system' }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(demoProjects[0].id)
  return <div className="relative h-[720px] bg-[#f5f6f8]"><Sidebar page={page} navigate={() => {}} projects={demoProjects} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} projectsLoading={false} projectsError="" onCreateProject={async (name) => ({ id: name, name })} className="flex !absolute !bottom-0 !top-0" /></div>
}

export const ProjectSelector = { parameters: { layout: 'centered' }, render: () => <PickerDemo /> }
export const SidebarReports = { render: () => <SidebarDemo /> }
export const SidebarSystemSettings = { render: () => <SidebarDemo page="system" /> }
export const Header = { render: () => <div className="h-20"><TopBar onMenu={() => {}} /></div> }
