"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Folder,
  Link2,
  Link2Off,
  Loader2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type SharedProject = {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  isArchived: boolean;
  createdAt: string;
  shareToken: string;
  permission: string;
  sharedAt: string;
};

const SharedProjectList = () => {
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const [stoppingProject, setStoppingProject] =
    useState<string | null>(null);

  // -----------------------------------
  // Fetch shared projects
  // -----------------------------------

  const handleProjects = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/share");

      setProjects(res.data.projects);
    } catch (error) {
      console.error(
        "Failed to fetch shared projects:",
        error
      );

      toast.add({
        type: "error",
        title: "Something went wrong",
        description: "Unable to load shared projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProjects();
  }, []);

  // -----------------------------------
  // Stop sharing
  // -----------------------------------

  const handleStopSharing = async (
    projectId: string
  ) => {
    setStoppingProject(projectId);

    try {
      await axios.patch("/api/share", {
        projectId,
        isActive: false,
      });

      // Remove from UI immediately
      setProjects((prev) =>
        prev.filter(
          (project) =>
            project.projectId !== projectId
        )
      );

      toast.add({
        type: "success",
        title: "Sharing disabled",
        description:
          "The project is no longer publicly accessible.",
      });
    } catch (error) {
      console.error(
        "Failed to stop sharing:",
        error
      );

      toast.add({
        type: "error",
        title: "Failed to stop sharing",
        description: "Please try again.",
      });
    } finally {
      setStoppingProject(null);
    }
  };

  // -----------------------------------
  // Loading
  // -----------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // -----------------------------------
  // Empty state
  // -----------------------------------

  if (projects.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <Link2Off className="mb-3 h-10 w-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">
          No shared projects
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Projects you share will appear here.
        </p>
      </div>
    );
  }

  // -----------------------------------
  // Projects
  // -----------------------------------

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-10">
      {projects.map((project) => (
        <div
          key={project.projectId}
          className="group rounded-xl border bg-card p-4 transition hover:shadow-sm"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/workspace/${project.projectId}`}
              className="min-w-0 flex-1"
            >
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 shrink-0" />

                <h3 className="truncate font-medium">
                  {project.projectName}
                </h3>
              </div>
            </Link>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link
                    href={`/workspace/${project.projectId}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={
                    stoppingProject ===
                    project.projectId
                  }
                  onClick={() =>
                    handleStopSharing(
                      project.projectId
                    )
                  }
                >
                  {stoppingProject ===
                  project.projectId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Off className="mr-2 h-4 w-4" />
                  )}

                  Stop sharing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Share status */}
          <div className="mt-4 flex items-center gap-1.5 text-sm text-green-600">
            <Link2 className="h-4 w-4" />
            Currently shared
          </div>

          {/* Date */}
          <p className="mt-2 text-xs text-muted-foreground">
            Shared{" "}
            {new Date(
              project.sharedAt
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SharedProjectList;