import ProjectList from '@/components/custom/dashboard/ProjectList'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'
import { UserButton } from '@clerk/nextjs'

const DashboardPage = () => {
  return (
    <div>
        <WelcomeBanner />
        <ProjectList />
    </div>
  )
}

export default DashboardPage