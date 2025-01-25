import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habits, habitTracker } from "~/server/db/schema";
import { CreateHabitDto, UpdateHabitDto } from "../dtos/habits";

export const habitsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateHabitDto)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .insert(habits)
                .values({
                    ...input,
                    userId: ctx.session.user.id,
                })
                .onConflictDoUpdate({
                    target: [habits.title, habits.userId],
                    set: { deletedAt: null },
                });
        }),

    update: protectedProcedure
        .input(UpdateHabitDto)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(habits)
                .set(input)
                .where(eq(habits.id, input.id));
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // shadow delete
            await ctx.db
                .update(habits)
                .set({ deletedAt: new Date() })
                .where(eq(habits.id, input.id));
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(habits)
                .where(eq(habits.id, input.id));
        }),

    getAll: protectedProcedure.input(z.object({ userId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
        return await ctx.db
            .select()
            .from(habits)
            .where(
                and(
                    eq(habits.userId, input?.userId ?? ctx.session.user.id),
                    isNull(habits.deletedAt)
                )
            )
            .orderBy(desc(habits.createdAt));
    }),

    trackHabit: protectedProcedure
        .input(z.object({ habitId: z.string().uuid(), date: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db
                .insert(habitTracker)
                .values({
                    habitId: input.habitId,
                    userId: ctx.session.user.id,
                    status: "completed",
                    date: input.date,
                })
                .onConflictDoUpdate({
                    target: [habitTracker.habitId, habitTracker.userId, habitTracker.date],
                    set: { status: "completed" },
                })
                .returning({
                    id: habitTracker.id,
                });
        }),

    untrackHabit: protectedProcedure
        .input(z.object({ habitId: z.string().uuid(), date: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(habitTracker)
                .where(and(eq(habitTracker.habitId, input.habitId), eq(habitTracker.date, input.date)));
        }),
});
