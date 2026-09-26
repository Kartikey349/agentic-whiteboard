"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const SharePage = () => {
  const params = useParams();
  const token = params.token as string;

  const [canvas, setCanvas] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Load shared whiteboard data
  useEffect(() => {
    const loadSharedWhiteboard = async () => {
      try {
        console.log("TOKEN:", token);
        console.log("FETCHING SHARED WHITEBOARD...");

        const response = await axios.get(`/api/share/${token}`);

        console.log("SHARED RESPONSE:", response.data);

        setCanvas(response.data.canvas);
      } catch (error: any) {
        console.error("SHARE ERROR:", error);
        console.error("STATUS:", error?.response?.status);
        console.error("DATA:", error?.response?.data);

        setError(
          error?.response?.data?.error ||
            "Failed to load shared whiteboard"
        );
      } finally {
        console.log("FINISHED LOADING");
        setLoading(false);
      }
    };

    if (!token) {
      setError("Share token is missing");
      setLoading(false);
      return;
    }

    loadSharedWhiteboard();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading whiteboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
  <div className="h-screen w-screen">
    <Whiteboard
      readOnly={true}
      initialCanvas={canvas}
      onApiReady={(api) => {
        console.log("EXCALIDRAW API READY");
      }}
      onSaveReady={async () => {}}
    />
  </div>
);
};

export default SharePage;