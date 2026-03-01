"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type CreateProjectStepProps = {
    onProjectCreated: (projectId: string) => void;
    onBack: () => void;
};

export function CreateProjectStep({
    onProjectCreated,
    onBack,
}: CreateProjectStepProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const createProject = api.projects.create.useMutation({
        onSuccess: (project) => {
            if (project) {
                onProjectCreated(project.id);
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create project");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProject.mutate({
            name,
            description,
            status: "active",
            startDate: new Date().toISOString(),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Create your first project</h2>
                <p className="text-muted-foreground">
                    Projects help you organize goals and notes. Think of them like
                    folders.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        placeholder='e.g. "Personal Growth", "Work Q1", "Fitness"'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="project-description">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="project-description"
                        placeholder="What is this project about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!name.trim() || createProject.isPending}
                        loading={createProject.isPending}
                    >
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
}
