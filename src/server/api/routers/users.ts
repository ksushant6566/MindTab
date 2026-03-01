import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
        const result = await ctx.db
            .select()
            .from(users)
            .where(eq(users.id, ctx.session.user.id));

        if (result.length === 0) {
            return null;
        }

        return result[0]!;
    }),
    getByEmail: protectedProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ ctx, input }) => {
            let result = await ctx.db
                .select()
                .from(users)
                .where(eq(users.email, input.email));

            if (result.length === 0) {
                return null;
            }
            const user = result[0]!;
            return user;
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, input.id));

            if (result.length === 0) {
                return null;
            }

            const user = result[0]!;
            return user;
        }),

    updateXP: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                xpToAdd: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.id, input.userId),
            });

            if (!user) {
                throw new Error("User not found");
            }

            const updatedUser = await ctx.db
                .update(users)
                .set({
                    xp: (user.xp ?? 0) + input.xpToAdd,
                })
                .where(eq(users.id, input.userId))
                .returning();

            return updatedUser[0];
        }),

    completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
        await ctx.db
            .update(users)
            .set({ onboardingCompleted: true })
            .where(eq(users.id, ctx.session.user.id));
        return { success: true };
    }),
});
