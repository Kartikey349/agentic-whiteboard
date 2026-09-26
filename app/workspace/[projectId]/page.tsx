"use client";

import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { exportToBlob } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


const sanitizeAppState = (appState: any) => {
  if (!appState) {
    return undefined;
  }

  return {
    ...appState,

    // Excalidraw expects this to be a Map.
    // JSON/database turns it into an object.
    collaborators: new Map(),

    // Runtime-only state
    selectedElementIds: {},
    theme: undefined,
    editingElement: null,
    resizingElement: null,
    draggingElement: null,
    selectionElement: null,
  };
};


const Workspace = () => {
  const [activeTab, setActiveTab] =
    useState("Whiteboard");

  const [api, setApi] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const [saveWhiteboard, setSaveWhiteboard] =
  useState<(() => Promise<void>) | null>(null);

  const [projectName, setProjectName] =
    useState<string | undefined>(undefined);

  const { projectId } = useParams();

 
  const GetWhiteboardData = async () => {
    if (!projectId || !api) return;

    try {

      const result = await axios.get(
        "/api/whiteboard?projectId=" +
          projectId
      );

      const canvas =
        result.data?.canvas;


      setProjectName(
        result.data?.userProject
          ?.projectName ??
          "Untitled board"
      );

      const storedElements =
        canvas?.element ??
        canvas?.elements ??
        [];

      const storedAppState =
        sanitizeAppState(
          canvas?.appState
        );


      if (canvas?.files) {
        const files =
          Object.values(
            canvas.files
          );

        api.addFiles(files as any);
      }

      api.updateScene({
        elements: storedElements
      });


    } catch (error) {
      console.error(
        "FAILED TO LOAD WHITEBOARD:",
        error
      );
    }
  };

  useEffect(() => {
    if (!projectId || !api) return;

    GetWhiteboardData();
  }, [projectId, api]);

  const handleExportImage = async () => {
    if (!api) return;

    const blob = await exportToBlob({
      elements:
        api.getSceneElements(),

      appState: {
        ...api.getAppState(),

        exportBackground: true,
      },

      files:
        api.getFiles(),

      mimeType: "image/png",

      quality: 1,
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "whiteboard.png";

    link.click();

    URL.revokeObjectURL(url);
  };


  return (
    <div>
      <WorkspaceHeader
        selectedTab={(value: string) => setActiveTab(value)}
        onExport={handleExportImage}
        onSave={() => saveWhiteboard?.()}
        projectName={projectName ?? ""}
        
      />

      {activeTab === "Whiteboard" ? (
        <Whiteboard
           onApiReady={(api) => setApi(api)}
          onSaveReady={(save) => setSaveWhiteboard(() => save)}
        />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
};

export default Workspace;