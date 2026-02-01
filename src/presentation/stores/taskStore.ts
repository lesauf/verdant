import { create } from 'zustand';
import {
    CreateTaskInput,
    UpdateTaskInput,
} from '../../application/usecases/tasks';
import { Task } from '../../domain/entities/Task';
import { getContainer } from '../../infrastructure/di/container';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTasks: (farmId: string) => Promise<void>;
  createTask: (farmId: string, input: CreateTaskInput) => Promise<void>;
  updateTask: (farmId: string, id: string, updates: UpdateTaskInput) => Promise<void>;
  deleteTask: (farmId: string, id: string) => Promise<void>;
  toggleTaskComplete: (farmId: string, id: string) => Promise<void>;
  getTasksByBlockId: (blockId: string) => Task[];
}

/**
 * Zustand store for Tasks
 * Uses clean architecture and DI container
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  loadTasks: async (farmId: string) => {
    set({ loading: true, error: null });
    try {
      const container = getContainer();
      const getAllTasksUseCase = container.resolve('getAllTasksUseCase');
      const tasks = await getAllTasksUseCase.execute(farmId);
      set({ tasks, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        loading: false 
      });
    }
  },

  createTask: async (farmId: string, input: CreateTaskInput) => {
    try {
      const container = getContainer();
      const createTaskUseCase = container.resolve('createTaskUseCase');
      const newTask = await createTaskUseCase.execute({ ...input, farmId });
      set(state => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create task' });
      throw error;
    }
  },

  updateTask: async (farmId: string, id: string, updates: UpdateTaskInput) => {
    try {
      const container = getContainer();
      const updateTaskUseCase = container.resolve('updateTaskUseCase');
      const updatedTask = await updateTaskUseCase.execute(farmId, id, updates);
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    }
  },

  deleteTask: async (farmId: string, id: string) => {
    try {
      const container = getContainer();
      const deleteTaskUseCase = container.resolve('deleteTaskUseCase');
      await deleteTaskUseCase.execute(farmId, id);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
      throw error;
    }
  },

  toggleTaskComplete: async (farmId: string, id: string) => {
    try {
      const container = getContainer();
      const toggleTaskCompleteUseCase = container.resolve('toggleTaskCompleteUseCase');
      const updatedTask = await toggleTaskCompleteUseCase.execute(farmId, id);
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
}));
