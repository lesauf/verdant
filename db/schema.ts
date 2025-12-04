import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  areaHa: real("area_ha").notNull(),
  status: text("status").notNull(), // 'Fallow', 'Planted', 'Prep'
  geoJson: text("geo_json"), // Stored as JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull(), // 'Todo', 'In Progress', 'Done'
  blockId: text("block_id").references(() => blocks.id),
  assignedTo: text("assigned_to"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  isSynced: integer("is_synced", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
