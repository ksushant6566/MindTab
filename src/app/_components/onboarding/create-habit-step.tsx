"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

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
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Build your first habit</h2>
                <p className="text-muted-foreground">
                    Track daily habits and build streaks. You earn 10 XP every time
                    you complete one!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        Create Habit & Finish Setup
                    </Button>
                </div>
            </form>
        </div>
    );
}
