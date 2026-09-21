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
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Archive, LayoutGrid, Settings, Sparkles, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@clerk/nextjs"

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
            <Button>+ Create New Board</Button>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>My Boards</SidebarGroupLabel>
            <SidebarMenuButton className="p-5" isActive={path === "/dashboard"}>
                <LayoutGrid />
                <span>My Files</span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5 mt-2" isActive={path === "/shared-file"}>
                <Users />
                <span>Shared</span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5 mt-2" isActive={path === "/archived"}>
                <Archive />
                <span>Archived</span>
            </SidebarMenuButton>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>Others</SidebarGroupLabel>
            <SidebarMenuButton className="p-5 mt-2" isActive={path === "/ai"}>
                <Sparkles />
                <span>AI Helper</span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5 mt-2" isActive={path === "/settings"}>
                <Settings />
                <span>Setting</span>
            </SidebarMenuButton>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
            <Button>+ Create New Board</Button>
        <div className="p-4 my-3 border rounded-md">
            <h2 className="text flex justify-between">
                2 Files Created <span>total 3</span>
            </h2>
            <Progress value={66} className={"h-2 mt-2"} />
        </div>
        <div className="flex items-center gap-2 p-4 rounded-md border">
            <Image src={user?.imageUrl!} alt="Uses Image" width={40} height={40} className="rounded-full"/>
            <h2 className="font-semibold">{user?.firstName} {user?.lastName}</h2>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}