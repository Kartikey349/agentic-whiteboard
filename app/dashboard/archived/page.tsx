"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Archive,
  RotateCcw,
  Trash2,
  Loader2,
} from "lucide-react";

import { toast } from "@/components/ui/toast";

const Archived = () => {
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [restoringProject, setRestoringProject] = useState<string | null>(
    null
  );

  const [deletingProject, setDeletingProject] = useState<string | null>(
    null
  );

  // Fetch only archived projects
  const handleProjects = async () => {
    try {
      const res = await axios.get("/api/projects/archived");

      setProjectList(res.data);
    } catch (error) {
      console.error("Failed to fetch archived projects:", error);

      toast.add({
        title: "Failed to load archived projects",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProjects();
  }, []);

  // Restore project
  const handleRestore = async (projectId: string) => {
    setRestoringProject(projectId);

    try {
      await axios.patch("/api/projects", {
        projectId,
        isArchived: false,
      });

      // Remove from archived list immediately
      setProjectList((prev) =>
        prev.filter(
          (project) => project.projectId !== projectId
        )
      );

      toast.add({
        title: "Project restored",
        description: "The project has been restored successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to restore project:", error);

      toast.add({
        title: "Failed to restore project",
        description: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setRestoringProject(null);
    }
  };

  // Permanently delete project
  const handleDelete = async (projectId: string) => {
    setDeletingProject(projectId);

    try {
      await axios.delete("/api/projects", {
        data: {
          projectId,
        },
      });

      // Remove from archived list immediately
      setProjectList((prev) =>
        prev.filter(
          (project) => project.projectId !== projectId
        )
      );

      toast.add({
        title: "Project deleted",
        description: "The project was permanently deleted.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);

      toast.add({
        title: "Failed to delete project",
        description: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setDeletingProject(null);
    }
  };

  // Loading shimmer
  if (loading) {
    return (
      <div className="p-6">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="overflow-hidden rounded-xl border"
            >
              {/* Preview shimmer */}
              <div className="h-32 animate-pulse bg-muted" />

              <div className="space-y-3 p-4">
                {/* Project name */}
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />

                {/* Date */}
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />

                {/* Buttons */}
                <div className="mt-4 flex gap-2">
                  <div className="h-9 flex-1 animate-pulse rounded bg-muted" />

                  <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (projectList.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <Archive className="h-12 w-12 text-muted-foreground" />

          <h2 className="text-2xl font-bold">
            No Archived Projects
          </h2>

          <p className="text-muted-foreground">
            Projects that you archive will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projectList.map((project) => {
          const isRestoring =
            restoringProject === project.projectId;

          const isDeleting =
            deletingProject === project.projectId;

          const isProcessing =
            isRestoring || isDeleting;

          return (
            <div
              key={project.projectId}
              className="overflow-hidden rounded-xl border bg-card"
            >
              {/* Project preview */}
              <div className="flex h-32 items-center justify-center bg-muted/40">
                <Archive className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Project information */}
              <div className="p-4">
                <h3 className="truncate font-semibold">
                  {project.projectName}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(
                    project.createdAt
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {/* Restore */}
                  <button
                    disabled={isProcessing}
                    onClick={() =>
                      handleRestore(project.projectId)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}

                    {isRestoring
                      ? "Restoring..."
                      : "Restore"}
                  </button>

                  {/* Delete */}
                  <button
                    disabled={isProcessing}
                    onClick={() =>
                      handleDelete(project.projectId)
                    }
                    className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}

                    {isDeleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Archived;