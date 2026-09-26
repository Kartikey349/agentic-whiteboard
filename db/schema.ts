import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  projectId: varchar("projectId").notNull().unique(),

  projectName: varchar("project_name").notNull(),

  userEmail: varchar("userEmail").notNull(),

  isArchived: boolean("is_archived").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const WhiteboardData = pgTable("whiteboardData", {
  id: serial("id").primaryKey(),
  projectId: varchar("projectId").notNull().unique().references(() => projects.projectId),
  elements: jsonb("elements"),
  appState: jsonb("appState"),
  files: jsonb("files"),
  updateAt: timestamp("updated_at").defaultNow().notNull()
})

export const projectShares = pgTable("project_shares", {
  id: serial("id").primaryKey(),

  projectId: varchar("project_id")
    .notNull()
    .unique()
    .references(() => projects.projectId, {
      onDelete: "cascade",
    }),

  shareToken: varchar("share_token")
    .notNull()
    .unique(),

  isActive: boolean("is_active")
    .default(false)
    .notNull(),

  permission: varchar("permission")
    .default("view")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
