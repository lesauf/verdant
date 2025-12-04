import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../client";
import { blocks } from "../schema";

export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;

export const blockRepository = {
  getAll: async () => {
    return await db.select().from(blocks);
  },

  create: async (data: Omit<NewBlock, "id" | "createdAt" | "updatedAt">) => {
    const id = uuidv4();
    const now = new Date();
    const newBlock: NewBlock = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(blocks).values(newBlock);
    return newBlock;
  },

  delete: async (id: string) => {
    await db.delete(blocks).where(eq(blocks.id, id));
  },
};
