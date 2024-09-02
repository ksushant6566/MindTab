import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { goals } from "~/server/db/schema";
import { CreateGoalDto, UpdateGoalDto } from "../dtos/goals";
import { eq } from "drizzle-orm";
import { z } from "zod";

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

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(goals).where(eq(goals.id, input.id));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(goals).where(eq(goals.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(goals)
      .where(eq(goals.userId, ctx.session.user.id));
  }),
});
