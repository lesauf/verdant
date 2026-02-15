import { NoteRepository } from 'data/repositories/firebase/NoteRepository';
import { Note } from 'domain/entities/Note';
import { AppError } from 'infrastructure/errors/AppError';

export class GetNoteByIdUseCase {
  private noteRepository: NoteRepository;

  constructor({ noteRepository }: { noteRepository: NoteRepository }) {
    this.noteRepository = noteRepository;
  }

  async execute(farmId: string, id: string): Promise<Note | null> {
    try {
      return await this.noteRepository.findById(farmId, id);
    } catch (error) {
      throw new AppError(
        `Failed to get note ${id} for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetNoteByIdUseCase',
        'GET_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
