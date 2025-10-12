"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { ToggleGroupItem } from "~/components/ui/toggle-group";
import { ToggleGroup } from "~/components/ui/toggle-group";
import { Edit3, Eye } from "lucide-react";
import React, { useState, useEffect } from "react";
import { EditHabit, EditHabitProps } from "./edit-habit";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type TEditHabitDialogProps = EditHabitProps & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultMode?: "edit" | "view";
};

export const EditHabitDialog = ({
    isOpen,
    onOpenChange,
    defaultMode = "edit",
    habit,
    ...props
}: TEditHabitDialogProps) => {
    const [mode, setMode] = useState<"edit" | "view">(defaultMode);

    // Reset to default mode when dialog opens
    useEffect(() => {
        if (isOpen) {
            setMode(defaultMode);
        }
    }, [isOpen, defaultMode]);

    const toggleMode = () => {
        setMode(mode === "edit" ? "view" : "edit");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogHeader className={"sr-only"}>
                <DialogTitle>{habit.title}</DialogTitle>
                <DialogDescription>
                    {mode === "edit"
                        ? "Edit your habit details"
                        : "View habit details"}
                </DialogDescription>
            </DialogHeader>
            <DialogContent className={`max-w-lg md:max-w-xl border-none p-0`}>
                <ToggleGroup
                    type="single"
                    className="absolute top-2.5 right-10 cursor-pointer z-10"
                >
                    <ToggleGroupItem
                        value={mode}
                        aria-label={`Toggle ${mode === "edit" ? "view" : "edit"}`}
                        onClick={toggleMode}
                        data-state={mode === "edit" ? "on" : "off"}
                        className="p-1.5 h-7 w-7"
                    >
                        <Edit3 className="h-3 w-3" />
                    </ToggleGroupItem>
                </ToggleGroup>

                {mode === "edit" ? (
                    <EditHabit habit={habit} {...props} />
                ) : (
                    <Card className="flex flex-col gap-2 rounded-lg border p-6">
                        <CardContent className="space-y-2 px-0">
                            <CardTitle className="text-xl">
                                {habit.title}
                            </CardTitle>
                            {habit.description && (
                                <p className="text-base text-muted-foreground">
                                    {habit.description}
                                </p>
                            )}
                            <p className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                                {new Date(habit.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    );
};
