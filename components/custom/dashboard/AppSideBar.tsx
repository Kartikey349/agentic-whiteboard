import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <Image src={"/logo.svg"} alt="logo" width={40} height={40} />
            <h2 className="text-xl font-bold">Drawgon</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <Button>Create New Board</Button>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}