import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { journal as journals } from "~/server/db/schema";
import { CreateJournalDto, UpdateJournalDto } from "../dtos/journals";

export const journalsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateJournalDto)
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(journals).values({
                ...input,
                userId: ctx.session.user.id,
            });
        }),

    update: protectedProcedure
        .input(UpdateJournalDto)
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(journals)
                .set(input)
                .where(eq(journals.id, input.id));
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(journals).where(eq(journals.id, input.id));
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(journals)
                .where(eq(journals.id, input.id));
        }),

    getAll: protectedProcedure
        .input(z.object({ projectId: z.string().uuid().optional() }).optional())
        .query(async ({ ctx, input }) => {
            const whereConditions = [eq(journals.userId, ctx.session.user.id)];

            if (input?.projectId) {
                whereConditions.push(eq(journals.projectId, input.projectId));
            }

            return await ctx.db.query.journal.findMany({
                where: and(...whereConditions),
                with: {
                    project: {
                        columns: {
                            id: true,
                            name: true,
                            status: true,
                        },
                    },
                },
                orderBy: (journals, { desc }) => [desc(journals.updatedAt)],
            });
        }),

    search: protectedProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(journals)
                .where(
                    and(
                        eq(journals.userId, ctx.session.user.id),
                        ilike(journals.title, `%${input.query}%`)
                    )
                )
                .limit(5);
        }),

    getCount: protectedProcedure.query(async ({ ctx }) => {
        const result = await ctx.db
            .select({
                count: sql<number>`count(*)`,
            })
            .from(journals)
            .where(eq(journals.userId, ctx.session.user.id));

        return result[0]?.count ?? 0;
    }),
});
