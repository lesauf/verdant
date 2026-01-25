import { desc, eq } from "drizzle-orm";
import * as Crypto from 'expo-crypto';
import * as FileSystem from "expo-file-system/legacy";
import { create } from "zustand";
import { db } from "../../data/sources/sqlite/client";
import { attachments } from "../../data/sources/sqlite/schema";

export interface Attachment {
    id: string;
    taskId: string;
    type: string;
    uri: string;
    createdAt: Date;
}

interface AttachmentsState {
    attachments: Record<string, Attachment[]>; // taskId -> attachments
    isLoading: boolean;
    error: string | null;
    loadAttachments: (taskId: string) => Promise<void>;
    addAttachment: (taskId: string, originalUri: string) => Promise<void>;
    deleteAttachment: (id: string, uri: string) => Promise<void>;
}

export const useAttachmentsStore = create<AttachmentsState>((set, get) => ({
    attachments: {},
    isLoading: false,
    error: null,

    loadAttachments: async (taskId: string) => {
        try {
            const result = await db.select().from(attachments)
                .where(eq(attachments.taskId, taskId))
                .orderBy(desc(attachments.createdAt));

            const entities = result.map(r => ({
                id: r.id,
                taskId: r.taskId,
                type: r.type,
                uri: r.uri,
                createdAt: r.createdAt
            }));

            set(state => ({
                attachments: { ...state.attachments, [taskId]: entities }
            }));
        } catch (error) {
            console.error("Failed to load attachments:", error);
        }
    },

    addAttachment: async (taskId: string, originalUri: string) => {
        const id = Crypto.randomUUID();
        const filename = `${id}.jpg`;
        const permanentDir = `${FileSystem.documentDirectory}attachments/`;
        const permanentUri = `${permanentDir}${filename}`;

        try {
            // Ensure directory exists
            const dirInfo = await FileSystem.getInfoAsync(permanentDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(permanentDir, { intermediates: true });
            }

            // Copy file
            await FileSystem.copyAsync({
                from: originalUri,
                to: permanentUri
            });

            // Save to DB
            const newAttachment = {
                id,
                taskId,
                type: 'IMAGE',
                uri: permanentUri, // Storing full path for simplicity now, but could be relative
                createdAt: new Date()
            };

            await db.insert(attachments).values(newAttachment);
            await get().loadAttachments(taskId);

        } catch (error) {
            console.error("Failed to add attachment:", error);
            set({ error: "Failed to add attachment" });
            throw error;
        }
    },

    deleteAttachment: async (id: string, uri: string) => {
        try {
            // Delete from DB
            await db.delete(attachments).where(eq(attachments.id, id));

            // Delete file
            await FileSystem.deleteAsync(uri, { idempotent: true });

            // Reload
        } catch (error) {
            console.error("Failed to delete attachment:", error);
            set({ error: "Failed to delete attachment" });
        }
    }
}));
