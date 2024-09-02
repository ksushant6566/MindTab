import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habits } from "~/server/db/schema";
import { CreateHabitDto, UpdateHabitDto } from "../dtos/habits";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const habitsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateHabitDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(habits).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  update: protectedProcedure
    .input(UpdateHabitDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(habits).set(input).where(eq(habits.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(habits).where(eq(habits.id, input.id));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(habits).where(eq(habits.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(habits)
      .where(eq(habits.userId, ctx.session.user.id));
  }),
});
