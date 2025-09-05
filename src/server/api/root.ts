import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { goalsRouter } from "./routers/goals";
import { habitTrackerRouter } from "./routers/habit-tracker";
import { habitsRouter } from "./routers/habits";
import { journalsRouter } from "./routers/journals";
import { usersRouter } from "./routers/users";
import { activityRouter } from "./routers/activity";
import { readingListsRouter } from "./routers/reading-lists";
import { bookmarksRouter } from "./routers/bookmarks";
import { projectsRouter } from "./routers/projects";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    habits: habitsRouter,
    habitTracker: habitTrackerRouter,
    goals: goalsRouter,
    projects: projectsRouter,
    journals: journalsRouter,
    users: usersRouter,
    activity: activityRouter,
    readingLists: readingListsRouter,
    bookmarks: bookmarksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
