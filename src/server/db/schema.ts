import { relations, sql } from "drizzle-orm";
import {
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
]);

export const goalPriorityEnum = pgEnum("goal_priority", [
  "priority_1",
  "priority_2",
  "priority_3",
  "priority_4",
]);

export const goalImpactEnum = pgEnum("goal_impact", ["low", "medium", "high"]);

export const goalCategoryEnum = pgEnum("goal_category", [
  "health",
  "finance",
  "career",
  "relationships",
  "personal",
  "work",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "one_time",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

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
    category: goalCategoryEnum("category").default("health").notNull(),
    type: goalTypeEnum("type").default("one_time").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (goal) => ({
    userTitleIndex: uniqueIndex("goal_title_user_id_unique_idx").on(
      goal.userId,
      goal.title,
    ),
    userIdIdx: index("goal_user_id_idx").on(goal.userId),
  }),
);

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
      () => new Date(),
    ),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (habit) => ({
    userTitleIndex: uniqueIndex("habit_title_user_id_unique_idx").on(
      habit.userId,
      habit.title,
    ),
    userIdIdx: index("habit_user_id_idx").on(habit.userId),
  }),
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
      .references(() => habits.id),
    status: habitTrackerStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (habitTracker) => ({
    habitIdUserIdIdx: index("habit_tracker_habit_id_user_id_idx").on(
      habitTracker.habitId,
      habitTracker.userId,
    ),
  }),
);

export const habitTrackerRelations = relations(habitTracker, ({ one }) => ({
  habit: one(habits, {
    fields: [habitTracker.habitId],
    references: [habits.id],
  }),
  user: one(users, { fields: [habitTracker.userId], references: [users.id] }),
}));

export const journal = createTable(
  "journal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 256 }),
    content: text("content"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (journal) => ({
    userTitleIndex: uniqueIndex("journal_title_user_id_unique_idx").on(
      journal.userId,
      journal.title,
    ),
    userIdIdx: index("journal_user_id_idx").on(journal.userId),
  }),
);

export const journalRelations = relations(journal, ({ one }) => ({
  user: one(users, { fields: [journal.userId], references: [users.id] }),
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
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
  }),
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
  }),
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
  }),
);
