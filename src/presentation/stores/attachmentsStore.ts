import * as Crypto from 'expo-crypto';
import * as FileSystem from "expo-file-system/legacy";
import { create } from "zustand";
import { AttachmentRepository } from "../../data/repositories/firebase/AttachmentRepository";

const attachmentRepo = new AttachmentRepository();

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
            set({ isLoading: true });
            const result = await attachmentRepo.findByTaskId(taskId);

            const entities: Attachment[] = result.map(r => ({
                id: r.id,
                taskId: r.taskId,
                type: r.type,
                uri: r.uri,
                createdAt: r.createdAt.toDate()
            }));

            set(state => ({
                attachments: { ...state.attachments, [taskId]: entities },
                isLoading: false
            }));
        } catch (error) {
            console.error("Failed to load attachments:", error);
            set({ error: "Failed to load attachments", isLoading: false });
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

            // Save to Firebase
            await attachmentRepo.save({
                id,
                taskId,
                type: 'IMAGE',
                uri: permanentUri,
                createdAt: new Date()
            });

            await get().loadAttachments(taskId);

        } catch (error) {
            console.error("Failed to add attachment:", error);
            set({ error: "Failed to add attachment" });
            throw error;
        }
    },

    deleteAttachment: async (id: string, uri: string) => {
        try {
            // Delete from Firebase
            await attachmentRepo.delete(id);

            // Delete file
            await FileSystem.deleteAsync(uri, { idempotent: true });

            // Note: We don't have taskId here to reload easily, 
            // but the UI usually handles this by filtering the local state or reloading the task view.
            // For now, we'll just keep it simple as the previous implementation did.
        } catch (error) {
            console.error("Failed to delete attachment:", error);
            set({ error: "Failed to delete attachment" });
        }
    }
}));

