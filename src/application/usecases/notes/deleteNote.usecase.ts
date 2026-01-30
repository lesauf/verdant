import { NoteRepository } from '../../../data/repositories/firebase/NoteRepository';
import { AppError } from '../../../infrastructure/errors/AppError';

export class DeleteNoteUseCase {
  constructor(private noteRepository: NoteRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const note = await this.noteRepository.findById(id);
      if (!note) {
        throw new Error('Note not found');
      }

      await this.noteRepository.delete(id);
    } catch (error) {
      throw new AppError(
        `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DeleteNoteUseCase',
        'DELETE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
