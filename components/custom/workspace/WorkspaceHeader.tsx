import Image from "next/image"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Save, Share } from "lucide-react"
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

type Prop = {
    selectedTab: any,
    onExport: any,
    onSave: () => void,
    projectName: string
}

const WorkspaceHeader = ({selectedTab, onExport, projectName, onSave}: Prop) => {

  return (
    <div className="p-3 border-b flex justify-between">
        <div className="flex gap-2 items-center">
            <Link href={"/dashboard"}><Image src={"/logo.svg"} alt="logo" width={40} height={40} /></Link>
            <h2 className="font-semibold">{projectName} </h2>
        </div>
        <div className="">
            <Tabs defaultValue="Whiteboard" onValueChange={(value) => selectedTab(value)} >
                <TabsList>
                    <TabsTrigger value="Whiteboard">Whiteboard</TabsTrigger>
                    <TabsTrigger value="Doc">Doc</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button onClick={onSave}><Save /> Save</Button>
            <Button variant={"outline"}><Share /> Share</Button>
            <Button onClick={onExport}><Download /> Export</Button>
        </div>
    </div>
  )
}

export default WorkspaceHeader