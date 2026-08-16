import { IssuesPage } from './IssuesPage'
import { McpPage } from './McpPage'
import { ReportsPage } from './ReportsPage'
import { SystemSettingsPage } from './SystemSettingsPage'
import { BugDebugPage } from './BugDebugPage'
import { PcmInspectPage } from './PcmInspectPage'

export default { title: 'Pages/Clio Admin', parameters: { layout: 'fullscreen' } }

export const BugReports = { render: () => <ReportsPage projectId={null} /> }
export const Issues = { render: () => <IssuesPage projectId={null} /> }
export const McpIntegration = { render: () => <McpPage /> }
export const SystemSettings = { render: () => <SystemSettingsPage /> }
export const BugRegistrationDebug = { render: () => <BugDebugPage projectId={1} /> }
export const PcmMemory = { render: () => <PcmInspectPage projectId={1} /> }
