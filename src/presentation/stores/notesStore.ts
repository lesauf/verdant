import { desc, eq } from "drizzle-orm";
import * as Crypto from 'expo-crypto';
import { create } from "zustand";
import { db } from "../../data/sources/sqlite/client";
import { notes } from "../../data/sources/sqlite/schema";
import { Note, NoteType } from "../../domain/entities/Note";

interface NotesState {
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    loadNotes: () => Promise<void>;
    addNote: (title: string, type: NoteType) => Promise<string>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,

    loadNotes: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await db.select().from(notes)
                .where(eq(notes.isDeleted, false))
                .orderBy(desc(notes.updatedAt));

            const entities = result.map(r => new Note({
                id: r.id,
                title: r.title,
                type: r.type as NoteType,
                content: r.content || "",
                items: r.items ? JSON.parse(r.items) : [],
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                isDeleted: r.isDeleted
            }));

            set({ notes: entities, isLoading: false });
        } catch (error) {
            console.error("Failed to load notes:", error);
            set({ error: "Failed to load notes", isLoading: false });
        }
    },

    addNote: async (title: string, type: NoteType) => {
        const id = Crypto.randomUUID();
        const now = new Date();
        const newNote = {
            id,
            title,
            type,
            content: "",
            items: JSON.stringify([]),
            isDeleted: false,
            createdAt: now,
            updatedAt: now
        };

        try {
            await db.insert(notes).values(newNote);
            await get().loadNotes();
            return id;
        } catch (error) {
            console.error("Failed to add note:", error);
            set({ error: "Failed to add note" });
            throw error;
        }
    },

    updateNote: async (id: string, updates: Partial<Note>) => {
        try {
            const updateData: any = { updatedAt: new Date() };
            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.content !== undefined) updateData.content = updates.content;
            if (updates.items !== undefined) updateData.items = JSON.stringify(updates.items);

            await db.update(notes)
                .set(updateData)
                .where(eq(notes.id, id));
            
            await get().loadNotes();
        } catch (error) {
            console.error("Failed to update note:", error);
            set({ error: "Failed to update note" });
        }
    },

    deleteNote: async (id: string) => {
        try {
            await db.update(notes)
                .set({ isDeleted: true, updatedAt: new Date() })
                .where(eq(notes.id, id));
            await get().loadNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            set({ error: "Failed to delete note" });
        }
    }
}));
