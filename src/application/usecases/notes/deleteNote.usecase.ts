import { NoteRepository } from '../../../data/repositories/firebase/NoteRepository';
import { AppError } from '../../../infrastructure/errors/AppError';

export class DeleteNoteUseCase {
  private noteRepository: NoteRepository;

  constructor({ noteRepository }: { noteRepository: NoteRepository }) {
    this.noteRepository = noteRepository;
  }

  async execute(farmId: string, id: string): Promise<void> {
    try {
      const note = await this.noteRepository.findById(farmId, id);
      if (!note) {
        throw new Error('Note not found');
      }

      await this.noteRepository.delete(farmId, id);
    } catch (error) {
      throw new AppError(
        `Failed to delete note ${id} for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DeleteNoteUseCase',
        'DELETE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
