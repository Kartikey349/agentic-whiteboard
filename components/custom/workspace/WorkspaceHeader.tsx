import Image from "next/image"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save, Share } from "lucide-react"

type Prop = {
    selectedTab: any
}

const WorkspaceHeader = ({selectedTab}: Prop) => {
  return (
    <div className="p-3 border-b flex justify-between">
        <div className="flex gap-2 items-center">
            <Image src={"/logo.svg"} alt="logo" width={40} height={40} />
            <h2 className="font-semibold">Workspace Name </h2>
        </div>
        <div className="">
            <Tabs defaultValue="Whiteboard" onValueChange={(value) => selectedTab(value)} >
                <TabsList>
                    <TabsTrigger value="Whiteboard">Whiteboard</TabsTrigger>
                    <TabsTrigger value="Doc">Doc</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div className="flex gap-2">
            <Button><Save /> Save</Button>
            <Button variant={"outline"}><Share /> Share</Button>
        </div>
    </div>
  )
}

export default WorkspaceHeader