import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habitTracker } from "~/server/db/schema";
import {
  CreateHabitTrackerDto,
  UpdateHabitTrackerDto,
} from "../dtos/habit-tracker";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const habitTrackerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateHabitTrackerDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(habitTracker).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  update: protectedProcedure
    .input(UpdateHabitTrackerDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(habitTracker)
        .set(input)
        .where(eq(habitTracker.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(habitTracker).where(eq(habitTracker.id, input.id));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(habitTracker)
        .where(eq(habitTracker.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(habitTracker)
      .where(eq(habitTracker.userId, ctx.session.user.id));
  }),
});
