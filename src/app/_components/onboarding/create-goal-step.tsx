"use client";

import React, { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Flag, Zap, FolderOpen } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { goalPriorityEnum, goalImpactEnum } from "~/server/db/schema";
import { motion } from "framer-motion";
import { handleCmdEnterSubmit } from "~/lib/utils";

type Priority = (typeof goalPriorityEnum.enumValues)[number];
type Impact = (typeof goalImpactEnum.enumValues)[number];

const priorityColors: Record<Priority, string> = {
    priority_1: "red",
    priority_2: "yellow",
    priority_3: "green",
    priority_4: "white",
};

const impactNumber: Record<Impact, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

export type CreatedGoalData = {
    title: string;
    priority: Priority;
    impact: Impact;
};

type CreateGoalStepProps = {
    projectId: string | null;
    projectName: string | null;
    onGoalCreated: (data: CreatedGoalData) => void;
    onBack: () => void;
    initialData: CreatedGoalData | null;
};

export function CreateGoalStep({
    projectId,
    projectName,
    onGoalCreated,
    onBack,
    initialData,
}: CreateGoalStepProps) {
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>(initialData?.priority ?? "priority_1");
    const [impact, setImpact] = useState<Impact>(initialData?.impact ?? "medium");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId);
    const alreadyCreated = !!initialData;

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const createGoal = api.goals.create.useMutation({
        onSuccess: () => {
            onGoalCreated({ title: title.trim(), priority, impact });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create goal");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || createGoal.isPending) return;
        if (alreadyCreated) {
            onGoalCreated({ title: title.trim(), priority, impact });
            return;
        }
        createGoal.mutate({
            title,
            description: description || undefined,
            priority,
            impact,
            projectId: selectedProjectId ?? undefined,
        });
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "ArrowUp" && e.target === descriptionRef.current) {
            e.preventDefault();
            titleRef.current?.focus();
        } else if (e.key === "ArrowDown" && e.target === titleRef.current) {
            e.preventDefault();
            descriptionRef.current?.focus();
        }
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
                    Set your first goal
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Goals can be tracked from pending to completed. What do you want to accomplish?
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
                            placeholder="Goal name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            required
                            className="w-full bg-inherit text-xl font-semibold focus:border-none focus:outline-none"
                            ref={titleRef}
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full resize-none overflow-hidden bg-inherit text-base font-normal focus:border-none focus:outline-none"
                            style={{ height: "auto" }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                            ref={descriptionRef}
                        />
                    </div>

                    {/* Selectors row - matching platform create-goal.tsx */}
                    <div className="flex gap-2 pb-2">
                        <Select
                            onValueChange={(value) => setPriority(value as Priority)}
                            value={priority}
                        >
                            <SelectTrigger className="size-8 w-[90px] focus:ring-0">
                                <SelectValue placeholder="Priority">
                                    <span className="flex items-center gap-2 capitalize">
                                        <Flag
                                            className="h-4 w-4"
                                            color={priorityColors[priority]}
                                            fill={priorityColors[priority]}
                                        />
                                        P{priority.split("_")[1]}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="text-sm">
                                <SelectGroup>
                                    {goalPriorityEnum.enumValues.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2 capitalize">
                                                <Flag
                                                    className="h-4 w-4"
                                                    color={priorityColors[value]}
                                                    fill={priorityColors[value]}
                                                />
                                                {value.replace("_", " ")}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(value) => setImpact(value as Impact)}
                            value={impact}
                        >
                            <SelectTrigger className="size-8 w-fit focus:ring-0">
                                <SelectValue placeholder="Impact">
                                    <span className="flex items-center gap-0 capitalize">
                                        {Array.from({ length: impactNumber[impact] }).map((_, i) => (
                                            <Zap
                                                key={i}
                                                className="h-3 w-3"
                                                color="gold"
                                                fill="gold"
                                            />
                                        ))}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="text-sm">
                                <SelectGroup>
                                    <SelectLabel>Impact</SelectLabel>
                                    {goalImpactEnum.enumValues
                                        .map((value) => (
                                            <SelectItem key={value} value={value}>
                                                <span className="flex items-center gap-0 capitalize">
                                                    <span className="mr-1 text-sm">{value}</span>
                                                    {Array.from({ length: impactNumber[value] }).map((_, i) => (
                                                        <Zap
                                                            key={i}
                                                            className="h-3 w-3"
                                                            color="gold"
                                                            fill="gold"
                                                        />
                                                    ))}
                                                </span>
                                            </SelectItem>
                                        ))
                                        .reverse()}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(value) =>
                                setSelectedProjectId(value === "none" ? null : value)
                            }
                            value={selectedProjectId || "none"}
                        >
                            <SelectTrigger className="size-8 w-fit focus:ring-0">
                                <SelectValue placeholder="Project">
                                    <span className="flex items-center gap-1 text-xs">
                                        <FolderOpen className="h-3 w-3" />
                                        {selectedProjectId && projectName
                                            ? projectName.substring(0, 10)
                                            : "No Project"}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="text-sm">
                                <SelectGroup>
                                    <SelectLabel>Project</SelectLabel>
                                    <SelectItem value="none">
                                        <span className="flex items-center gap-2 text-xs">
                                            No Project
                                        </span>
                                    </SelectItem>
                                    {projectId && projectName && (
                                        <SelectItem value={projectId}>
                                            <span className="flex items-center gap-2 text-xs">
                                                <FolderOpen className="h-3 w-3" />
                                                {projectName}
                                            </span>
                                        </SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
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
                            disabled={!title.trim() || createGoal.isPending}
                            loading={createGoal.isPending}
                        >
                            {alreadyCreated ? "Continue" : "Add goal"}
                        </Button>
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
