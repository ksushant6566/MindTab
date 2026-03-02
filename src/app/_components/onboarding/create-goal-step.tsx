"use client";

import React, { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Flag, Zap, Target } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { goalPriorityEnum, goalImpactEnum } from "~/server/db/schema";
import { motion } from "framer-motion";

type Priority = (typeof goalPriorityEnum.enumValues)[number];
type Impact = (typeof goalImpactEnum.enumValues)[number];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    priority_1: { label: "Urgent", color: "text-red-500" },
    priority_2: { label: "High", color: "text-yellow-500" },
    priority_3: { label: "Medium", color: "text-green-500" },
    priority_4: { label: "Low", color: "text-white" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; count: number }> = {
    low: { label: "Low", count: 1 },
    medium: { label: "Medium", count: 2 },
    high: { label: "High", count: 3 },
};

type CreateGoalStepProps = {
    projectId: string | null;
    onNext: () => void;
    onBack: () => void;
};

export function CreateGoalStep({
    projectId,
    onNext,
    onBack,
}: CreateGoalStepProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("priority_1");
    const [impact, setImpact] = useState<Impact>("medium");

    const createGoal = api.goals.create.useMutation({
        onSuccess: () => {
            onNext();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create goal");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || createGoal.isPending) return;
        createGoal.mutate({
            title,
            priority,
            impact,
            projectId: projectId ?? undefined,
        });
    };

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                if (!title.trim() || createGoal.isPending) return;
                createGoal.mutate({
                    title,
                    priority,
                    impact,
                    projectId: projectId ?? undefined,
                });
            }
        },
        [title, priority, impact, projectId, createGoal],
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-3">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <Target className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Set your first goal</h2>
                </motion.div>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed pl-[52px]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Goals can be tracked from pending to completed. What do you want to accomplish?
                </motion.p>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
            >
                <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                        id="goal-title"
                        placeholder='e.g. "Learn TypeScript", "Run a marathon"'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={(val) => setPriority(val as Priority)}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        <Flag
                                            className={`h-3.5 w-3.5 ${PRIORITY_CONFIG[priority].color}`}
                                        />
                                        {PRIORITY_CONFIG[priority].label}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PRIORITY_CONFIG).map(
                                    ([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                <Flag
                                                    className={`h-3.5 w-3.5 ${config.color}`}
                                                />
                                                {config.label}
                                            </span>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Impact</Label>
                        <Select
                            value={impact}
                            onValueChange={(val) => setImpact(val as Impact)}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        {Array.from({
                                            length: IMPACT_CONFIG[impact].count,
                                        }).map((_, i) => (
                                            <Zap
                                                key={i}
                                                className="h-3.5 w-3.5 text-yellow-500"
                                            />
                                        ))}
                                        {IMPACT_CONFIG[impact].label}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(IMPACT_CONFIG).map(
                                    ([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                {Array.from({
                                                    length: config.count,
                                                }).map((_, i) => (
                                                    <Zap
                                                        key={i}
                                                        className="h-3.5 w-3.5 text-yellow-500"
                                                    />
                                                ))}
                                                {config.label}
                                            </span>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
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
                        disabled={!title.trim() || createGoal.isPending}
                        loading={createGoal.isPending}
                    >
                        Create Goal
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}
