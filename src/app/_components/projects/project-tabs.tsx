"use client";

import React, { useState } from "react";
import { Plus, Settings, Archive, FolderPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
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

    // Get the tab value for the active project
    const getActiveTabValue = () => {
        return activeProjectId || "all";
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        if (value === "all") {
            onProjectChange(null);
        } else {
            onProjectChange(value);
        }
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
        <div className="flex items-center gap-2 mb-4">
            <Tabs value={getActiveTabValue()} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="all" className="relative">
                        All Goals
                        {projects && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                (
                                {projects.reduce(
                                    (sum, p) => sum + p.goalStats.total,
                                    0
                                )}
                                )
                            </span>
                        )}
                    </TabsTrigger>

                    {projects?.map((project) => (
                        <TabsTrigger
                            key={project.id}
                            value={project.id}
                            className="relative group"
                        >
                            <div className="flex items-center gap-2">
                                <span>{project.name || "Unnamed Project"}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({project.goalStats.total})
                                </span>
                            </div>

                            {/* Project actions dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Settings className="h-3 w-3" />
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
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Create Project Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
                disabled={isCreatingProject}
            >
                <FolderPlus className="h-4 w-4" />
                New Project
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
