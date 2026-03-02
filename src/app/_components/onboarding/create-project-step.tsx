"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { handleCmdEnterSubmit } from "~/lib/utils";

type CreateProjectStepProps = {
    onProjectCreated: (projectId: string, projectName: string) => void;
    onBack: () => void;
    initialName: string;
    initialDescription: string;
    alreadyCreated: boolean;
};

export function CreateProjectStep({
    onProjectCreated,
    onBack,
    initialName,
    initialDescription,
    alreadyCreated,
}: CreateProjectStepProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);

    const createProject = api.projects.create.useMutation({
        onSuccess: (project) => {
            if (project) {
                onProjectCreated(project.id, name.trim());
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create project");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || createProject.isPending) return;
        // If already created, just advance without re-creating
        if (alreadyCreated) {
            onProjectCreated("", name.trim());
            return;
        }
        createProject.mutate({
            name,
            description,
            status: "active",
            startDate: new Date().toISOString(),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-3">
                <motion.h2
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    Create your first project
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Projects group your goals and notes into focused spaces.
                </motion.p>
            </div>

            <motion.div
                className="rounded-xl border-2 border-border bg-card overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
            >
                <form
                    onSubmit={handleSubmit}
                    onKeyDown={handleCmdEnterSubmit}
                    className="flex flex-col gap-2 p-6"
                >
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                            className="w-full bg-inherit text-xl font-semibold focus:border-none focus:outline-none"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full resize-none overflow-hidden bg-inherit text-base font-normal text-muted-foreground focus:border-none focus:outline-none"
                            style={{ height: "auto" }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                            <FolderPlus className="h-3.5 w-3.5" />
                            <span>New project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={onBack}
                                variant="secondary"
                                size="sm"
                                className="h-8 text-xs"
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={!name.trim() || createProject.isPending}
                                loading={createProject.isPending}
                            >
                                {alreadyCreated ? "Continue" : "Create project"}
                            </Button>
                        </div>
                    </div>
                </form>
            </motion.div>

            <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </motion.div>
        </div>
    );
}
