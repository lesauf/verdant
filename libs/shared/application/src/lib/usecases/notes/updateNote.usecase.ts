import { NoteRepository } from 'data/repositories/firebase/NoteRepository';
import { Note } from 'domain/entities/Note';
import { AppError } from 'infrastructure/errors/AppError';

export class UpdateNoteUseCase {
  private noteRepository: NoteRepository;

  constructor({ noteRepository }: { noteRepository: NoteRepository }) {
    this.noteRepository = noteRepository;
  }

  async execute(farmId: string, id: string, updates: Partial<Note>): Promise<void> {
    try {
      const note = await this.noteRepository.findById(farmId, id);
      if (!note) {
        throw new Error('Note not found');
      }

      // Apply updates
      if (updates.title !== undefined) note.title = updates.title;
      if (updates.content !== undefined) note.content = updates.content || "";
      if (updates.items !== undefined) note.items = updates.items || [];
      
      note.updatedAt = new Date();

      await this.noteRepository.update(note);
    } catch (error) {
      throw new AppError(
        `Failed to update note ${id} for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateNoteUseCase',
        'UPDATE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
