import { and, eq, isNull, not } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { projects, goals, journal } from "~/server/db/schema";
import {
    CreateProjectDto,
    UpdateProjectDto,
    GetProjectDto,
    GetProjectsDto,
    DeleteProjectDto,
    ArchiveProjectDto,
} from "../dtos/projects";

export const projectsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(CreateProjectDto)
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db
                .insert(projects)
                .values({
                    ...input,
                    createdBy: ctx.session.user.id,
                    lastUpdatedBy: ctx.session.user.id,
                })
                .returning();

            return project[0];
        }),

    update: protectedProcedure
        .input(UpdateProjectDto)
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            // Check if user owns or has access to the project
            const existingProject = await ctx.db.query.projects.findFirst({
                where: and(
                    eq(projects.id, id),
                    eq(projects.createdBy, ctx.session.user.id),
                    isNull(projects.deletedAt)
                ),
            });

            if (!existingProject) {
                throw new Error("Project not found or access denied");
            }

            const updatedProject = await ctx.db
                .update(projects)
                .set({
                    ...updateData,
                    lastUpdatedBy: ctx.session.user.id,
                    updatedAt: new Date(),
                })
                .where(eq(projects.id, id))
                .returning();

            return updatedProject[0];
        }),

    delete: protectedProcedure
        .input(DeleteProjectDto)
        .mutation(async ({ ctx, input }) => {
            // Check if user owns the project
            const existingProject = await ctx.db.query.projects.findFirst({
                where: and(
                    eq(projects.id, input.id),
                    eq(projects.createdBy, ctx.session.user.id),
                    isNull(projects.deletedAt)
                ),
            });

            if (!existingProject) {
                throw new Error("Project not found or access denied");
            }

            // Soft delete the project
            await ctx.db
                .update(projects)
                .set({
                    deletedAt: new Date(),
                    lastUpdatedBy: ctx.session.user.id,
                })
                .where(eq(projects.id, input.id));

            // Set project_id to null for all goals and journals in this project
            await ctx.db
                .update(goals)
                .set({ projectId: null })
                .where(eq(goals.projectId, input.id));

            await ctx.db
                .update(journal)
                .set({ projectId: null })
                .where(eq(journal.projectId, input.id));

            return { success: true };
        }),

    get: protectedProcedure
        .input(GetProjectDto)
        .query(async ({ ctx, input }) => {
            const project = await ctx.db.query.projects.findFirst({
                where: and(
                    eq(projects.id, input.id),
                    eq(projects.createdBy, ctx.session.user.id),
                    isNull(projects.deletedAt)
                ),
                with: {
                    goals: {
                        where: not(eq(goals.status, "archived")),
                        orderBy: (goals, { asc, desc }) => [
                            asc(goals.position),
                            asc(goals.priority),
                            desc(goals.createdAt),
                        ],
                    },
                },
            });

            if (!project) {
                throw new Error("Project not found or access denied");
            }

            return project;
        }),

    getAll: protectedProcedure
        .input(GetProjectsDto)
        .query(async ({ ctx, input }) => {
            const whereConditions = [
                eq(projects.createdBy, ctx.session.user.id),
                isNull(projects.deletedAt),
            ];

            if (!input?.includeArchived) {
                whereConditions.push(not(eq(projects.status, "archived")));
            }

            if (input?.status) {
                whereConditions.push(eq(projects.status, input.status));
            }

            return await ctx.db.query.projects.findMany({
                where: and(...whereConditions),
                with: {
                    goals: {
                        where: not(eq(goals.status, "archived")),
                    },
                },
                orderBy: (projects, { desc, asc }) => [
                    asc(projects.status),
                    desc(projects.createdAt),
                ],
            });
        }),

    archive: protectedProcedure
        .input(ArchiveProjectDto)
        .mutation(async ({ ctx, input }) => {
            // Check if user owns the project
            const existingProject = await ctx.db.query.projects.findFirst({
                where: and(
                    eq(projects.id, input.id),
                    eq(projects.createdBy, ctx.session.user.id),
                    isNull(projects.deletedAt)
                ),
            });

            if (!existingProject) {
                throw new Error("Project not found or access denied");
            }

            const archivedProject = await ctx.db
                .update(projects)
                .set({
                    status: "archived",
                    lastUpdatedBy: ctx.session.user.id,
                    updatedAt: new Date(),
                })
                .where(eq(projects.id, input.id))
                .returning();

            return archivedProject[0];
        }),

    // Get projects with goal counts for UI
    getWithStats: protectedProcedure
        .input(GetProjectsDto)
        .query(async ({ ctx, input }) => {
            const whereConditions = [
                eq(projects.createdBy, ctx.session.user.id),
                isNull(projects.deletedAt),
            ];

            if (!input?.includeArchived) {
                whereConditions.push(not(eq(projects.status, "archived")));
            }

            if (input?.status) {
                whereConditions.push(eq(projects.status, input.status));
            }

            const projectsWithGoals = await ctx.db.query.projects.findMany({
                where: and(...whereConditions),
                with: {
                    goals: {
                        where: not(eq(goals.status, "archived")),
                        columns: {
                            id: true,
                            status: true,
                        },
                    },
                    journals: {
                        columns: {
                            id: true,
                        },
                    },
                },
                orderBy: (projects, { asc }) => [
                    asc(projects.status),
                    asc(projects.createdAt),
                ],
            });

            // Add goal and journal statistics
            return projectsWithGoals.map((project) => ({
                ...project,
                goalStats: {
                    total: project.goals.length,
                    pending: project.goals.filter((g) => g.status === "pending")
                        .length,
                    inProgress: project.goals.filter(
                        (g) => g.status === "in_progress"
                    ).length,
                    completed: project.goals.filter(
                        (g) => g.status === "completed"
                    ).length,
                },
                journalStats: {
                    total: project.journals.length,
                },
            }));
        }),
});
