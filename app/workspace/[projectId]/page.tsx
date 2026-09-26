"use client";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";

import { exportToBlob } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Check,
  Copy,
  MessageCircle,
} from "lucide-react";

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

  const [api, setApi] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const [saveWhiteboard, setSaveWhiteboard] =
    useState<(() => Promise<void>) | null>(null);

  const [projectName, setProjectName] =
    useState<string | undefined>(undefined);

  const [sharing, setSharing] =
    useState(false);

  // Share dialog
  const [shareUrl, setShareUrl] =
    useState<string | null>(null);

  const [shareDialogOpen, setShareDialogOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const { projectId } = useParams();

const GetWhiteboardData = async () => {
  if (!projectId || !api) return;

  try {
    const result = await axios.get(
      "/api/whiteboard?projectId=" + projectId
    );

    const canvas = result.data?.canvas;

    setProjectName(
      result.data?.userProject?.projectName ?? "Untitled board"
    );

    const storedElements =
      canvas?.element ??
      canvas?.elements ??
      [];

    // Load files first
    if (canvas?.files) {
      const files = Object.values(canvas.files);

      await api.addFiles(files as any);
    }

    // Load elements
    api.updateScene({
      elements: storedElements,
    });

    // Wait for Excalidraw to render the loaded elements
    if (storedElements.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          api.scrollToContent(undefined, {
            fitToViewport: true,
            viewportZoomFactor: 0.8,
          });
        });
      });
    }
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
      elements: api.getSceneElements(),

      appState: {
        ...api.getAppState(),
        exportBackground: true,
      },

      files: api.getFiles(),

      mimeType: "image/png",
      quality: 1,
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "whiteboard.png";

    link.click();

    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!projectId || sharing) return;

    try {
      setSharing(true);

      const result = await axios.post(
        "/api/share",
        {
          projectId,
        }
      );

      const url = result.data?.shareUrl;

      if (!url) {
        throw new Error(
          "Share URL was not returned"
        );
      }

      setShareUrl(url);
      setShareDialogOpen(true);

      // Automatically copy the share link
      try {
        await navigator.clipboard.writeText(url);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (clipboardError) {
        console.error(
          "FAILED TO COPY SHARE LINK:",
          clipboardError
        );
      }
    } catch (error: any) {
      console.error(
        "FAILED TO CREATE SHARE LINK:",
        error
      );

      console.log(
        "SERVER ERROR:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.error ??
          "Failed to create share link"
      );
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "FAILED TO COPY SHARE LINK:",
        error
      );
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;

    const message =
      `Check out my whiteboard:\n${shareUrl}`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div>
      <WorkspaceHeader
        selectedTab={"Whiteboard"}
        onExport={handleExportImage}
        onSave={() =>
          saveWhiteboard?.()
        }
        onShare={handleShare}
        isSharing={sharing}
        projectName={projectName ?? ""}
      />

        <Whiteboard
          onApiReady={(api) =>
            setApi(api)
          }
          onSaveReady={(save) =>
            setSaveWhiteboard(
              () => save
            )
          }
          readOnly= {false}
        />
      

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Share project
            </DialogTitle>

            <DialogDescription>
              Anyone with this link can view
              this whiteboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Link */}
            <div className="flex items-center gap-2 rounded-md border p-2">
              <input
                value={shareUrl ?? ""}
                readOnly
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyShareLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* WhatsApp */}
            <Button
              className="w-full"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Share on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workspace;