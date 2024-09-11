"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Edit3, Plus, RotateCcw, Trash2} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";
import { habits } from "~/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { CreateHabit } from "./create-habit";
import { EditHabit } from "./edit-habit";
import { Skeleton } from "~/components/ui/skeleton";
import { CheckedState } from "@radix-ui/react-checkbox";

import Confetti from 'react-confetti';

const ZInsertHabit = createInsertSchema(habits).omit({
    userId: true,
    id: true,
});

const HabitTable: React.FC = () => {
    const { data: habits, refetch: refetchHabits } = api.habits.getAll.useQuery();
    const {
        mutate: deleteHabit,
        isPending: isDeletingHabit,
        variables: deleteHabitVariables,
    } = api.habits.delete.useMutation({
        onSuccess: () => {
            refetchHabits();
        },
    });

    const { mutate: createHabit, isPending: isCreatingHabit } =
        api.habits.create.useMutation({
            onSuccess: () => {
                refetchHabits();
            },
        });

    const { mutate: updateHabit, isPending: isUpdatingHabit } =
        api.habits.update.useMutation({
            onSuccess: () => {
                refetchHabits();
                setEditHabitId(null);
            },
        });

    const { data: habitTracker, isLoading: isLoadingHabitTracker, refetch: refetchHabitTracker } =
        api.habitTracker.getAll.useQuery();

    const { mutate: trackHabit, isPending: isTrackingHabit } =
        api.habits.trackHabit.useMutation({
            onSuccess: () => {
                refetchHabitTracker();
            },
        });

    const { mutate: untrackHabit, isPending: isUnTrackingHabit } =
        api.habits.untrackHabit.useMutation({
            onSuccess: () => {
                refetchHabitTracker();
            },
        });

    const containerRef = useRef<HTMLDivElement>(null);
    const currentWeekRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
    const [editHabitId, setEditHabitId] = useState<string | null>(null);

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (containerRef.current && currentWeekRef.current) {
            containerRef.current.scrollTo({
                top: currentWeekRef.current.offsetTop,
                behavior: "smooth",
            });
        }

        const handleScroll = () => {
            if (containerRef.current && currentWeekRef.current) {
                const containerRect =
                    containerRef.current.getBoundingClientRect();
                const currentWeekRect =
                    currentWeekRef.current.getBoundingClientRect();
                setShowScrollButton(
                    currentWeekRect.top < containerRect.top ||
                        currentWeekRect.bottom > containerRect.bottom
                );
            }
        };

        containerRef.current?.addEventListener("scroll", handleScroll);
        return () => {
            containerRef.current?.removeEventListener("scroll", handleScroll);
            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
            }
        };
    }, []);

    const scrollToCurrentWeek = () => {
        if (containerRef.current && currentWeekRef.current) {
            containerRef.current.scrollTo({
                top: currentWeekRef.current.offsetTop,
                behavior: "smooth",
            });
        }
    };

    const getCurrentWeek = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    };

    const getCurrentDay = () => {
        return new Date().getDay() || 7; // Sunday is 0, so we change it to 7
    };

    const getWeek = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    };

    const getDateFromWeekAndDay = (week: number, day: number) => {
        const start = new Date(new Date().getFullYear(), 0, 1);
        const diff = (week) * 1000 * 60 * 60 * 24 * 7;
        const date = new Date(start.getTime() + diff);

        date.setDate(date.getDate() + day);
        return date.toISOString().split('T')[0];
    };

    const handleCreateHabit = (habit: z.infer<typeof ZInsertHabit>) => {
        createHabit(habit);
        setIsCreateHabitOpen(false);
    };

    const handleEditHabit = (habit: z.infer<typeof ZInsertHabit>) => {
        if (editHabitId) {
            updateHabit({ ...habit, id: editHabitId });
        }
    };

    const onTrackHabit = (habitId: string) => {
        trackHabit({ habitId, date: new Date() });
    };

    const onUntrackHabit = (habitId: string) => {
        untrackHabit({ habitId, date: new Date() });        
    };

    const onCheckedChange = (habitId: string, checked: CheckedState) => {
        if (checked) {
            onTrackHabit(habitId);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2500);
        } else {
            onUntrackHabit(habitId);
        }
    };

    const currentWeek = getCurrentWeek();
    const currentDay = getCurrentDay();

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className={`custom-scrollbar overflow-auto max-h-[80vh] snap-y snap-mandatory scroll-smooth `}
                style={{
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {Array.from({ length: 52 }, (_, weekIndex) => {
                    const isCurrentWeek = weekIndex === currentWeek;
                    return (
                        <div
                            key={weekIndex}
                            className="snap-start mb-16"
                            ref={isCurrentWeek ? currentWeekRef : null}
                        >
                            <h2 className="text-xl font-semibold mb-4">
                                Week {weekIndex + 1}
                                {isCurrentWeek && " (Current)"}
                            </h2>
                            <Table className="table-fixed habit-table">
                                <TableHeader>
                                    <TableRow className="border-none">
                                        <TableHead className="border-none w-[90px] ">
                                            Habit
                                        </TableHead>
                                        {[
                                            "Mon",
                                            "Tue",
                                            "Wed",
                                            "Thu",
                                            "Fri",
                                            "Sat",
                                            "Sun",
                                        ].map((day, index) => (
                                            <TableHead
                                                key={day}
                                                className={`text-center w-[50px] ${
                                                    isCurrentWeek &&
                                                    index + 1 === currentDay
                                                        ? "text-primary"
                                                        : ""
                                                }`}
                                            >
                                                {day}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {habits?.map(
                                        (habit) =>
                                            // a habit should only be shown if it was created in the current week or before
                                            getWeek(habit.createdAt) <=
                                                weekIndex &&
                                            (habit.id === editHabitId &&
                                            weekIndex === currentWeek ? (
                                                <TableRow className="border-none hover:bg-transparent group">
                                                    <TableCell colSpan={8}>
                                                        {isUpdatingHabit ? (
                                                            <div className="flex gap-2 m-0 p-0">
                                                                <Skeleton className="h-11 w-[25%]" />
                                                                <Skeleton className="h-11 w-full" />
                                                            </div>
                                                        ) : (
                                                            <EditHabit
                                                                key={habit.id}
                                                                habit={habit}
                                                                onSave={
                                                                    handleEditHabit
                                                                }
                                                                onCancel={() =>
                                                                    setEditHabitId(
                                                                        null
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow
                                                    key={habit.id}
                                                    className="border-none hover:bg-transparent group"
                                                >
                                                    <TableCell className="font-medium overflow-hidden text-ellipsis text-nowrap">
                                                        {habit.title}
                                                    </TableCell>
                                                    {Array.from(
                                                        { length: 7 },
                                                        (_, dayIndex) => (
                                                            <TableCell
                                                                key={`${habit.id}-${dayIndex}`}
                                                                className="text-center p-0 px-1"
                                                            >
                                                                <Checkbox
                                                                    className="w-8 h-8 md:w-full md:h-11"
                                                                    disabled={!isCurrentWeek || dayIndex + 1 !== currentDay}
                                                                    checked={habitTracker?.some(
                                                                        (tracker) =>
                                                                            tracker.habitId === habit.id &&
                                                                            tracker.status === "completed" &&
                                                                            tracker.date === getDateFromWeekAndDay(weekIndex, dayIndex + 1)
                                                                    )}
                                                                    onCheckedChange={(checked) => {
                                                                        onCheckedChange(habit.id, checked);
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        )
                                                    )}
                                                    <TableCell className="relative p-0">
                                                        <div className="flex absolute gap-0 group-hover:visible right-0 -top-4 group-hover:top-2 group-hover:opacity-100 invisible transition-all opacity-0">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setEditHabitId(
                                                                        habit.id
                                                                    )
                                                                }
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className=" hover:bg-red-900 active:bg-red-900"
                                                                onClick={() => deleteHabit({id: habit.id})}
                                                                disabled={isDeletingHabit && deleteHabitVariables?.id === habit.id}
                                                                loading={isDeletingHabit && deleteHabitVariables?.id === habit.id}
                                                                hideContentWhenLoading
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                    {habits?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <div className="flex flex-col items-center justify-center gap-2 -mt-2">
                                                    <span className="text-base">
                                                        No habits found
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {isCurrentWeek &&
                                (isCreateHabitOpen ? (
                                    <div className="mt-4">
                                        <CreateHabit
                                            onSave={handleCreateHabit}
                                            onCancel={() =>
                                                setIsCreateHabitOpen(false)
                                            }
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            setIsCreateHabitOpen(true)
                                        }
                                        variant={"ghost"}
                                        loading={isCreatingHabit}
                                        className={`mt-2 ${isCreatingHabit ? "mr-2" : ""}`}
                                        hideContentWhenLoading={true}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add habit
                                    </Button>
                                ))}
                        </div>
                    );
                })}
            </div>
            {showScrollButton && (
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                className="absolute top-0 right-4"
                                onClick={scrollToCurrentWeek}
                                title="Scroll to current week"
                                size="icon"
                                variant="secondary"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Scroll to current week</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {showConfetti && 
            <div className="fixed top-0 left-0 w-full h-full">

            <Confetti 
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    gravity={0.1}
                    numberOfPieces={2000} />
            </div>
            }
        </div>
    );
};

export const Habits: React.FC = () => {
    return (
        <div className="flex justify-center items-center relative">
            <HabitTable />
        </div>
    );
};
