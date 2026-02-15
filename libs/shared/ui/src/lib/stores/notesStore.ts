import { create } from "zustand";
import { Note, NoteType } from "domain/entities/Note";
import { getContainer } from "infrastructure/di/container";

interface NotesState {
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    loadNotes: (farmId: string) => Promise<void>;
    addNote: (farmId: string, title: string, type: NoteType) => Promise<string>;
    updateNote: (farmId: string, id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (farmId: string, id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,

    loadNotes: async (farmId: string) => {
        set({ isLoading: true, error: null });
        try {
            const container = getContainer();
            const getAllNotesUseCase = container.resolve('getAllNotesUseCase');
            const entities = await getAllNotesUseCase.execute(farmId);
            set({ notes: entities, isLoading: false });
        } catch (error) {
            console.error("Failed to load notes:", error);
            set({ error: "Failed to load notes", isLoading: false });
        }
    },

    addNote: async (farmId: string, title: string, type: NoteType) => {
        try {
            const container = getContainer();
            const createNoteUseCase = container.resolve('createNoteUseCase');
            const id = await createNoteUseCase.execute({ title, farmId, type });
            await get().loadNotes(farmId);
            return id;
        } catch (error) {
            console.error("Failed to add note:", error);
            set({ error: "Failed to add note" });
            throw error;
        }
    },

    updateNote: async (farmId: string, id: string, updates: Partial<Note>) => {
        try {
            const container = getContainer();
            const updateNoteUseCase = container.resolve('updateNoteUseCase');
            await updateNoteUseCase.execute(farmId, id, updates);
            await get().loadNotes(farmId);
        } catch (error) {
            console.error("Failed to update note:", error);
            set({ error: "Failed to update note" });
        }
    },

    deleteNote: async (farmId: string, id: string) => {
        try {
            const container = getContainer();
            const deleteNoteUseCase = container.resolve('deleteNoteUseCase');
            await deleteNoteUseCase.execute(farmId, id);
            await get().loadNotes(farmId);
        } catch (error) {
            console.error("Failed to delete note:", error);
            set({ error: "Failed to delete note" });
        }
    }
}));
