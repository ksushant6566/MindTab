import { relations, sql } from "drizzle-orm";
import {
    date,
    index,
    integer,
    pgEnum,
    pgTableCreator,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mindmap_${name}`);

export const goalStatusEnum = pgEnum("goal_status", [
    "pending",
    "in_progress",
    "completed",
    "archived",
]);

export const goalPriorityEnum = pgEnum("goal_priority", [
    "priority_1",
    "priority_2",
    "priority_3",
    "priority_4",
]);

export const goalImpactEnum = pgEnum("goal_impact", ["low", "medium", "high"]);

export const goals = createTable(
    "goal",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 256 }),
        description: text("description"),
        status: goalStatusEnum("status").default("pending").notNull(),
        priority: goalPriorityEnum("priority")
            .default(goalPriorityEnum.enumValues[0])
            .notNull(),
        impact: goalImpactEnum("impact").default("medium").notNull(),
        position: integer("position").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
        projectId: uuid("project_id").references(() => projects.id, {
            onDelete: "set null",
        }),
    },
    (goal) => ({
        userIdIdx: index("goal_user_id_idx").on(goal.userId),
        positionIdx: index("goal_position_idx").on(goal.position),
        projectIdIdx: index("goal_project_id_idx").on(goal.projectId),
    })
);

export const goalsRelations = relations(goals, ({ one, many }) => ({
    user: one(users, { fields: [goals.userId], references: [users.id] }),
    project: one(projects, {
        fields: [goals.projectId],
        references: [projects.id],
    }),
    journalGoals: many(journalGoals),
}));

export const habitFrequencyEnum = pgEnum("habit_frequency", [
    "daily",
    "weekly",
]);

export const habits = createTable(
    "habit",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 256 }),
        description: text("description"),
        frequency: habitFrequencyEnum("frequency").default("daily").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
    },
    (habit) => ({
        userTitleIndex: uniqueIndex("habit_title_user_id_unique_idx").on(
            habit.userId,
            habit.title
        ),
        userIdIdx: index("habit_user_id_idx").on(habit.userId),
    })
);

export const habitTrackerEnum = pgEnum("habit_tracker", [
    "daily",
    "weekly",
    "monthly",
]);

export const habitTrackerStatusEnum = pgEnum("habit_tracker_status", [
    "pending",
    "completed",
]);

export const habitTracker = createTable(
    "habit_tracker",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        habitId: uuid("habit_id")
            .notNull()
            .references(() => habits.id, { onDelete: "cascade" }),
        status: habitTrackerStatusEnum("status").default("pending").notNull(),
        date: date("date").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
    },
    (habitTracker) => ({
        habitIdUserIdIdx: index("habit_tracker_habit_id_user_id_idx").on(
            habitTracker.habitId,
            habitTracker.userId
        ),
        habitIdUserIdDateIdx: uniqueIndex(
            "habit_tracker_habit_id_user_id_date_idx"
        ).on(habitTracker.habitId, habitTracker.userId, habitTracker.date),
    })
);

export const habitTrackerRelations = relations(habitTracker, ({ one }) => ({
    habit: one(habits, {
        fields: [habitTracker.habitId],
        references: [habits.id],
    }),
    user: one(users, { fields: [habitTracker.userId], references: [users.id] }),
}));

export const journalTypeEnum = pgEnum("journal_type", [
    "article",
    "book",
    "video",
    "podcast",
    "website",
]);

export const journal = createTable(
    "journal",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 256 }).notNull(),
        content: text("content").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
        type: journalTypeEnum("type").default("article").notNull(),
        source: varchar("source", { length: 256 }).notNull().default("mindmap"),
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
        projectId: uuid("project_id").references(() => projects.id, {
            onDelete: "set null",
        }),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
        archivedAt: timestamp("archived_at", { withTimezone: true }),
    },
    (journal) => ({
        userTitleIndex: uniqueIndex("journal_title_user_id_unique_idx").on(
            journal.userId,
            journal.title
        ),
        userIdIdx: index("journal_user_id_idx").on(journal.userId),
        projectIdIdx: index("journal_project_id_idx").on(journal.projectId),
    })
);

export const journalRelations = relations(journal, ({ one, many }) => ({
    user: one(users, { fields: [journal.userId], references: [users.id] }),
    project: one(projects, {
        fields: [journal.projectId],
        references: [projects.id],
    }),
    journalGoals: many(journalGoals),
    journalHabits: many(journalHabits),
}));

export const journalGoals = createTable(
    "journal_goal",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        journalId: uuid("journal_id")
            .notNull()
            .references(() => journal.id, { onDelete: "cascade" }),
        goalId: uuid("goal_id")
            .notNull()
            .references(() => goals.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
    },
    (journalGoal) => ({
        journalIdIdx: index("journal_goal_journal_id_idx").on(
            journalGoal.journalId
        ),
        goalIdIdx: index("journal_goal_goal_id_idx").on(journalGoal.goalId),
        journalGoalIdx: uniqueIndex("journal_goal_idx").on(
            journalGoal.journalId,
            journalGoal.goalId
        ),
    })
);

export const journalGoalRelations = relations(journalGoals, ({ one }) => ({
    journal: one(journal, {
        fields: [journalGoals.journalId],
        references: [journal.id],
    }),
    goal: one(goals, {
        fields: [journalGoals.goalId],
        references: [goals.id],
    }),
}));

// New junction table for the many-to-many relation between journals and habits
export const journalHabits = createTable(
    "journal_habits",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        journalId: uuid("journal_id")
            .notNull()
            .references(() => journal.id, { onDelete: "cascade" }),
        habitId: uuid("habit_id")
            .notNull()
            .references(() => habits.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
    },
    (journalHabits) => ({
        journalHabitIdx: uniqueIndex("journal_habit_idx").on(
            journalHabits.journalId,
            journalHabits.habitId
        ),
        journalIdIdx: index("journal_habits_journal_id_idx").on(
            journalHabits.journalId
        ),
        habitIdIdx: index("journal_habits_habit_id_idx").on(
            journalHabits.habitId
        ),
    })
);

export const journalHabitsRelations = relations(journalHabits, ({ one }) => ({
    journal: one(journal, {
        fields: [journalHabits.journalId],
        references: [journal.id],
    }),
    habit: one(habits, {
        fields: [journalHabits.habitId],
        references: [habits.id],
    }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
    user: one(users, { fields: [habits.userId], references: [users.id] }),
    journalHabits: many(journalHabits),
}));

export const projectStatusEnum = pgEnum("project_status", [
    "active",
    "paused",
    "completed",
    "archived",
]);

export const projects = createTable(
    "project",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 256 }),
        description: text("description"),
        status: projectStatusEnum("status").default("active").notNull(),
        startDate: date("start_date").notNull(),
        endDate: date("end_date"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
        createdBy: varchar("created_by", { length: 255 })
            .notNull()
            .references(() => users.id),
        lastUpdatedBy: varchar("last_updated_by", { length: 255 })
            .notNull()
            .references(() => users.id),
        deletedAt: timestamp("deleted_at", { withTimezone: true }),
    },
    (project) => ({
        createdByIdx: index("project_created_by_idx").on(project.createdBy),
        lastUpdatedByIdx: index("project_last_updated_by_idx").on(
            project.lastUpdatedBy
        ),
        statusIdx: index("project_status_idx").on(project.status),
    })
);

export const projectRelations = relations(projects, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [projects.createdBy],
        references: [users.id],
    }),
    lastUpdatedBy: one(users, {
        fields: [projects.lastUpdatedBy],
        references: [users.id],
    }),
    goals: many(goals),
    journals: many(journal),
}));

/*{
white space



























white space
}*/

export const users = createTable("user", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified", {
        mode: "date",
        withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
    xp: integer("xp").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
}));

export const accounts = createTable(
    "account",
    {
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
        type: varchar("type", { length: 255 })
            .$type<AdapterAccount["type"]>()
            .notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("provider_account_id", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index("account_user_id_idx").on(account.userId),
    })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    "session",
    {
        sessionToken: varchar("session_token", { length: 255 })
            .notNull()
            .primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
        expires: timestamp("expires", {
            mode: "date",
            withTimezone: true,
        }).notNull(),
    },
    (session) => ({
        userIdIdx: index("session_user_id_idx").on(session.userId),
    })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    "verification_token",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", {
            mode: "date",
            withTimezone: true,
        }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);
