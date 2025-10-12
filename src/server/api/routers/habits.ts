import { and, desc, eq, ilike, isNull, not, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habits, habitTracker, users } from "~/server/db/schema";
import { CreateHabitDto, UpdateHabitDto } from "../dtos/habits";

export const habitsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateHabitDto)
        .mutation(async ({ ctx, input }) => {
            // Check if a habit with the same title already exists for this user (not deleted)
            const existingHabit = await ctx.db.query.habits.findFirst({
                where: and(
                    eq(habits.userId, ctx.session.user.id),
                    eq(habits.title, input.title ?? "")
                ),
            });

            if (existingHabit) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `A habit named "${input.title}" already exists. Please choose a different name.`,
                });
            }

            await ctx.db.insert(habits).values({
                ...input,
                userId: ctx.session.user.id,
            });
        }),

    update: protectedProcedure
        .input(UpdateHabitDto)
        .mutation(async ({ ctx, input }) => {
            // If title is being updated, check for duplicates
            if (input.title) {
                const existingHabit = await ctx.db.query.habits.findFirst({
                    where: and(
                        eq(habits.userId, ctx.session.user.id),
                        eq(habits.title, input.title),
                        isNull(habits.deletedAt),
                        not(eq(habits.id, input.id)) // Exclude the current habit
                    ),
                });

                if (existingHabit) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: `A habit named "${input.title}" already exists. Please choose a different name.`,
                    });
                }
            }

            await ctx.db
                .update(habits)
                .set(input)
                .where(eq(habits.id, input.id));
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(habits).where(eq(habits.id, input.id));
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(habits)
                .where(eq(habits.id, input.id));
        }),

    getAll: protectedProcedure
        .input(z.object({ userId: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
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
            return await ctx.db.transaction(async (tx) => {
                const result = await tx
                    .insert(habitTracker)
                    .values({
                        habitId: input.habitId,
                        userId: ctx.session.user.id,
                        status: "completed",
                        date: input.date,
                    })
                    .onConflictDoUpdate({
                        target: [
                            habitTracker.habitId,
                            habitTracker.userId,
                            habitTracker.date,
                        ],
                        set: { status: "completed" },
                    })
                    .returning({
                        id: habitTracker.id,
                    });

                // Add XP for completing habit
                await tx
                    .update(users)
                    .set({ xp: sql`${users.xp} + 10` })
                    .where(eq(users.id, ctx.session.user.id));

                return result[0];
            });
        }),

    untrackHabit: protectedProcedure
        .input(z.object({ habitId: z.string().uuid(), date: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.transaction(async (tx) => {
                await tx
                    .delete(habitTracker)
                    .where(
                        and(
                            eq(habitTracker.habitId, input.habitId),
                            eq(habitTracker.date, input.date)
                        )
                    );

                // Subtract XP for uncompleting habit
                await tx
                    .update(users)
                    .set({ xp: sql`${users.xp} - 10` })
                    .where(eq(users.id, ctx.session.user.id));
            });
        }),
    search: protectedProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(habits)
                .where(
                    and(
                        eq(habits.userId, ctx.session.user.id),
                        ilike(habits.title, `%${input.query}%`),
                        isNull(habits.deletedAt)
                    )
                )
                .limit(5);
        }),
});
