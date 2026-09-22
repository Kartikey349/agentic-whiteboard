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
import { Plus } from "lucide-react"
import { useState } from "react"

const CreateNewBoardDialogue = () => {

    const [workspaceName, setWorkspaceName] = useState("")

    const handleCreateBoard = () => {
        if(workspaceName.trim() === "" || workspaceName?.length > 30){
            toast.add({
                type: "error",
                title: "Invalid Workspace Name",
                description: "Please enter a valid workspace name (1-30 characters)"
            })
        }
    }

  return (
    <div>
        <Dialog>
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
                    
                    {workspaceName.trim().length > 0 && <Button onClick={handleCreateBoard}>Create</Button>}
                 </DialogFooter>
            </DialogContent>

            </Dialog>
    </div>
  )
}

export default CreateNewBoardDialogue