import type { ComponentProps } from 'react'
import DashboardPage from './DashboardPage'

type DashboardProps = ComponentProps<typeof DashboardPage>

function Dashboard(props: DashboardProps) {
  return <DashboardPage {...props} />
}

export default Dashboard
