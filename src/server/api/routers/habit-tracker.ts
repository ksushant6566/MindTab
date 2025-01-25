import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { habitTracker } from '~/server/db/schema'

export const habitTrackerRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(habitTracker)
        .where(eq(habitTracker.userId, input?.userId ?? ctx.session.user.id))
    }),
})
