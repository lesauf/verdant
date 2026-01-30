import { NoteRepository } from '../../../data/repositories/firebase/NoteRepository';
import { Note } from '../../../domain/entities/Note';
import { AppError } from '../../../infrastructure/errors/AppError';

export class GetNoteByIdUseCase {
  constructor(private noteRepository: NoteRepository) {}

  async execute(id: string): Promise<Note | null> {
    try {
      return await this.noteRepository.findById(id);
    } catch (error) {
      throw new AppError(
        `Failed to get note ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetNoteByIdUseCase',
        'GET_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
