import AppHeader from "@/components/custom/dashboard/AppHeader"
import { AppSidebar } from "@/components/custom/dashboard/AppSideBar"
import { SidebarProvider } from "@/components/ui/sidebar"

const DashboardLayout = ({children} : {children : React.ReactNode}) => {
  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          {children}
        </div>
    </SidebarProvider>
  )
}

export default DashboardLayout