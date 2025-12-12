import { Task } from '../../../domain/entities/Task';
import { AppError } from '../../../infrastructure/errors/AppError';

interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  delete(id: string): Promise<void>;
}

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<void> {
    try {
      // Verify task exists
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      // Soft delete (for sync)
      await this.taskRepository.delete(id);
    } catch (error) {
      throw new AppError(
        `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DeleteTaskUseCase',
        'DELETE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
