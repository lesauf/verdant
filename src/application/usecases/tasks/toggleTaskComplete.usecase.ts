import { Task } from '../../../domain/entities/Task';
import { AppError } from '../../../infrastructure/errors/AppError';

interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<Task>;
}

export class ToggleTaskCompleteUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    try {
      // Fetch task
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      // Toggle completion using domain logic
      if (task.status === 'Done') {
        task.status = 'Todo';
      } else {
        task.complete(); // Uses domain method
      }

      // Persist
      return await this.taskRepository.update(task);
    } catch (error) {
      throw new AppError(
        `Failed to toggle task completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ToggleTaskCompleteUseCase',
        'TOGGLE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
