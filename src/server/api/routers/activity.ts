import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { goals, habits, habitTracker, journal } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { subDays, format } from "date-fns";

export const activityRouter = createTRPCRouter({
    getUserActivity: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const yearAgo = subDays(new Date(), 365);

            // Get goals created and completed
            const goalsActivity = await ctx.db
                .select({
                    createdAt: goals.createdAt,
                    status: goals.status,
                })
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, input.userId),
                        gte(goals.createdAt, yearAgo)
                    )
                );

            // Get habits created and marked
            const habitsActivity = await ctx.db
                .select({
                    createdAt: habits.createdAt,
                })
                .from(habits)
                .where(
                    and(
                        eq(habits.userId, input.userId),
                        gte(habits.createdAt, yearAgo)
                    )
                );

            const habitsMarked = await ctx.db
                .select({
                    date: habitTracker.date,
                })
                .from(habitTracker)
                .where(
                    and(
                        eq(habitTracker.userId, input.userId),
                        gte(habitTracker.date, yearAgo.toISOString())
                    )
                );

            // Get journals created and updated
            const journalsActivity = await ctx.db
                .select({
                    createdAt: journal.createdAt,
                    updatedAt: journal.updatedAt,
                })
                .from(journal)
                .where(
                    and(
                        eq(journal.userId, input.userId),
                        gte(journal.createdAt, yearAgo)
                    )
                );

            // Combine all activities into a daily activity count
            const activityMap = new Map<string, {
                count: number;
                details: {
                    goalsCreated: number;
                    goalsCompleted: number;
                    habitsCreated: number;
                    habitsMarked: number;
                    journalsCreated: number;
                    journalsUpdated: number;
                };
            }>();

            // Process goals
            goalsActivity.forEach((goal) => {
                const date = format(goal.createdAt, 'yyyy-MM-dd');
                const entry = activityMap.get(date) ?? {
                    count: 0,
                    details: {
                        goalsCreated: 0,
                        goalsCompleted: 0,
                        habitsCreated: 0,
                        habitsMarked: 0,
                        journalsCreated: 0,
                        journalsUpdated: 0,
                    },
                };

                entry.count++;
                entry.details.goalsCreated++;
                if (goal.status === "completed") {
                    entry.count++;
                    entry.details.goalsCompleted++;
                }
                activityMap.set(date, entry);
            });

            // Process habits created
            habitsActivity.forEach((habit) => {
                const date = format(habit.createdAt, 'yyyy-MM-dd');
                const entry = activityMap.get(date) ?? {
                    count: 0,
                    details: {
                        goalsCreated: 0,
                        goalsCompleted: 0,
                        habitsCreated: 0,
                        habitsMarked: 0,
                        journalsCreated: 0,
                        journalsUpdated: 0,
                    },
                };

                entry.count++;
                entry.details.habitsCreated++;
                activityMap.set(date, entry);
            });

            // Process habits marked
            habitsMarked.forEach((mark) => {
                const date = format(mark.date, 'yyyy-MM-dd');
                const entry = activityMap.get(date) ?? {
                    count: 0,
                    details: {
                        goalsCreated: 0,
                        goalsCompleted: 0,
                        habitsCreated: 0,
                        habitsMarked: 0,
                        journalsCreated: 0,
                        journalsUpdated: 0,
                    },
                };

                entry.count++;
                entry.details.habitsMarked++;
                activityMap.set(date, entry);
            });

            // Process journals
            journalsActivity.forEach((journal) => {
                const createdDate = format(journal.createdAt, 'yyyy-MM-dd');
                const entry = activityMap.get(createdDate) ?? {
                    count: 0,
                    details: {
                        goalsCreated: 0,
                        goalsCompleted: 0,
                        habitsCreated: 0,
                        habitsMarked: 0,
                        journalsCreated: 0,
                        journalsUpdated: 0,
                    },
                };

                entry.count++;
                entry.details.journalsCreated++;
                activityMap.set(createdDate, entry);

                if (journal.updatedAt && journal.updatedAt > journal.createdAt) {
                    const updatedDate = format(journal.updatedAt, 'yyyy-MM-dd');
                    if (updatedDate !== createdDate) {
                        const updateEntry = activityMap.get(updatedDate) ?? {
                            count: 0,
                            details: {
                                goalsCreated: 0,
                                goalsCompleted: 0,
                                habitsCreated: 0,
                                habitsMarked: 0,
                                journalsCreated: 0,
                                journalsUpdated: 0,
                            },
                        };

                        updateEntry.count++;
                        updateEntry.details.journalsUpdated++;
                        activityMap.set(updatedDate, updateEntry);
                    }
                }
            });

            // Convert map to array and ensure dates are properly formatted
            return Array.from(activityMap.entries()).map(([dateStr, data]) => ({
                date: new Date(dateStr),
                ...data,
            }));
        }),
}); 