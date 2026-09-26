"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { Archive, LayoutGrid, Settings, Sparkles, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import CreateNewBoardDialogue from "./CreateNewBoardDialogue"
import Link from "next/link"

export function AppSidebar() {

    const path = usePathname()
    const {user} = useUser()

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
            <CreateNewBoardDialogue />
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>My Boards</SidebarGroupLabel>
            <Link href={"/dashboard"}><SidebarMenuButton className="p-5" isActive={path === "/dashboard"}>
                <LayoutGrid />
                <span>My Files</span>
            </SidebarMenuButton></Link>

            <SidebarMenuButton className="p-5 mt-2" isActive={path === "/shared-file"}>
                <Users />
                <span>Shared</span>
            </SidebarMenuButton>

            <Link href={"/dashboard/archived"}><SidebarMenuButton className="p-5 mt-2" isActive={path === "/dashboard/archived"}>
                <Archive />
                <span>Archived</span>
            </SidebarMenuButton></Link>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
            <CreateNewBoardDialogue />
        <div className="flex items-center gap-2 p-4 rounded-md border">
            {
                user?.imageUrl && <Image src={user?.imageUrl} alt="Uses Image" width={40} height={40} className="rounded-full"/>
            }
            
            <h2 className="font-semibold">{user?.firstName} {user?.lastName}</h2>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}