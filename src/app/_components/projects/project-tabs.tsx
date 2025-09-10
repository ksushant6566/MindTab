"use client";

import React, { useState } from "react";
import { Settings, Archive, FolderPlus, MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { CreateProjectDialog } from "./create-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { z } from "zod";
import { CreateProjectDto, UpdateProjectDto } from "~/server/api/dtos/projects";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

type ProjectTabsProps = {
    activeProjectId: string | null;
    onProjectChange: (projectId: string | null) => void;
    layoutVersion: number;
    activeTab?: "Goals" | "Notes" | "Habits";
};

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
    activeProjectId,
    onProjectChange,
    layoutVersion,
    activeTab = "Goals",
}) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    const apiUtils = api.useUtils();

    const { data: projects, isLoading: isLoadingProjects } =
        api.projects.getWithStats.useQuery();

    const { mutateAsync: createProject, isPending: isCreatingProject } =
        api.projects.create.useMutation({
            onSuccess: () => {
                apiUtils.projects.getWithStats.invalidate();
                setIsCreateDialogOpen(false);
            },
        });

    const { mutateAsync: updateProject, isPending: isUpdatingProject } =
        api.projects.update.useMutation({
            onSuccess: () => {
                apiUtils.projects.getWithStats.invalidate();
                setEditingProject(null);
            },
        });

    const { mutateAsync: deleteProject } = api.projects.delete.useMutation({
        onSuccess: () => {
            apiUtils.projects.getWithStats.invalidate();
            if (activeProjectId) {
                onProjectChange(null); // Switch to "All Goals" when project is deleted
            }
        },
    });

    const { data: goalsCount } = api.goals.getCount.useQuery();
    const { data: journalsCount } = api.journals.getCount.useQuery();

    const handleCreateProject = async (
        project: z.infer<typeof CreateProjectDto>
    ) => {
        await createProject(project);
    };

    const handleUpdateProject = async (
        project: z.infer<typeof UpdateProjectDto>
    ) => {
        await updateProject(project);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (
            confirm(
                "Are you sure you want to delete this project? Goals will be unassigned but not deleted."
            )
        ) {
            await deleteProject({ id: projectId });
        }
    };

    // Handle project selection
    const handleProjectSelect = (projectId: string | null) => {
        onProjectChange(projectId);
    };

    if (isLoadingProjects) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
            </div>
        );
    }

    return (
        <div className="flex items-start gap-2">
            {/* Horizontal scrollable project list */}
            <ScrollArea className="flex-1 group">
                <div className="flex items-center gap-2 min-w-fit pb-3">
                    {/* All Goals Button */}
                    <Button
                        variant={
                            activeProjectId === null ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleProjectSelect(null)}
                        className="whitespace-nowrap flex items-center gap-2"
                    >
                        All {activeTab}
                        {projects && (
                            <span className="text-xs opacity-70">
                                (
                                {activeTab === "Goals"
                                    ? (goalsCount ?? 0)
                                    : activeTab === "Notes"
                                      ? (journalsCount ?? 0)
                                      : (goalsCount ?? 0) +
                                        (journalsCount ?? 0)}
                                )
                            </span>
                        )}
                    </Button>

                    {/* Project Buttons */}
                    {projects?.map((project) => (
                        <div
                            key={project.id}
                            className="relative group flex items-center"
                        >
                            <Button
                                variant={
                                    activeProjectId === project.id
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => handleProjectSelect(project.id)}
                                className="whitespace-nowrap flex items-center gap-1"
                            >
                                <span>{project.name || "Unnamed Project"}</span>
                                <span className="text-xs opacity-70">
                                    (
                                    {activeTab === "Goals"
                                        ? project.goalStats.total
                                        : activeTab === "Notes"
                                          ? project.journalStats?.total || 0
                                          : project.goalStats.total +
                                            (project.journalStats?.total || 0)}
                                    )
                                </span>
                                {/* Project actions dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-6 w-6 p-0 transition-opacity -mr-3 focus-visible:ring-0 focus-visible:ring-offset-0 ${activeProjectId === project.id ? "hover:bg-transparent hover:text-primary-foreground" : ""}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setEditingProject(project)
                                            }
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Edit Project
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleDeleteProject(project.id)
                                            }
                                            className="text-red-600"
                                        >
                                            <Archive className="mr-2 h-4 w-4" />
                                            Archive Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Button>
                        </div>
                    ))}
                </div>
                <ScrollBar
                    orientation="horizontal"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-0"
                />
            </ScrollArea>

            {/* Create Project Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 flex-shrink-0"
                disabled={isCreatingProject}
                title={layoutVersion === 1 ? "New Project" : undefined}
            >
                {layoutVersion === 2 && "New Project"}
                <FolderPlus className="h-4 w-4" />
            </Button>

            {/* Create Project Dialog */}
            <CreateProjectDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSave={handleCreateProject}
                onCancel={() => setIsCreateDialogOpen(false)}
            />

            {/* Edit Project Dialog */}
            {editingProject && (
                <EditProjectDialog
                    open={!!editingProject}
                    onOpenChange={(open) => !open && setEditingProject(null)}
                    project={editingProject}
                    onSave={handleUpdateProject}
                    onCancel={() => setEditingProject(null)}
                />
            )}
        </div>
    );
};
