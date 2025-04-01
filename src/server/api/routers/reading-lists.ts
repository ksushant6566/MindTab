import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { journal, journalTypeEnum } from "~/server/db/schema";
import * as cheerio from "cheerio";

export const readingListsRouter = createTRPCRouter({
    sync: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                items: z.array(
                    z.object({
                        title: z.string(),
                        url: z.string().url(),
                        hasBeenRead: z.boolean().optional(),
                        creationTime: z.number().optional(),
                        lastUpdateTime: z.number().optional(),
                    })
                ),
                metadata: z.object({
                    source: z.string(),
                    count: z.number(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // for each item, create a new journal entry
            for (const item of input.items) {
                const type = categorizeByURL(item.url);

                await ctx.db
                    .insert(journal)
                    .values({
                        title: item.title,
                        content: urlToContent(item.url),
                        userId: input.userId,
                        source: input.metadata.source,
                        type: type as (typeof journalTypeEnum.enumValues)[number],
                    })
                    .onConflictDoUpdate({
                        target: [journal.title, journal.userId],
                        set: {
                            content: urlToContent(item.url),
                            updatedAt: new Date(),
                        },
                    });
            }

            // For now, we're just logging and not saving to the database
            return {
                success: true,
                message: `Successfully received reading list sync request for user ${input.userId} with ${input.items.length} items`,
                itemCount: input.items.length,
            };
        }),
});

const urlToContent = (url: string) => {
    return `<p><a target="_blank" rel="noopener noreferrer" href="${url}?ref=mindtab.in">${url}</a></p>`;
};

/**
 * Heuristic approach to categorize URLs based on known patterns.
 */
function categorizeByURL(url: string): string {
    const videoDomains = ["youtube.com", "vimeo.com", "dailymotion.com"];
    const articleDomains = ["medium.com", "substack.com", "nytimes.com"];
    const podcastDomains = [
        "spotify.com",
        "apple.com/podcast",
        "pocketcasts.com",
    ];

    if (videoDomains.some((domain) => url.includes(domain))) {
        return "video";
    }
    if (articleDomains.some((domain) => url.includes(domain))) {
        return "article";
    }
    if (podcastDomains.some((domain) => url.includes(domain))) {
        return "podcast";
    }

    // Further checks on URL structure
    if (url.includes("watch?v=")) return "video";
    if (
        url.includes("/blog/") ||
        url.includes("/article/") ||
        url.includes("/news/")
    )
        return "article";
    if (url.includes("/podcast/") || url.includes("/episode/"))
        return "podcast";

    return "website";
}

/**
 * Fetch metadata from a webpage and categorize based on OpenGraph tags.
 */
async function categorizeByMetadata(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const ogType = $('meta[property="og:type"]').attr("content");

        if (ogType) {
            if (ogType.includes("video")) return "Video";
            if (ogType.includes("article")) return "Article";
            if (ogType.includes("music") || ogType.includes("audio"))
                return "Podcast";
        }

        return "Unknown";
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return "Unknown";
    }
}
