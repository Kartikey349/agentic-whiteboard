import { AppSidebar } from "@/components/custom/dashboard/AppSideBar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const DashboardLayout = ({children} : {children : React.ReactNode}) => {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div>{children}</div>
    </SidebarProvider>
  )
}

export default DashboardLayout