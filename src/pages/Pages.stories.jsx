import { IssuesPage } from './IssuesPage'
import { McpPage } from './McpPage'
import { ReportsPage } from './ReportsPage'
import { SystemSettingsPage } from './SystemSettingsPage'

export default { title: 'Pages/Clio Admin', parameters: { layout: 'fullscreen' } }

export const BugReports = { render: () => <ReportsPage /> }
export const Issues = { render: () => <IssuesPage /> }
export const McpIntegration = { render: () => <McpPage /> }
export const SystemSettings = { render: () => <SystemSettingsPage /> }
