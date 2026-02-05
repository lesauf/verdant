import * as Crypto from 'expo-crypto';
import { create } from "zustand";
import { AttachmentRepository } from "../../data/repositories/firebase/AttachmentRepository";
import { firebaseStorage } from "../../infrastructure/config/firebase";

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
    deleteAttachment: (id: string, uri: string, taskId: string) => Promise<void>;
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

        try {
            // Upload to Firebase Storage using RNFirebase API
            const storageRef = firebaseStorage.ref(`attachments/${taskId}/${filename}`);
            
            // Use putFile for native file upload (better performance than Blob)
            await storageRef.putFile(originalUri);
            
            const downloadUrl = await storageRef.getDownloadURL();

            // Save to Firestore with download URL
            await attachmentRepo.save({
                id,
                taskId,
                type: 'IMAGE',
                uri: downloadUrl,
                createdAt: new Date()
            });

            await get().loadAttachments(taskId);

        } catch (error) {
            console.error("Failed to add attachment:", error);
            set({ error: "Failed to add attachment" });
            throw error;
        }
    },

    deleteAttachment: async (id: string, uri: string, taskId: string) => {
        try {
            // Delete from Firestore first
            await attachmentRepo.delete(id);

            // Delete from Firebase Storage if it's a storage URL
            if (uri.startsWith('http') && uri.includes('firebasestorage')) {
                // Construct ref from URL or path
                // We stored it at attachments/taskId/id.jpg
                const storageRef = firebaseStorage.ref(`attachments/${taskId}/${id}.jpg`);
                await storageRef.delete().catch(e => console.warn("Failed to delete format storage object", e));
            }

            // Update local state by optimistic update
            const current = get().attachments[taskId] || [];
            set(state => ({
                attachments: {
                    ...state.attachments,
                    [taskId]: current.filter(a => a.id !== id)
                }
            }));

        } catch (error) {
            console.error("Failed to delete attachment:", error);
            set({ error: "Failed to delete attachment" });
        }
    }
}));

