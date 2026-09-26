"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  Folder,
  MoreVertical,
  Pencil,
  Loader2,
} from "lucide-react";

import CreateNewBoardDialogue from "./CreateNewBoardDialogue";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type Project = {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  isArchived: boolean;
  createdAt: string;
};

const ProjectList = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");

  const [savingEdit, setSavingEdit] = useState(false);

  // Project currently being archived
  const [archivingProject, setArchivingProject] = useState<string | null>(
    null
  );

  // -----------------------------------
  // Fetch projects
  // -----------------------------------

  const handleProjects = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/projects");

      setProjectList(res.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      toast.add({
        title: "Something went wrong",
        description: "Unable to load your projects.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProjects();
  }, []);

  // -----------------------------------
  // Active projects
  // -----------------------------------

  const activeProjects = projectList.filter(
    (project) => !project.isArchived
  );

  // -----------------------------------
  // Archive project
  // -----------------------------------

  const handleArchive = async (projectId: string) => {
    // Start loading state
    setArchivingProject(projectId);

    try {
      // Wait for backend to actually archive the project
      await axios.patch("/api/projects", {
        projectId,
        isArchived: true,
      });

      // Only remove the card after API succeeds
      setProjectList((prev) =>
        prev.filter(
          (project) => project.projectId !== projectId
        )
      );

      toast.add({
        title: "Project archived",
        description: "The project has been moved to Archived.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to archive project:", error);

      // Keep the card visible because archive failed
      toast.add({
        title: "Failed to archive",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setArchivingProject(null);
    }
  };

  // -----------------------------------
  // Open edit dialog
  // -----------------------------------

  const openEditDialog = (project: Project) => {
    setEditProject(project);
    setEditName(project.projectName);
  };

  // -----------------------------------
  // Rename project
  // -----------------------------------

  const handleEditProject = async () => {
    if (!editProject) return;

    const trimmedName = editName.trim();

    if (!trimmedName) {
      toast.add({
        type: "error",
        title: "Project name required",
        description: "Please enter a project name.",
      });

      return;
    }

    if (trimmedName === editProject.projectName) {
      setEditProject(null);
      return;
    }

    const previousProjects = projectList;

    // Optimistic UI for rename
    setProjectList((prev) =>
      prev.map((project) =>
        project.projectId === editProject.projectId
          ? {
              ...project,
              projectName: trimmedName,
            }
          : project
      )
    );

    setEditProject(null);
    setSavingEdit(true);

    try {
      await axios.patch("/api/projects", {
        projectId: editProject.projectId,
        projectName: trimmedName,
      });

      toast.add({
        title: "Project renamed",
        description: "Your project name has been updated.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to rename project:", error);

      // Rollback if rename fails
      setProjectList(previousProjects);

      toast.add({
        type: "error",
        title: "Failed to rename",
        description: "Please try again.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // -----------------------------------
  // Loading
  // -----------------------------------

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-xl border"
            >
              <div className="h-32 animate-pulse bg-muted" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />

                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------
  // Empty state
  // -----------------------------------

  if (activeProjects.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-500/10 p-4">
            <Folder className="h-10 w-10 text-blue-500" />
          </div>

          <h2 className="text-2xl font-bold">
            No boards yet
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Create your first board and start turning your ideas
            into something amazing.
          </p>

          <div className="mt-6">
            <CreateNewBoardDialogue />
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // Render
  // -----------------------------------

  return (
    <>
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            Your Projects
          </h2>

          <p className="text-sm text-muted-foreground">
            {activeProjects.length}{" "}
            {activeProjects.length === 1
              ? "project"
              : "projects"}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeProjects.map((project) => {
            const isArchiving =
              archivingProject === project.projectId;

            return (
              <div
                key={project.projectId}
                className="
                  group relative overflow-hidden rounded-xl
                  border bg-card
                  transition-all duration-200
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                {/* Preview */}
                <Link href={`/workspace/${project.projectId}`}>
                  <div
                    className="
                      relative flex h-32 items-center justify-center
                      bg-muted/40
                      transition-colors
                      group-hover:bg-muted/70
                    "
                  >
                    <div className="rounded-xl bg-background p-3 shadow-sm">
                      <Folder className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="flex items-start gap-3 p-4">
                  <Link
                    href={`/workspace/${project.projectId}`}
                    className="min-w-0 flex-1"
                  >
                    <h3 className="truncate font-semibold">
                      {project.projectName}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </Link>

                  {/* Menu */}
                  <DropdownMenu>
                <DropdownMenuTrigger
                    disabled={isArchiving}
                    className="h-8 w-8 shrink-0 rounded-md p-0 hover:bg-muted"
                >
                    {isArchiving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <MoreVertical className="h-4 w-4" />
                    )}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                    disabled={isArchiving}
                    onClick={() => openEditDialog(project)}
                    >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                    disabled={isArchiving}
                    onClick={() => handleArchive(project.projectId)}
                    >
                    {isArchiving ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Archiving...
                        </>
                    ) : (
                        <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                        </>
                    )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                </div>

                {/* Archiving overlay */}
                {isArchiving && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Archiving...
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editProject}
        onOpenChange={(open) => {
          if (!open) {
            setEditProject(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit project
            </DialogTitle>

            <DialogDescription>
              Update your project name.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              placeholder="Project name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditProject();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProject(null)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleEditProject}
              disabled={
                savingEdit ||
                !editName.trim() ||
                editName.trim() ===
                  editProject?.projectName
              }
            >
              {savingEdit && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectList;