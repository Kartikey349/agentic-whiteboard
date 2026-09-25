"use client"

import { toast } from "@/components/ui/toast";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./whiteboard.css"
import { useTheme } from "next-themes";

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
import { Button } from "@/components/ui/button";
import { AIFloatingSidebar } from "./AIFloatingSidebar";
import CanvasDock from "./CanvasDock";
import { updateBoundText } from "@/lib/canvas";


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
  },
  {
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


type Props = {
  onApiReady: (api: ExcalidrawImperativeAPI) => void
  onSaveReady: (save: () => Promise<void>) => void
}


const Whiteboard = ({
  onApiReady,
  onSaveReady
}: Props) => {

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const saveTimeRef = useRef<any>(null)

  const { projectId } = useParams()

  const [activeTool, setActiveTool] = useState("selection")

  const [selectedElement, setSelectedElement] = useState<any>(null)

  const [canvasState, setCanvasState] = useState<any>(null)

  const [showAiSidebar, setShowAiSidebar] = useState(false)

  const { resolvedTheme } = useTheme();

  const SaveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {

    await axios.post("/api/whiteboard", {
      elements: elements,
      appState: appState,
      files: files,
      projectId: projectId
    })
  }

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {

    setCanvasState(appState)


    const selectedIds = Object.keys(
      appState.selectedElementIds || {}
    )

    if (selectedIds.length === 1) {

      const element = elements.find(
        (element) => element.id === selectedIds[0]
      )

      setSelectedElement(element)

    } else {

      setSelectedElement(null)

    }

    if (saveTimeRef.current) {
      clearTimeout(saveTimeRef.current)
    }

    saveTimeRef.current = setTimeout(async () => {

      try {

        await SaveCanvasChanges(
          elements,
          appState,
          files
        )

        toast.add({
          title: "Changes saved",
          type: "success"
        })

      } catch (error) {

        console.error("AUTO SAVE ERROR:", error)

        toast.add({
          title: "Failed to save changes",
          type: "error"
        })

      }

    }, 10000)

  }


  const handleSave = async () => {

    if (!excalidrawAPI) {
      return
    }


    const elements = excalidrawAPI.getSceneElements()

    const appState = excalidrawAPI.getAppState()

    const files = excalidrawAPI.getFiles()


    try {

      await SaveCanvasChanges(
        elements,
        appState,
        files
      )


      // Since user manually saved,
      // cancel pending autosave timer

      if (saveTimeRef.current) {
        clearTimeout(saveTimeRef.current)
        saveTimeRef.current = null
      }


      toast.add({
        title: "Changes saved",
        type: "success"
      })

    } catch (error) {

      console.error("MANUAL SAVE ERROR:", error)

      toast.add({
        title: "Failed to save changes",
        type: "error"
      })

    }

  }



  useEffect(() => {

    if (excalidrawAPI) {
      onSaveReady(handleSave)
    }

  }, [excalidrawAPI])


  const changeTool = (tool: any) => {

    if (!excalidrawAPI) return;

    setActiveTool(tool)

    excalidrawAPI.setActiveTool({
      type: tool
    })

  }


  const getFloatingPosition = () => {

    if (!selectedElement || !canvasState) {
      return {
        left: 0,
        top: 0
      }
    }


    const zoom = canvasState.zoom?.value ?? 1

    const scrollX = canvasState.scrollX ?? 0

    const scrollY = canvasState.scrollY ?? 0


    // Center of selected element

    const centerX =
      selectedElement.x +
      selectedElement.width / 2


    // Convert Excalidraw coordinates
    // into browser coordinates

    const screenX =
      (centerX + scrollX) * zoom

    const screenY =
      (selectedElement.y + scrollY) * zoom


    return {
      left: screenX,
      top: screenY - 60,
    }

  }


  const handlePropertyChange = (
    property: string,
    value: any
  ) => {

    if (!excalidrawAPI || !selectedElement) {
      return
    }


    const elements =
      excalidrawAPI.getSceneElements()


    const updatedElements =
      elements.map((element) => {

        if (element.id !== selectedElement.id) {
          return element
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

    if (!excalidrawAPI || !selectedElement) {
      return
    }


    const elements =
      excalidrawAPI.getSceneElements()


    const updatedElements =
      elements.map((element) => {

        if (element.id === selectedElement.id) {

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

    if (!excalidrawAPI || !selectedElement) {
      return
    }


    const elements =
      excalidrawAPI.getSceneElements()


    const duplicateElement = {

      ...selectedElement,

      id: crypto.randomUUID(),

      x: selectedElement.x + 20,

      y: selectedElement.y + 20,

      seed: Math.floor(
        Math.random() * 1000000
      ),

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

  const handleBringFrontBack = (
    type: string
  ) => {

    if (!excalidrawAPI || !selectedElement) {
      return
    }


    const elements =
      excalidrawAPI.getSceneElements()


    const selected =
      elements.find(
        (element) =>
          element.id === selectedElement.id
      )


    if (!selected) {
      return
    }


    const remainingElements =
      elements.filter(
        (element) =>
          element.id !== selectedElement.id
      )


    if (type === "front") {

      excalidrawAPI.updateScene({

        elements: [
          // @ts-ignore
          ...remainingElements,
          selected
        ]

      })

    } else {

      excalidrawAPI.updateScene({

        elements: [
          selected,
          // @ts-ignore
          ...remainingElements
        ]

      })

    }

  }


  const boundTextElement = (() => {

    if (!excalidrawAPI || !selectedElement) {
      return null
    }


    const textId =
      selectedElement.boundElements?.find(
        (bound: any) =>
          bound.type === "text"
      )?.id


    if (!textId) {
      return null
    }


    return (
      excalidrawAPI
        .getSceneElements()
        .find(
          (element: any) =>
            element.id === textId
        ) ?? null
    )

  })()

  const handleTextPropertyChange = async (
    property: string,
    value: any
  ) => {

    if (!excalidrawAPI || !boundTextElement) {
      return
    }


    await updateBoundText(
      excalidrawAPI,
      selectedElement,
      boundTextElement,
      {
        [property]: value,
      }
    )


    // Nudge selection so toolbar
    // re-reads the new value

    setSelectedElement({
      ...selectedElement
    })

  }


  const floatingPosition =
    getFloatingPosition()


  return (

    <div className="h-[92vh]">

      <Excalidraw
        onChange={handleCanvasChange}
        //@ts-ignore
        excalidrawAPI={(api) => {

          setExcalidrawAPI(api)

          onApiReady(api)

        }}
         theme={resolvedTheme === "dark" ? "dark" : "light"}
      />


      {/* LEFT TOOLBAR */}

      <div className="
        absolute
        left-4
        top-1/2
        z-50
        -translate-y-1/2
        flex
        flex-col
        gap-1
        rounded-2xl
        bg-white
        border
        p-1.5
        shadow-xl
      ">

        {
          tools.map((tool) => {

            const Icon = tool.icon

            return (

              <button
                key={tool.name}
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  transition
                  hover:bg-primary/20
                  hover:cursor-pointer
                  ${
                    activeTool === tool.name
                      ? "bg-primary/10"
                      : ""
                  }
                `}
                onClick={() =>
                  changeTool(tool.name)
                }
              >

                <Icon
                  size={"19"}
                  className={tool.color}
                />

              </button>

            )

          })
        }

      </div>


      {/* FLOATING PROPERTIES */}

      <FloatingProperties
        selectedElement={selectedElement}
        position={floatingPosition}

        onPropertyChange={(
          property,
          value
        ) =>
          handlePropertyChange(
            property,
            value
          )
        }

        onDelete={() =>
          handleDeleteElement()
        }

        onDuplicate={() =>
          handleDuplicateElement()
        }

        onBringToFront={() =>
          handleBringFrontBack("front")
        }

        onSendToBack={() =>
          handleBringFrontBack("back")
        }

        onTextPropertyChange={
          handleTextPropertyChange
        }

        boundText={boundTextElement}
      />


      {/* CANVAS DOCK */}

      <CanvasDock
        excalidrawApi={excalidrawAPI}
        aiOpen={showAiSidebar}
        onToggleAi={() =>
          setShowAiSidebar(
            (open) => !open
          )
        }
      />


      {/* AI BUTTON */}

      <div className="
        absolute
        right-15
        bottom-3.5
        z-50
      ">

        <Button
          size={"lg"}
          onClick={() =>
            setShowAiSidebar(
              !showAiSidebar
            )
          }
        >

          <Sparkles />

          AI

        </Button>

      </div>


      {/* AI SIDEBAR */}

      {showAiSidebar && (

        <AIFloatingSidebar
          excalidrawAPI={excalidrawAPI}

          onClose={() =>
            setShowAiSidebar(false)
          }
        />

      )}

    </div>

  )

}


export default Whiteboard