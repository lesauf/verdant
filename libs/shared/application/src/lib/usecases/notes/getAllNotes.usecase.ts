import { NoteRepository } from 'data/repositories/firebase/NoteRepository';
import { Note } from 'domain/entities/Note';
import { AppError } from 'infrastructure/errors/AppError';

export class GetAllNotesUseCase {
  private noteRepository: NoteRepository;

  constructor({ noteRepository }: { noteRepository: NoteRepository }) {
    this.noteRepository = noteRepository;
  }

  async execute(farmId: string): Promise<Note[]> {
    try {
      return await this.noteRepository.findAll(farmId);
    } catch (error) {
      throw new AppError(
        `Failed to get notes for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetAllNotesUseCase',
        'GET_NOTES_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
