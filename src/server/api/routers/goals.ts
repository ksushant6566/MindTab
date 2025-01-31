import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { goals } from "~/server/db/schema";
import {
    CreateGoalDto,
    UpdateGoalDto,
    UpdateGoalPositionsDto,
} from "../dtos/goals";

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
            await ctx.db.update(goals).set(input).where(eq(goals.id, input.id));
        }),

    updatePositions: protectedProcedure
        .input(UpdateGoalPositionsDto)
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.db.transaction(async (tx) => {
                    for (const goal of input.goals) {
                        await tx
                            .update(goals)
                            .set({
                                position: goal.position,
                                status: goal.status,
                            })
                            .where(eq(goals.id, goal.id));
                    }
                });
                return { success: true, sequence: input.sequence };
            } catch (error) {
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
