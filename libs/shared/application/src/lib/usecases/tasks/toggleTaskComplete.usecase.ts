import { Task } from 'domain/entities/Task';
import { AppError } from 'infrastructure/errors/AppError';

import { TaskRepository } from 'data/repositories/firebase/TaskRepository';

export class ToggleTaskCompleteUseCase {
  private taskRepository: TaskRepository;

  constructor({ taskRepository }: { taskRepository: TaskRepository }) {
    this.taskRepository = taskRepository;
  }

  async execute(farmId: string, id: string): Promise<Task> {
    try {
      // Fetch task
      const task = await this.taskRepository.findById(farmId, id);
      if (!task) {
        throw new Error('Task not found');
      }

      // Toggle completion using domain logic
      if (task.status === 'Done') {
        task.uncomplete();
      } else {
        task.complete(); // Uses domain method
      }

      // Persist
      return await this.taskRepository.update(task);
    } catch (error) {
      throw new AppError(
        `Failed to toggle task completion for task ${id} in farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ToggleTaskCompleteUseCase',
        'TOGGLE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
