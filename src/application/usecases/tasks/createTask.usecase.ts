import { Task, TaskStatus } from '../../../domain/entities/Task';
import { AppError } from '../../../infrastructure/errors/AppError';
import { IdService } from '../../services/id.service';
import { ValidationService } from '../../services/validation.service';

interface ITaskRepository {
  save(task: Task): Promise<Task>;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  blockId?: string;
  assignedTo?: string;
  startDate?: Date;
  dueDate?: Date;
}

export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private idService: IdService,
    private validationService: ValidationService
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    try {
      // Validation
      this.validationService.validateTaskTitle(input.title);
      this.validationService.validateDateRange(
        input.startDate || null,
        input.dueDate || null
      );

      // Create domain entity
      const task = new Task({
        id: this.idService.generate(),
        title: input.title,
        description: input.description || null,
        status: input.status || 'Todo',
        blockId: input.blockId || null,
        assignedTo: input.assignedTo || null,
        startDate: input.startDate || null,
        dueDate: input.dueDate || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: null,
        isDeleted: false
      });

      // Persist
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new AppError(
        `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CreateTaskUseCase',
        'CREATE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
