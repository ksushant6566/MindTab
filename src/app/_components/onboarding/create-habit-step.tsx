"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft, Repeat, Sparkles } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type CreateHabitStepProps = {
    onComplete: () => void;
    onBack: () => void;
    loading: boolean;
};

export function CreateHabitStep({
    onComplete,
    onBack,
    loading,
}: CreateHabitStepProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const createHabit = api.habits.create.useMutation({
        onSuccess: () => {
            onComplete();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create habit");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createHabit.mutate({
            title,
            description,
            frequency: "daily",
        });
    };

    const isLoading = createHabit.isPending || loading;

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-3">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Repeat className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Build your first habit</h2>
                </motion.div>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed pl-[52px]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Track daily habits and build streaks. You earn{" "}
                    <span className="text-amber-400 font-medium">10 XP</span>{" "}
                    every time you complete one!
                </motion.p>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
            >
                <div className="space-y-2">
                    <Label htmlFor="habit-title">Habit Title</Label>
                    <Input
                        id="habit-title"
                        placeholder='e.g. "Read for 30 minutes", "Exercise", "Meditate"'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="habit-description">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="habit-description"
                        placeholder="Any details about this habit?"
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
                        disabled={isLoading}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!title.trim() || isLoading}
                        loading={isLoading}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Finish Setup
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}
