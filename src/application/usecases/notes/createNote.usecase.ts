import { NoteRepository } from '../../../data/repositories/firebase/NoteRepository';
import { Note, NoteType } from '../../../domain/entities/Note';
import { AppError } from '../../../infrastructure/errors/AppError';
import { IdService } from '../../services/id.service';

export interface CreateNoteInput {
  title: string;
  type: NoteType;
}

export class CreateNoteUseCase {
  private noteRepository: NoteRepository;
  private idService: IdService;

  constructor({ 
    noteRepository, 
    idService 
  }: { 
    noteRepository: NoteRepository; 
    idService: IdService; 
  }) {
    this.noteRepository = noteRepository;
    this.idService = idService;
  }

  async execute(input: CreateNoteInput): Promise<string> {
    try {
      const now = new Date();
      const note = new Note({
        id: this.idService.generate(),
        title: input.title,
        type: input.type,
        content: "",
        items: [],
        createdAt: now,
        updatedAt: now,
        isDeleted: false
      });

      await this.noteRepository.save(note);
      return note.id;
    } catch (error) {
      throw new AppError(
        `Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CreateNoteUseCase',
        'CREATE_NOTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
