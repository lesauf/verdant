import { Task, TaskStatus } from '../../../domain/entities/Task';
import { AppError } from '../../../infrastructure/errors/AppError';
import { ValidationService } from '../../services/validation.service';

import { TaskRepository } from '../../../data/repositories/firebase/TaskRepository';

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  blockId?: string;
  assignedTo?: string;
  startDate?: Date;
  dueDate?: Date;
}

export class UpdateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private validationService: ValidationService
  ) {}

  async execute(id: string, input: UpdateTaskInput): Promise<Task> {
    try {
      // Fetch existing task
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      // Apply updates with validation
      if (input.title !== undefined) {
        this.validationService.validateTaskTitle(input.title);
        task.title = input.title;
      }

      if (input.description !== undefined) {
        task.description = input.description;
      }

      if (input.status !== undefined) {
        task.status = input.status;
      }

      if (input.blockId !== undefined) {
        task.blockId = input.blockId;
      }

      if (input.assignedTo !== undefined) {
        task.assignedTo = input.assignedTo;
      }

      if (input.startDate !== undefined) {
        task.startDate = input.startDate;
      }

      if (input.dueDate !== undefined) {
        task.dueDate = input.dueDate;
      }

      // Validate date range if both dates provided
      if (task.startDate || task.dueDate) {
        this.validationService.validateDateRange(task.startDate, task.dueDate);
      }

      // Update timestamp
      task.updatedAt = new Date();

      // Persist
      return await this.taskRepository.update(task);
    } catch (error) {
      throw new AppError(
        `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UpdateTaskUseCase',
        'UPDATE_TASK_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
