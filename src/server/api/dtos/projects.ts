import { z } from "zod";
import { projectStatusEnum } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projects } from "~/server/db/schema";

const ZInsertProject = createInsertSchema(projects);
const ZSelectProject = createSelectSchema(projects);

export const CreateProjectDto = ZInsertProject.omit({
    createdBy: true,
    lastUpdatedBy: true,
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export const UpdateProjectDto = CreateProjectDto.partial().extend({
    id: z.string().uuid(),
    status: z.enum(projectStatusEnum.enumValues).optional(),
});

export const GetProjectDto = z.object({
    id: z.string().uuid(),
});

export const GetProjectsDto = z
    .object({
        includeArchived: z.boolean().default(false).optional(),
        status: z.enum(projectStatusEnum.enumValues).optional(),
    })
    .optional();

export const DeleteProjectDto = z.object({
    id: z.string().uuid(),
});

export const ArchiveProjectDto = z.object({
    id: z.string().uuid(),
});

export type CreateProject = z.infer<typeof CreateProjectDto>;
export type UpdateProject = z.infer<typeof UpdateProjectDto>;
export type GetProject = z.infer<typeof GetProjectDto>;
export type GetProjects = z.infer<typeof GetProjectsDto>;
export type DeleteProject = z.infer<typeof DeleteProjectDto>;
export type ArchiveProject = z.infer<typeof ArchiveProjectDto>;

// Export the Zod schema for use in components
export { ZInsertProject, ZSelectProject };
