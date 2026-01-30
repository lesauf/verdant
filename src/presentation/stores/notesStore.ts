import { create } from "zustand";
import { Note, NoteType } from "../../domain/entities/Note";
import { getContainer } from "../../infrastructure/di/container";

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
            const container = getContainer();
            const getAllNotesUseCase = container.resolve('getAllNotesUseCase');
            const entities = await getAllNotesUseCase.execute();
            set({ notes: entities, isLoading: false });
        } catch (error) {
            console.error("Failed to load notes:", error);
            set({ error: "Failed to load notes", isLoading: false });
        }
    },

    addNote: async (title: string, type: NoteType) => {
        try {
            const container = getContainer();
            const createNoteUseCase = container.resolve('createNoteUseCase');
            const id = await createNoteUseCase.execute({ title, type });
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
            const container = getContainer();
            const updateNoteUseCase = container.resolve('updateNoteUseCase');
            await updateNoteUseCase.execute(id, updates);
            await get().loadNotes();
        } catch (error) {
            console.error("Failed to update note:", error);
            set({ error: "Failed to update note" });
        }
    },

    deleteNote: async (id: string) => {
        try {
            const container = getContainer();
            const deleteNoteUseCase = container.resolve('deleteNoteUseCase');
            await deleteNoteUseCase.execute(id);
            await get().loadNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            set({ error: "Failed to delete note" });
        }
    }
}));
