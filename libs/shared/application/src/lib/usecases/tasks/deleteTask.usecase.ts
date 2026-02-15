import { AppError } from 'infrastructure/errors/AppError';

import { TaskRepository } from 'data/repositories/firebase/TaskRepository';

export class DeleteTaskUseCase {
  private taskRepository: TaskRepository;

  constructor({ taskRepository }: { taskRepository: TaskRepository }) {
    this.taskRepository = taskRepository;
  }

  async execute(farmId: string, id: string): Promise<void> {
    try {
      // Verify task exists
      const task = await this.taskRepository.findById(farmId, id);
      if (!task) {
        throw new Error('Task not found');
      }

      // Soft delete (for sync)
      await this.taskRepository.delete(farmId, id);
    } catch (error) {
      throw new AppError(
        `Failed to delete task ${id} for farm ${farmId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DeleteTaskUseCase',
        'DELETE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
