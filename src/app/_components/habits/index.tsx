"use client";

import React, { useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { CollapsedHabits } from "./collapsed-habits";
import { HabitTable } from "./habit-table";
import { CreateHabitDialog } from "./create-habit-dialog";

import { HabitTableSkeleton } from "./habit-table-skeleton";
export type ViewMode = "table" | "cards";

type HabitsProps = {
    viewMode: ViewMode;
};

export const Habits: React.FC<HabitsProps> = ({ viewMode }) => {
    const apiUtils = api.useUtils();
    const successAudioRef = useRef<HTMLAudioElement | null>(null);
    const errorAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

    useEffect(() => {
        successAudioRef.current = new Audio("/audio/success.mp3");
        successAudioRef.current.addEventListener("error", (e) => {
            console.error("Audio loading error:", e);
        });
        errorAudioRef.current = new Audio("/audio/error.mp3");
        errorAudioRef.current.addEventListener("error", (e) => {
            console.error("Audio loading error:", e);
        });
    }, []);

    const playSound = (type: "success" | "error") => {
        const audio =
            type === "success"
                ? successAudioRef.current
                : errorAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio
                .play()
                .catch((error) => console.error("Error playing sound:", error));
        }
    };

    const { data: habits, isFetching: isFetchingHabits } =
        api.habits.getAll.useQuery(undefined, {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });

    const {
        mutate: deleteHabit,
        isPending: isDeletingHabit,
        variables: deleteHabitVariables,
    } = api.habits.delete.useMutation({
        async onMutate(variables) {
            await apiUtils.habits.getAll.cancel();
            const previousHabits = apiUtils.habits.getAll.getData() ?? [];

            apiUtils.habits.getAll.setData(
                undefined,
                previousHabits.filter((habit) => habit.id !== variables.id)
            );
            return { previousHabits };
        },
        onError(error, variables, context) {
            apiUtils.habits.getAll.setData(
                undefined,
                context?.previousHabits ?? []
            );
        },
        onSettled() {
            apiUtils.habits.getAll.invalidate();
        },
    });

    const { mutate: createHabit, isPending: isCreatingHabit } =
        api.habits.create.useMutation({
            onSuccess() {
                setIsCreateDialogOpen(false);
            },
            onError(error) {
                toast.error(error.message || "Failed to create habit", {
                    position: "top-right",
                });
            },
            onSettled() {
                apiUtils.habits.getAll.invalidate();
            },
        });

    const { mutate: updateHabit, isPending: isUpdatingHabit } =
        api.habits.update.useMutation({
            onError(error) {
                toast.error(error.message || "Failed to update habit", {
                    position: "top-right",
                });
            },
            onSettled() {
                apiUtils.habits.getAll.invalidate();
            },
        });

    const { data: habitTracker } = api.habitTracker.getAll.useQuery(undefined, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { mutate: trackHabit } = api.habits.trackHabit.useMutation({
        async onMutate(variables) {
            await apiUtils.habitTracker.getAll.cancel();
            const previousHabitTracker =
                apiUtils.habitTracker.getAll.getData() ?? [];

            apiUtils.habitTracker.getAll.setData(undefined, [
                ...previousHabitTracker,
                {
                    habitId: variables.habitId,
                    date: variables.date,
                    status: "completed",
                    id: "1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: "1",
                },
            ]);

            const currentUser = apiUtils.users.get.getData();
            if (currentUser) {
                apiUtils.users.get.setData(undefined, {
                    ...currentUser,
                    xp: currentUser.xp + 10,
                });
            }

            playSound("success");
            return { previousHabitTracker };
        },

        onError(error, variables, context) {
            apiUtils.habitTracker.getAll.setData(
                undefined,
                context?.previousHabitTracker ?? []
            );
        },

        onSettled() {
            apiUtils.habitTracker.getAll.invalidate();
            apiUtils.users.get.invalidate();
        },
    });

    const { mutate: untrackHabit } = api.habits.untrackHabit.useMutation({
        async onMutate(variables) {
            await apiUtils.habitTracker.getAll.cancel();
            const previousHabitTracker =
                apiUtils.habitTracker.getAll.getData() ?? [];

            apiUtils.habitTracker.getAll.setData(
                undefined,
                previousHabitTracker.filter(
                    (habit) =>
                        !(
                            habit.habitId === variables.habitId &&
                            habit.date === variables.date
                        )
                )
            );

            const currentUser = apiUtils.users.get.getData();
            if (currentUser) {
                apiUtils.users.get.setData(undefined, {
                    ...currentUser,
                    xp: currentUser.xp - 10,
                });
            }

            playSound("error");
            return { previousHabitTracker };
        },

        onError(error, variables, context) {
            apiUtils.habitTracker.getAll.setData(
                undefined,
                context?.previousHabitTracker ?? []
            );
        },

        onSettled() {
            apiUtils.habitTracker.getAll.invalidate();
            apiUtils.users.get.invalidate();
        },
    });

    return (
        <div className="flex flex-col gap-4">
            {isFetchingHabits ? (
                <HabitTableSkeleton viewMode={viewMode} />
            ) : viewMode === "table" ? (
                <HabitTable
                    habits={habits ?? []}
                    isCreatingHabit={isCreatingHabit}
                    isUpdatingHabit={isUpdatingHabit}
                    isDeletingHabit={isDeletingHabit}
                    deleteHabitVariables={deleteHabitVariables}
                    createHabit={createHabit}
                    updateHabit={updateHabit}
                    deleteHabit={deleteHabit}
                    trackHabit={trackHabit}
                    untrackHabit={untrackHabit}
                    habitTracker={habitTracker ?? []}
                />
            ) : (
                <CollapsedHabits
                    habits={habits ?? []}
                    habitTracker={habitTracker ?? []}
                    trackHabit={trackHabit}
                    untrackHabit={untrackHabit}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    isCreatingHabit={isCreatingHabit}
                />
            )}
            <CreateHabitDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSave={createHabit}
                onCancel={() => setIsCreateDialogOpen(false)}
                loading={isCreatingHabit}
            />
        </div>
    );
};
