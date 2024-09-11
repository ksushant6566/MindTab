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
import { Plus, RotateCcw, Trash2 } from "lucide-react";
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

const ZInsertHabit = createInsertSchema(habits).omit({
    userId: true,
    id: true,
});

const HabitTable: React.FC = () => {
    const { data: habits, refetch } = api.habits.getAll.useQuery();
    const {
        mutate: deleteHabit,
        isPending: isDeletingHabit,
        variables: deleteHabitVariables,
    } = api.habits.delete.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    const { mutate: createHabit, isPending: isCreatingHabit } =
        api.habits.create.useMutation({
            onSuccess: () => {
                refetch();
            },
        });

    const containerRef = useRef<HTMLDivElement>(null);
    const currentWeekRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);

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

    const handleCreateHabit = (habit: z.infer<typeof ZInsertHabit>) => {
        createHabit(habit);
        setIsCreateHabitOpen(false);
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
                                        <TableHead className="border-none w-[100px]">
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
                                                weekIndex && (
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
                                                                    disabled={
                                                                        !isCurrentWeek ||
                                                                        dayIndex +
                                                                            1 !==
                                                                            currentDay
                                                                    }
                                                                />
                                                            </TableCell>
                                                        )
                                                    )}
                                                    <TableCell className="">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="hover:bg-red-900 active:bg-red-900 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 invisible transition-all opacity-0 -translate-y-6"
                                                            onClick={() =>
                                                                deleteHabit({
                                                                    id: habit.id,
                                                                })
                                                            }
                                                            disabled={
                                                                isDeletingHabit &&
                                                                deleteHabitVariables?.id ===
                                                                    habit.id
                                                            }
                                                            loading={
                                                                isDeletingHabit &&
                                                                deleteHabitVariables?.id ===
                                                                    habit.id
                                                            }
                                                            hideContentWhenLoading
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
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
        </div>
    );
};

export const Habits: React.FC = () => {
    return (
        <div className="flex justify-center items-center relative ">
            <HabitTable />
        </div>
    );
};
