"use client"
import { toast } from "@/components/ui/toast";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import "./whiteboard.css"
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Image,
  Minus,
  MousePointer2,
  Pencil,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const tools = [
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-600",
  },
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-600",
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-600",
  },
  {
    name: "diamond",
    icon: Diamond,
    color: "text-emerald-500",
  },
  {
    name: "ellipse",
    icon: Circle,
    color: "text-amber-500",
  },{
    name: "arrow",
    icon: ArrowRight,
    color: "text-violet-500",
  },
  {
    name: "line",
    icon: Minus,
    color: "text-pink-500",
  },
  {
    name: "freedraw",
    icon: Pencil,
    color: "text-orange-500",
  },
  {
    name: "text",
    icon: Type,
    color: "text-indigo-500",
  },
  {
    name: "image",
    icon: Image,
    color: "text-green-500",
  },
  {
    name: "eraser",
    icon: Eraser,
    color: "text-rose-500",
  },
];

const Whiteboard = () => {

    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null >(null);

    const saveTimeRef = useRef<any>(null)
    const lockRef = useRef(null)
    const {projectId} = useParams()
    const [activeTool, setActiveTool] = useState("selection")

    const handleCanvasChange = (elements:readonly any[], appState: any, files:any) => {
        if(saveTimeRef?.current){
            clearTimeout(saveTimeRef.current)
        }
        
        saveTimeRef.current = setTimeout(() => {
            // SaveCanvasChanges(elements, appState, files)
            // toast.add({title: "Changes saved", type: "success"})
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

    const changeTool = (tool: any) => {
        if(!excalidrawAPI) return;

        setActiveTool(tool)
        excalidrawAPI.setActiveTool({
            type: tool
        })
    }

  return (
   <div style={{ height: "90vh" }}>
        <Excalidraw
        onChange={handleCanvasChange}
        //@ts-ignore
        excalidrawAPI={(api)=> setExcalidrawAPI(api)}
        />

        <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
            {
                tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                        <button key={tool.name} className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/20 hover:cursor-pointer ${activeTool === tool.name ? "bg-primary/10" : null}`}
                        onClick={() => changeTool(tool.name)}
                        >
                            <Icon size={"19"} className={tool.color} />
                        </button>
                    )
                })
            }
        </div>
      </div>
  )
}

export default Whiteboard