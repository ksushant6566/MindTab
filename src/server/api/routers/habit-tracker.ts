import { desc, eq } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { habitTracker } from '~/server/db/schema'

export const habitTrackerRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(habitTracker)
      .where(eq(habitTracker.userId, ctx.session.user.id))
      .orderBy(desc(habitTracker.createdAt))
  }),
})
