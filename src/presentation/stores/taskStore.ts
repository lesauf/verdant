import { create } from 'zustand';
import { IdService } from '../../application/services/id.service';
import { ValidationService } from '../../application/services/validation.service';
import {
    CreateTaskInput,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    GetAllTasksUseCase,
    ToggleTaskCompleteUseCase,
    UpdateTaskInput,
    UpdateTaskUseCase
} from '../../application/usecases/tasks';
import { TaskRepository } from '../../data/repositories/TaskRepository';
import { Task } from '../../domain/entities/Task';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
error: string | null;
  
  // Actions
  loadTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  getTasksByBlockId: (blockId: string) => Task[];
}

/**
 * Zustand store for Tasks
 * Replaces the old TasksContext with clean architecture
 */
export const useTaskStore = create<TaskStore>((set, get) => {
  // Initialize use cases with dependencies
  const taskRepository = new TaskRepository();
  const idService = new IdService();
  const validationService = new ValidationService();
  
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, idService, validationService);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, validationService);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
  const toggleTaskCompleteUseCase = new ToggleTaskCompleteUseCase(taskRepository);
  
  return {
    tasks: [],
    loading: false,
    error: null,

    loadTasks: async () => {
      set({ loading: true, error: null });
      try {
        const tasks = await getAllTasksUseCase.execute();
        set({ tasks, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load tasks',
          loading: false 
        });
      }
    },

    createTask: async (input: CreateTaskInput) => {
      try {
        const newTask = await createTaskUseCase.execute(input);
        set(state => ({ tasks: [...state.tasks, newTask] }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create task' });
        throw error;
      }
    },

    updateTask: async (id: string, updates: UpdateTaskInput) => {
      try {
        const updatedTask = await updateTaskUseCase.execute(id, updates);
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update task' });
        throw error;
      }
    },

    deleteTask: async (id: string) => {
      try {
        await deleteTaskUseCase.execute(id);
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
        throw error;
      }
    },

    toggleTaskComplete: async (id: string) => {
      try {
        const updatedTask = await toggleTaskCompleteUseCase.execute(id);
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to toggle task' });
        throw error;
      }
    },

    getTasksByBlockId: (blockId: string) => {
      return get().tasks.filter(t => t.blockId === blockId);
    },
  };
});
