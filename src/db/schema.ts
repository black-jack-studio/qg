import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// appId null = « Général » : rattaché à aucune app (compte Apple Developer, abonnement Claude…).

export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("📱"),
  color: text("color").notNull().default("blue"),
  status: text("status").notNull().default("dev"),
  description: text("description").notNull().default(""),
  platforms: text("platforms").notNull().default(""),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  details: text("details").notNull().default(""),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("normale"),
  assignee: text("assignee"),
  dueDate: text("due_date"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id, { onDelete: "cascade" }),
  service: text("service").notNull(),
  url: text("url").notNull().default(""),
  username: text("username").notNull().default(""),
  password: text("password").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull().default("autre"),
  url: text("url").notNull().default(""),
  plan: text("plan").notNull().default(""),
  monthlyCostCents: integer("monthly_cost_cents").notNull().default(0),
  account: text("account").notNull().default(""),
  // Qui paie l'abonnement : "commun", "stan" ou "anat".
  payer: text("payer").notNull().default("commun"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  pinned: boolean("pinned").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").references(() => apps.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type App = typeof apps.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Link = typeof links.$inferSelect;
