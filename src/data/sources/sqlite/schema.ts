import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  areaHa: real("area_ha").notNull(),
  status: text("status").notNull(), // 'Fallow', 'Planted', 'Prep'
  geoJson: text("geo_json"), // Stored as JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp" }), // For offline-first sync
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false), // Soft delete for sync
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"), // Added description field
  status: text("status").notNull(), // 'Todo', 'In Progress', 'Done'
  blockId: text("block_id").references(() => blocks.id),
  assignedTo: text("assigned_to"),
  startDate: integer("start_date", { mode: "timestamp" }), // Added start date
  dueDate: integer("due_date", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(), // Added updated at
  syncedAt: integer("synced_at", { mode: "timestamp" }), // For offline-first sync
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false), // Soft delete for sync
});
