import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { journal as journals } from '~/server/db/schema'
import { CreateJournalDto, UpdateJournalDto } from '../dtos/journals'

export const journalsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateJournalDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(journals).values({
        ...input,
        userId: ctx.session.user.id,
      })
    }),

  update: protectedProcedure
    .input(UpdateJournalDto)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(journals).set(input).where(eq(journals.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(journals).where(eq(journals.id, input.id))
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, input.id))
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(journals)
      .where(eq(journals.userId, ctx.session.user.id))
  }),
})
