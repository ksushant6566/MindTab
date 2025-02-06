import { and, asc, desc, eq, ilike, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { goals, users } from "~/server/db/schema";
import {
    CreateGoalDto,
    UpdateGoalDto,
    UpdateGoalPositionsDto,
} from "../dtos/goals";
import { db } from "~/server/db";

async function setGoalCompleted(id: string, position: number, executor = db) {
    console.log('setGoalCompleted called with:', { id, position, isTransaction: executor !== db });

    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error('Goal not found');
    }

    let xpToAdd = 0;

    if (goal.status === 'pending') {
        xpToAdd = 5;
    } else if (goal.status === 'in_progress') {
        xpToAdd = 10;
    }

    console.log('Updating goal:', { id, position, status: 'completed', xpToAdd });

    await executor.update(goals)
        .set({
            completedAt: new Date(),
            status: 'completed',
            position
        })
        .where(eq(goals.id, id));
    await executor.update(users)
        .set({ xp: sql`${users.xp} + ${xpToAdd}` })
        .where(eq(users.id, goal.userId));

    return goal;
}

async function setGoalInprogress(id: string, position: number, executor = db) {

    console.log('setGoalInprogress', id, position);
    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error('Goal not found');
    }

    let xpToAdd = 0;

    if (goal.status === 'completed') {
        xpToAdd = -5;
    } else if (goal.status === 'pending') {
        xpToAdd = 5;
    }

    await executor.update(goals)
        .set({
            status: 'in_progress',
            position
        })
        .where(eq(goals.id, id));
    await executor.update(users)
        .set({ xp: sql`${users.xp} + ${xpToAdd}` })
        .where(eq(users.id, goal.userId));

    return goal;
}

async function setGoalPending(id: string, position: number, executor = db) {

    console.log('setGoalPending', id, position);

    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error('Goal not found');
    }

    let xpToSubtract = 0;

    if (goal.status === 'completed') {
        xpToSubtract = 10;
    } else if (goal.status === 'in_progress') {
        xpToSubtract = 5;
    }

    await executor.update(goals)
        .set({
            status: 'pending',
            position
        })
        .where(eq(goals.id, id));
    await executor.update(users)
        .set({ xp: sql`${users.xp} - ${xpToSubtract}` })
        .where(eq(users.id, goal.userId));

    return goal;
}

export const goalsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateGoalDto)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(goals).values({
                ...input,
                userId: ctx.session.user.id,
            });
        }),

    update: protectedProcedure
        .input(UpdateGoalDto)
        .mutation(async ({ ctx, input }) => {
            const goal = await ctx.db.query.goals.findFirst({
                where: eq(goals.id, input.id),
            });

            if (!goal) {
                throw new Error('Goal not found');
            }

            if (input.status === 'completed') {
                await setGoalCompleted(input.id, input.position ?? goal.position);
            } else if (input.status === 'in_progress') {
                await setGoalInprogress(input.id, input.position ?? goal.position);
            } else if (input.status === 'pending') {
                await setGoalPending(input.id, input.position ?? goal.position);
            }
        }),

    updatePositions: protectedProcedure
        .input(UpdateGoalPositionsDto)
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.db.transaction(async (tx) => {
                    const goalIds = input.goals.map(g => g.id);
                    const existingGoals = await tx.select().from(goals).where(inArray(goals.id, goalIds));
                    const goalMap = new Map(existingGoals.map(g => [g.id, g]));

                    let totalXpChange = 0;
                    const userId = existingGoals[0]?.userId;

                    // Calculate total XP change
                    for (const goal of input.goals) {
                        const existingGoal = goalMap.get(goal.id);
                        if (!existingGoal) continue;

                        if (goal.status === 'completed') {
                            if (existingGoal.status === 'pending') totalXpChange += 5;
                            else if (existingGoal.status === 'in_progress') totalXpChange += 10;
                        } else if (goal.status === 'in_progress') {
                            if (existingGoal.status === 'completed') totalXpChange -= 5;
                            else if (existingGoal.status === 'pending') totalXpChange += 5;
                        } else if (goal.status === 'pending') {
                            if (existingGoal.status === 'completed') totalXpChange -= 10;
                            else if (existingGoal.status === 'in_progress') totalXpChange -= 5;
                        }
                    }

                    // Batch update all goals
                    for (const goal of input.goals) {
                        await tx.update(goals)
                            .set({
                                status: goal.status,
                                position: goal.position,
                                completedAt: goal.status === 'completed' ? new Date() : null
                            })
                            .where(eq(goals.id, goal.id));
                    }

                    // Single update for user's XP
                    if (totalXpChange !== 0 && userId) {
                        await tx.update(users)
                            .set({ xp: sql`${users.xp} + ${totalXpChange}` })
                            .where(eq(users.id, userId));
                    }
                });
                return { success: true, sequence: input.sequence };
            } catch (error) {
                console.error('Transaction failed:', error);
                return { success: false, error };
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(goals).where(eq(goals.id, input.id));
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(goals)
                .where(eq(goals.id, input.id));
        }),

    getAll: protectedProcedure.input(z.object({ userId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
        return await ctx.db
            .select()
            .from(goals)
            .where(eq(goals.userId, input?.userId ?? ctx.session.user.id))
            .orderBy(
                asc(goals.position),
                asc(goals.priority),
                desc(goals.createdAt)
            )
    }),

    search: protectedProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, ctx.session.user.id),
                        ilike(goals.title, `%${input.query}%`)
                    )
                )
                .limit(5);
        }),
});
