"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import axios from "axios"
import { Loader, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const CreateNewBoardDialogue = () => {

    const [workspaceName, setWorkspaceName] = useState("")
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState(false)
    const route = useRouter()

    const handleCreateBoard = async() => {
        if(workspaceName.trim() === "" || workspaceName?.length > 30){
            toast.add({
                type: "error",
                title: "Invalid Workspace Name",
                description: "Please enter a valid workspace name (1-30 characters)"
            })
            return;
        }
        setLoading(true)

        const projectId = crypto.randomUUID()
        const res = await axios.post("/api/projects", {
            projectName: workspaceName,
            projectId: projectId
        })
        
        console.log(res.data)
        toast.add({
            type: "Success",
            title: "Workspace created"
        })
        setLoading(false)
        setDialog(false)
        route.push("/workspace/" + projectId)
    }

  return (
    <div>
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger render={<Button className="w-full" />}>
               <Plus /> Create New Board
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Whiteboard Workspace Name</DialogTitle>
                </DialogHeader>
                <div>
                    <label className="text-gray-500">Enter Whiteboard Workspace Name</label>
                    <Input placeholder="Workspace Name" className="mt-1"
                    onChange={(e) => setWorkspaceName(e.target.value)} 
                    />
                </div>

                <DialogFooter>
                    <DialogClose render={<Button variant={"outline"} />}>Cancel
                    </DialogClose>

                    {workspaceName.trim().length > 0 && <Button onClick={handleCreateBoard}
                    >{loading && <Loader className="animate-spin" />}Create</Button>}
                 </DialogFooter>
            </DialogContent>

            </Dialog>
    </div>
  )
}

export default CreateNewBoardDialogue