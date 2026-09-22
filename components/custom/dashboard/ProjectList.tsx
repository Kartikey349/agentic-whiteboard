"use client"
import { Button } from "@/components/ui/button"
import { Folder } from "lucide-react"
import { useState } from "react"
import CreateNewBoardDialogue from "./CreateNewBoardDialogue"

const ProjectList = () => {
    const [projectList, setProjectList] = useState([])
  return (
    <div className="p-6">
        {
            projectList.length === 0 ? (
                <div className="flex flex-col items-center p-10 border rounded-xl gap-2">
                    <Folder className="h-15 w-15 text-blue-600" />
                    <h2 className="text-2xl font-bold">No Boards found</h2>
                    <p className="text-gray-600 font-semibold">Create Your first Board to start brainstorming and Planning!!</p>
                    <CreateNewBoardDialogue />
                </div>
            ): 
            (
                <div>

                </div>
            )
        }
    </div>
  )
}

export default ProjectList