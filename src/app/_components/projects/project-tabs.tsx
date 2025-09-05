"use client";

import React, { useState } from "react";
import {
    Plus,
    Settings,
    Archive,
    FolderPlus,
    MoreVertical,
} from "lucide-react";
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
};

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
    activeProjectId,
    onProjectChange,
}) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    const apiUtils = api.useUtils();

    const { data: projects, isLoading: isLoadingProjects } =
        api.projects.getWithStats.useQuery();

    const { mutate: createProject, isPending: isCreatingProject } =
        api.projects.create.useMutation({
            onSuccess: () => {
                apiUtils.projects.getWithStats.invalidate();
                setIsCreateDialogOpen(false);
            },
        });

    const { mutate: updateProject, isPending: isUpdatingProject } =
        api.projects.update.useMutation({
            onSuccess: () => {
                apiUtils.projects.getWithStats.invalidate();
                setEditingProject(null);
            },
        });

    const { mutate: deleteProject } = api.projects.delete.useMutation({
        onSuccess: () => {
            apiUtils.projects.getWithStats.invalidate();
            if (activeProjectId) {
                onProjectChange(null); // Switch to "All Goals" when project is deleted
            }
        },
    });

    const handleCreateProject = (project: z.infer<typeof CreateProjectDto>) => {
        createProject(project);
    };

    const handleUpdateProject = (project: z.infer<typeof UpdateProjectDto>) => {
        updateProject(project);
    };

    const handleDeleteProject = (projectId: string) => {
        if (
            confirm(
                "Are you sure you want to delete this project? Goals will be unassigned but not deleted."
            )
        ) {
            deleteProject({ id: projectId });
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
                        All Goals
                        {projects && (
                            <span className="text-xs opacity-70">
                                (
                                {projects.reduce(
                                    (sum, p) => sum + p.goalStats.total,
                                    0
                                )}
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
                                    ({project.goalStats.total})
                                </span>
                                {/* Project actions dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 transition-opacity -mr-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
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
                                            Delete Project
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
            >
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
