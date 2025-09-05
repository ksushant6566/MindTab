import { and, asc, desc, eq, ilike, inArray, not, isNull } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
    goals,
    goalPriorityEnum,
    goalImpactEnum,
    goalCategoryEnum,
    goalTypeEnum,
} from "~/server/db/schema";
import {
    CreateGoalDto,
    UpdateGoalDto,
    UpdateGoalPositionsDto,
    GetGoalsDto,
} from "../dtos/goals";
import { db } from "~/server/db";

type updateGoalStatusParams = {
    id: string;
    position: number;
    title?: string;
    description?: string;
    priority?: (typeof goalPriorityEnum.enumValues)[number];
    impact?: (typeof goalImpactEnum.enumValues)[number];
    category?: (typeof goalCategoryEnum.enumValues)[number];
    type?: (typeof goalTypeEnum.enumValues)[number];
    projectId?: string | null;
    executor?: typeof db;
};

async function setGoalCompleted({
    id,
    position,
    title,
    description,
    priority,
    impact,
    category,
    type,
    projectId,
    executor = db,
}: updateGoalStatusParams) {
    console.log("setGoalCompleted called with:", {
        id,
        position,
        isTransaction: executor !== db,
    });

    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    console.log("Updating goal:", {
        id,
        position,
        status: "completed",
    });

    // Create update object with required fields
    const updateData: Record<string, unknown> = {
        completedAt: new Date(),
        status: "completed",
        position,
    };

    // Only add fields that are defined
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (impact !== undefined) updateData.impact = impact;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (projectId !== undefined) updateData.projectId = projectId;

    await executor.update(goals).set(updateData).where(eq(goals.id, id));

    return goal;
}

async function setGoalInprogress({
    id,
    position,
    title,
    description,
    priority,
    impact,
    category,
    type,
    projectId,
    executor = db,
}: updateGoalStatusParams) {
    console.log("setGoalInprogress", id, position);
    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    // Create update object with required fields
    const updateData: Record<string, unknown> = {
        status: "in_progress",
        position,
    };

    // Only add fields that are defined
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (impact !== undefined) updateData.impact = impact;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (projectId !== undefined) updateData.projectId = projectId;

    await executor.update(goals).set(updateData).where(eq(goals.id, id));

    return goal;
}

async function setGoalPending({
    id,
    position,
    title,
    description,
    priority,
    impact,
    category,
    type,
    projectId,
    executor = db,
}: updateGoalStatusParams) {
    console.log("setGoalPending", id, position);

    const goal = await executor.query.goals.findFirst({
        where: eq(goals.id, id),
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    // Create update object with required fields
    const updateData: Record<string, unknown> = {
        status: "pending",
        position,
    };

    // Only add fields that are defined
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (impact !== undefined) updateData.impact = impact;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (projectId !== undefined) updateData.projectId = projectId;

    await executor.update(goals).set(updateData).where(eq(goals.id, id));

    return goal;
}

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
            const goal = await ctx.db.query.goals.findFirst({
                where: eq(goals.id, input.id),
            });

            if (!goal) {
                throw new Error("Goal not found");
            }

            if (input.status === "completed") {
                await setGoalCompleted({
                    id: input.id,
                    position: input.position ?? goal.position,
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    impact: input.impact,
                    category: input.category,
                    type: input.type,
                    projectId: input.projectId,
                });
            } else if (input.status === "in_progress") {
                await setGoalInprogress({
                    id: input.id,
                    position: input.position ?? goal.position,
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    impact: input.impact,
                    category: input.category,
                    type: input.type,
                    projectId: input.projectId,
                });
            } else if (input.status === "pending") {
                await setGoalPending({
                    id: input.id,
                    position: input.position ?? goal.position,
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    impact: input.impact,
                    category: input.category,
                    type: input.type,
                    projectId: input.projectId,
                });
            } else {
                // Handle updates without status change (e.g., just updating project assignment or other fields)
                const updateData: Record<string, unknown> = {};

                // Only add fields that are defined
                if (input.title !== undefined) updateData.title = input.title;
                if (input.description !== undefined)
                    updateData.description = input.description;
                if (input.priority !== undefined)
                    updateData.priority = input.priority;
                if (input.impact !== undefined)
                    updateData.impact = input.impact;
                if (input.category !== undefined)
                    updateData.category = input.category;
                if (input.type !== undefined) updateData.type = input.type;
                if (input.projectId !== undefined)
                    updateData.projectId = input.projectId;
                if (input.position !== undefined)
                    updateData.position = input.position;

                // Only update if there are fields to update
                if (Object.keys(updateData).length > 0) {
                    await ctx.db
                        .update(goals)
                        .set(updateData)
                        .where(eq(goals.id, input.id));
                }
            }
        }),

    updatePositions: protectedProcedure
        .input(UpdateGoalPositionsDto)
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.db.transaction(async (tx) => {
                    const goalIds = input.goals.map((g) => g.id);
                    const existingGoals = await tx
                        .select()
                        .from(goals)
                        .where(inArray(goals.id, goalIds));
                    const goalMap = new Map(
                        existingGoals.map((g) => [g.id, g])
                    );

                    // Batch update all goals
                    for (const goal of input.goals) {
                        const updateData: Record<string, unknown> = {
                            status: goal.status,
                            position: goal.position,
                        };

                        // Set completedAt only when status is completed
                        if (goal.status === "completed") {
                            updateData.completedAt = new Date();
                        } else if (goal.status === "archived") {
                            // Keep the completedAt date when archiving
                            const existingGoal = goalMap.get(goal.id);
                            if (existingGoal && existingGoal.completedAt) {
                                updateData.completedAt =
                                    existingGoal.completedAt;
                            }
                        } else {
                            // Clear completedAt for other statuses
                            updateData.completedAt = null;
                        }

                        await tx
                            .update(goals)
                            .set(updateData)
                            .where(eq(goals.id, goal.id));
                    }
                });
                return { success: true, sequence: input.sequence };
            } catch (error) {
                console.error("Transaction failed:", error);
                return { success: false, error };
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(goals).where(eq(goals.id, input.id));
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(goals)
                .where(eq(goals.id, input.id));
        }),

    getAll: protectedProcedure
        .input(GetGoalsDto)
        .query(async ({ ctx, input }) => {
            const whereConditions = [
                eq(goals.userId, input?.userId ?? ctx.session.user.id),
            ];

            // Filter out archived goals unless explicitly requested
            if (!input?.includeArchived) {
                whereConditions.push(not(eq(goals.status, "archived")));
            }

            // Filter by project if specified
            if (input?.projectId) {
                whereConditions.push(eq(goals.projectId, input.projectId));
            }

            return await ctx.db.query.goals.findMany({
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
                orderBy: [
                    asc(goals.position),
                    asc(goals.priority),
                    desc(goals.createdAt),
                ],
            });
        }),

    search: protectedProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, ctx.session.user.id),
                        ilike(goals.title, `%${input.query}%`)
                    )
                )
                .limit(5);
        }),

    getUnassigned: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.query.goals.findMany({
            where: and(
                eq(goals.userId, ctx.session.user.id),
                not(eq(goals.status, "archived")),
                // Goals without project assignment
                isNull(goals.projectId)
            ),
            orderBy: [
                asc(goals.position),
                asc(goals.priority),
                desc(goals.createdAt),
            ],
        });
    }),

    archiveCompleted: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            // Get all completed goals for the user
            const completedGoals = await ctx.db
                .select()
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, ctx.session.user.id),
                        eq(goals.status, "completed")
                    )
                );

            if (completedGoals.length === 0) {
                return { success: true, count: 0 };
            }

            // Update all completed goals to archived status
            await ctx.db
                .update(goals)
                .set({
                    status: "archived",
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(goals.userId, ctx.session.user.id),
                        eq(goals.status, "completed")
                    )
                );

            return { success: true, count: completedGoals.length };
        } catch (error) {
            console.error("Failed to archive completed goals:", error);
            return { success: false, error };
        }
    }),
});
