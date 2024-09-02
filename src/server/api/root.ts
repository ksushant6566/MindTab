import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { habitsRouter } from "./routers/habits";
import { habitTrackerRouter } from "./routers/habit-tracker";
import { goalsRouter } from "./routers/goals";
import { journalsRouter } from "./routers/journals";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  habits: habitsRouter,
  habitTracker: habitTrackerRouter,
  goals: goalsRouter,
  journals: journalsRouter,
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
