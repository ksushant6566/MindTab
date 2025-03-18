import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const readingListsRouter = createTRPCRouter({
    sync: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                items: z.array(
                    z.object({
                        title: z.string(),
                        url: z.string().url(),
                        source: z.string(),
                        // Optional fields
                        description: z.string().optional(),
                        tags: z.array(z.string()).optional(),
                        dateAdded: z.string().optional(), // ISO date string
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Log the received data to the terminal
            console.log("Reading List Sync Request:");
            console.log("User ID:", input.userId);
            console.log("Items:", JSON.stringify(input.items, null, 2));

            // For now, we're just logging and not saving to the database
            return {
                success: true,
                message: `Successfully received reading list sync request for user ${input.userId} with ${input.items.length} items`,
                itemCount: input.items.length,
            };
        }),
});
