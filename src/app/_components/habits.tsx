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
import { RotateCcw } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

interface Habit {
    id: string;
    title: string;
}

const HabitTable: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([
        { id: "1", title: "Exercise" },
        { id: "2", title: "Read" },
        { id: "3", title: "Meditate" },
        { id: "4", title: "Gym" },
        { id: "6", title: "Reading" },
        { id: "7", title: "Writing" },
        { id: "8", title: "Coding" },
        { id: "9", title: "Cooking" },
        { id: "10", title: "Yoga" },
    ]);

    const containerRef = useRef<HTMLDivElement>(null);
    const currentWeekRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

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
                                    {habits.map((habit) => (
                                        <TableRow
                                            key={habit.id}
                                            className="border-none"
                                        >
                                            <TableCell className="font-medium">
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
                                                                dayIndex + 1 !==
                                                                    currentDay
                                                            }
                                                        />
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
