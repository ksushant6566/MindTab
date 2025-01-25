'use client';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { subDays, format, eachDayOfInterval, isSameDay, getDay } from "date-fns";

type Activity = {
    date: Date;
    count: number;
    details: {
        goalsCreated: number;
        goalsCompleted: number;
        habitsCreated: number;
        habitsMarked: number;
        journalsCreated: number;
        journalsUpdated: number;
    };
};

type ActivityChartProps = {
    activities: Activity[];
};

export function ActivityChart({ activities }: ActivityChartProps) {
    // Get last 365 days
    const today = new Date();
    const yearAgo = subDays(today, 365);
    const days = eachDayOfInterval({ start: yearAgo, end: today });

    // Function to get activity level (0-4) based on count
    const getActivityLevel = (count: number) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    // Function to get activity details for a day
    const getActivityForDay = (day: Date) => {
        const activity = activities.find(a => isSameDay(new Date(a.date), day));
        return activity ?? {
            date: day,
            count: 0,
            details: {
                goalsCreated: 0,
                goalsCompleted: 0,
                habitsCreated: 0,
                habitsMarked: 0,
                journalsCreated: 0,
                journalsUpdated: 0
            }
        };
    };

    // Group days by week
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add empty cells at the start to align with the correct day of week
    const firstDay = days[0]!;
    const firstDayOfWeek = getDay(firstDay);
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(new Date(0)); // placeholder date
    }

    days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    // Add the last partial week if it exists
    if (currentWeek.length > 0) {
        // Fill the rest of the week with placeholder dates
        while (currentWeek.length < 7) {
            currentWeek.push(new Date(0));
        }
        weeks.push(currentWeek);
    }

    // Add day labels
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <div className="flex gap-2">
                                {/* Day labels */}
                                <div className="grid grid-rows-7 gap-1 text-sm text-muted-foreground pr-2">
                                    {dayLabels.map((label, i) => (
                                        <div key={i} className="h-3 flex items-center">
                                            {i % 2 === 0 ? label : ''}
                                        </div>
                                    ))}
                                </div>
                                {/* Activity grid */}
                                <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                                    {weeks.map((week, weekIndex) => (
                                        week.map((day, dayIndex) => {
                                            // Skip placeholder dates
                                            if (day.getTime() === 0) {
                                                return <div key={`${weekIndex}-${dayIndex}`} className="h-3 w-3" />;
                                            }

                                            const activity = getActivityForDay(day);
                                            const level = getActivityLevel(activity.count);
                                            return (
                                                <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div
                                                                className={`h-3.5 w-3.5 rounded ${level === 0
                                                                    ? 'bg-muted'
                                                                    : level === 1
                                                                        ? 'bg-emerald-200 dark:bg-emerald-900'
                                                                        : level === 2
                                                                            ? 'bg-emerald-300 dark:bg-emerald-700'
                                                                            : level === 3
                                                                                ? 'bg-emerald-400 dark:bg-emerald-500'
                                                                                : 'bg-emerald-500 dark:bg-emerald-300'
                                                                    }`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className="text-sm">
                                                                <p className="font-medium">
                                                                    {format(day, 'MMM d, yyyy')}
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    {activity.count} activities
                                                                </p>
                                                                {activity.count > 0 && (
                                                                    <div className="mt-1 space-y-1 text-xs">
                                                                        {activity.details.goalsCreated > 0 && (
                                                                            <p>{activity.details.goalsCreated} goals created</p>
                                                                        )}
                                                                        {activity.details.goalsCompleted > 0 && (
                                                                            <p>{activity.details.goalsCompleted} goals completed</p>
                                                                        )}
                                                                        {activity.details.habitsCreated > 0 && (
                                                                            <p>{activity.details.habitsCreated} habits created</p>
                                                                        )}
                                                                        {activity.details.habitsMarked > 0 && (
                                                                            <p>{activity.details.habitsMarked} habits marked</p>
                                                                        )}
                                                                        {activity.details.journalsCreated > 0 && (
                                                                            <p>{activity.details.journalsCreated} journals created</p>
                                                                        )}
                                                                        {activity.details.journalsUpdated > 0 && (
                                                                            <p>{activity.details.journalsUpdated} journals updated</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="h-3 w-3 rounded-sm bg-muted" />
                                    <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                                    <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
                                    <div className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-500" />
                                    <div className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-300" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 