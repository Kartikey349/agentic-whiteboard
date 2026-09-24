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
import FloatingProperties from "./FloatingProperties";

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
    const {projectId} = useParams()
    const [activeTool, setActiveTool] = useState("selection")
    const [selectedElement, setSelectedElement] = useState<any>(null)
    const [canvasState, setCanvasState] = useState<any>(null)


    const handleCanvasChange = (elements:readonly any[], appState: any, files:any) => {

        setCanvasState(appState)

        const selectedIds = Object.keys(
            appState.selectedElementIds || {}
        )

        if(selectedIds.length === 1){
            const element = elements.find((element) => element.id === selectedIds[0])

            setSelectedElement(element)
        }else{
            setSelectedElement(null)
        }

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

    const getFloatingPosition = () => {
        if(!selectedElement || !canvasState){
            return {left: 0, top: 0}
        }

        const zoom = canvasState.zoom?.value ?? 1;

        const scrollX = canvasState.scrollX ?? 0;

        const scrollY = canvasState.scrollY ?? 0;

        // Center of selected element
        const centerX = selectedElement.x + selectedElement.width / 2;

        // Convert Excalidraw coordinates
        // into browser coordinates
        const screenX = (centerX + scrollX) * zoom;

        const screenY = (selectedElement.y + scrollY) * zoom;

        return {
        left: screenX,
        top: screenY - 60,
        };
    }

    const handlePropertyChange = (property: string, value: any) => {
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if(element.id != selectedElement.id){
                return element;
            }

            return {
                ...element,
                [property]: value,
                version: element.version + 1,
                updated: Date.now()
            }
        })

        excalidrawAPI.updateScene({
           elements: updatedElements
        })
    }

    const handleDeleteElement = () => {
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if(element.id === selectedElement.id){
                return {
                    ...element,
                    isDeleted: true,
                    version: element.version + 1,
                    updated: Date.now()
                }
            }
            return element
        })
        excalidrawAPI.updateScene({
            elements: updatedElements
        })

        setSelectedElement(null)
    }

    const handleDuplicateElement = () => {
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements()
        const duplicateElement = {
            ...selectedElement,
            id: crypto.randomUUID(),
            x:selectedElement.x + 20,
            y: selectedElement.y + 20,
            seed: Math.floor(Math.random() * 1000000),
            version: 1,
            updated: Date.now(),
            isDeleted: false
        }

        excalidrawAPI.updateScene({
            elements: [
                ...elements,
                duplicateElement
            ]
        })
    }
    
    const handleBringFrontBack = (type: string) => {
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements()

        const selected = elements.find((element) => element.id === selectedElement.id)

        if(!selected) return;

        const remainingElements = elements.filter((elements) => elements.id !== selectedElement.id)


        if(type === "front"){
            excalidrawAPI.updateScene({
                elements: [
                    // @ts-ignore
                    ...remainingElements,
                    selected
                ]
            })
        }else{
            excalidrawAPI.updateScene({
                elements: [
                    selected,
                    // @ts-ignore
                    ...remainingElements
                ]
            })
        }
    }

    const floatingPosition = getFloatingPosition()

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
            <FloatingProperties selectedElement={selectedElement} position={floatingPosition}
            onPropertyChange={(property, value) => handlePropertyChange(property, value)}
            onDelete={() => handleDeleteElement()}
            onDuplicate={() => handleDuplicateElement()}
            onBringToFront={() => handleBringFrontBack('front')}
            onSendToBack={() => handleBringFrontBack('back')}
            />

      </div>
  )
}

export default Whiteboard