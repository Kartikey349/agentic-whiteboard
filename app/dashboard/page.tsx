import ProjectList from '@/components/custom/dashboard/ProjectList'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'

const DashboardPage = () => {
  return (
    <div>
        <WelcomeBanner />
        <ProjectList />
    </div>
  )
}

export default DashboardPage