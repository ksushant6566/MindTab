"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import React from "react";
import { CreateHabit, CreateHabitProps } from "./create-habit";

type TCreateHabitDialogProps = CreateHabitProps & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export const CreateHabitDialog = ({
    isOpen,
    onOpenChange,
    ...props
}: TCreateHabitDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle className="sr-only">Create new habit</DialogTitle>
                <DialogDescription className="sr-only">
                    Add a new habit to track daily or weekly.
                </DialogDescription>
            </DialogHeader>
            <DialogContent className="max-w-lg md:max-w-xl border-none p-0">
                <CreateHabit {...props} />
            </DialogContent>
        </Dialog>
    );
};
