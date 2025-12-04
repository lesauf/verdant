import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../client";
import { tasks } from "../schema";

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const taskRepository = {
  getAll: async () => {
    return await db.select().from(tasks);
  },

  create: async (data: Omit<NewTask, "id" | "createdAt" | "isSynced">) => {
    const id = uuidv4();
    const now = new Date();
    const newTask: NewTask = {
      id,
      ...data,
      isSynced: false,
      createdAt: now,
    };
    await db.insert(tasks).values(newTask);
    return newTask;
  },

  delete: async (id: string) => {
    await db.delete(tasks).where(eq(tasks.id, id));
  },
};
