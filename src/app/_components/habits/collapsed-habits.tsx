import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { InferSelectModel } from "drizzle-orm";
import { Plus } from "lucide-react";
import { habits, habitTracker } from "~/server/db/schema";
import { HabitCell } from "./habit-cell";
import { StreakBoxes } from "./streak-boxes";
import { ScrollArea } from "~/components/ui/scroll-area";

type THabit = InferSelectModel<typeof habits>;
type THabitTracker = InferSelectModel<typeof habitTracker>;

type CollapsedHabitsProps = {
    habits: THabit[];
    habitTracker: THabitTracker[];
    trackHabit: (habit: { habitId: string; date: string }) => void;
    untrackHabit: (habit: { habitId: string; date: string }) => void;
    setIsCreateDialogOpen: (open: boolean) => void;
    isCreatingHabit: boolean;
};

export const CollapsedHabits: React.FC<CollapsedHabitsProps> = ({
    habits,
    habitTracker,
    trackHabit,
    untrackHabit,
    setIsCreateDialogOpen,
    isCreatingHabit,
}) => {
    const today = new Date()
        .toLocaleDateString()
        .split("/")
        .reverse()
        .join("-");

    const onCheckedChange = (
        checked: boolean | "indeterminate",
        habitId: string
    ) => {
        if (checked === true) {
            trackHabit({ habitId, date: today });
        } else if (checked === false) {
            untrackHabit({ habitId, date: today });
        }
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    size="sm"
                    className="gap-2"
                    variant={"secondary"}
                    disabled={isCreatingHabit}
                    loading={isCreatingHabit}
                >
                    <Plus className="h-4 w-4" />
                    Add Habit
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-18rem)]">
                <div className="grid grid-cols-1 auto-cols-fr gap-4 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] pr-4">
                    {habits.map((habit) => {
                        const isChecked = habitTracker.some(
                            (tracker) =>
                                tracker.habitId === habit.id &&
                                tracker.status === "completed" &&
                                tracker.date === today
                        );

                        return (
                            <Card
                                key={habit.id}
                                className="hover:bg-accent/50 transition-colors"
                            >
                                <CardContent className="p-4 flex flex-col justify-between h-full">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold">
                                                {habit.title}
                                            </h3>
                                            <div className="w-5 h-5">
                                                <HabitCell
                                                    habit={habit}
                                                    date={today}
                                                    isEditable={true}
                                                    isChecked={isChecked}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        onCheckedChange(
                                                            checked,
                                                            habit.id
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {/* <p className="text-sm text-muted-foreground">
                                    {habit.description ||
                                        "Description unavailable"}
                                </p> */}
                                    </div>
                                    <div className="mt-auto pt-2">
                                        <StreakBoxes
                                            habit={habit}
                                            habitTracker={habitTracker}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>
        </>
    );
};
