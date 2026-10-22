import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

/** Answers collected once by the intake wizard; every tool reads from this. */
export interface Intake {
  idea: string;
  skills: string;
  interests: string;
  budget: string;
  hours: string;
  location: string;
  customer: string;
  tone: string;
}

export const businesses = sqliteTable(
  "businesses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull().default("Untitled business"),
    intake: text("intake", { mode: "json" }).$type<Intake>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("businesses_user_idx").on(t.userId)],
);

/** One row per (business, tool). `content` is the tool's structured output. */
export const assets = sqliteTable(
  "assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    businessId: integer("business_id").notNull(),
    tool: text("tool").notNull(),
    status: text("status", { enum: ["idle", "running", "done", "error"] })
      .notNull()
      .default("idle"),
    content: text("content", { mode: "json" }).$type<Record<string, unknown> | null>(),
    error: text("error"),
    version: integer("version").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("assets_business_tool_idx").on(t.businessId, t.tool)],
);

export const leads = sqliteTable(
  "leads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    businessId: integer("business_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message"),
    source: text("source").notNull().default("manual"),
    status: text("status", { enum: ["new", "contacted", "qualified", "won", "lost"] })
      .notNull()
      .default("new"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("leads_business_idx").on(t.businessId)],
);

export const generationLog = sqliteTable("generation_log", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: text("user_id").notNull(),
  businessId: integer("business_id").notNull(), tool: text("tool").notNull(), error: text("error").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
export const supportMessages = sqliteTable("support_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(),
  email: text("email").notNull(), message: text("message").notNull(),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
export const notifications = sqliteTable("notifications", {
  key: text("key").primaryKey(), status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
export const adminAudit = sqliteTable("admin_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }), actor: text("actor").notNull(),
  userId: text("user_id").notNull(), planId: text("plan_id").notNull(), action: text("action").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
