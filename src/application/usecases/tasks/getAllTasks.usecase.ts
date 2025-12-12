import { Task } from '../../../domain/entities/Task';
import { AppError } from '../../../infrastructure/errors/AppError';

interface ITaskRepository {
  findAll(): Promise<Task[]>;
}

export class GetAllTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(): Promise<Task[]> {
    try {
      return await this.taskRepository.findAll();
    } catch (error) {
      throw new AppError(
        `Failed to get tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GetAllTasksUseCase',
        'GET_TASKS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
