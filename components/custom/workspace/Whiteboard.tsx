"use client"
import { toast } from "@/components/ui/toast";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
const Whiteboard = () => {

    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    const saveTimeRef = useRef<any>(null)
    const {projectId} = useParams()

    const handleCanvasChange = (elements:readonly any[], appState: any, files:any) => {
        if(saveTimeRef?.current){
            clearTimeout(saveTimeRef.current)
        }
        
        saveTimeRef.current = setTimeout(() => {
            SaveCanvasChanges(elements, appState, files)
            toast.add({title: "Changes saved", type: "success"})
        }, 10000);
    }

    const SaveCanvasChanges = async(elements:readonly any[], appState: any, files:any) => {
        const result = await axios.post("/api/whiteboard", {
            elements: elements,
            appState: appState,
            files: files,
            projectId: projectId
        })
    }

  return (
   <div style={{ height: "90vh" }}>
        <Excalidraw
        onChange={handleCanvasChange}
        //@ts-ignore
        excalidrawAPI={(api)=> setExcalidrawAPI(api)}
        />
      </div>
  )
}

export default Whiteboard