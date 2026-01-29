import { asClass, AwilixContainer, createContainer, InjectionMode } from 'awilix';
import { AuthService, IdService, StorageService, ValidationService } from '../../application/services';
import { CreateBlockUseCase, DeleteBlockUseCase, GetAllBlocksUseCase, GetBlockByIdUseCase, UpdateBlockUseCase } from '../../application/usecases/blocks';
import { CreateTaskUseCase, DeleteTaskUseCase, GetAllTasksUseCase, ToggleTaskCompleteUseCase, UpdateTaskUseCase } from '../../application/usecases/tasks';
import { BlockRepository } from '../../data/repositories/firebase/BlockRepository';
import { TaskRepository } from '../../data/repositories/firebase/TaskRepository';

/**
 * Create and configure the DI container
 * Auto-loads repositories, services, and use cases
 */
export function setupContainer(): AwilixContainer {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  });

  // We'll register dependencies manually for now
  // Auto-loading will be set up once we have the files in place
  // Register Repositories
  container.register({
    blockRepository: asClass(BlockRepository).singleton(),
    taskRepository: asClass(TaskRepository).singleton(),
  });

  // Register Services
  container.register({
    authService: asClass(AuthService).singleton(),
    storageService: asClass(StorageService).singleton(),
    idService: asClass(IdService).singleton(),
    validationService: asClass(ValidationService).singleton(),
  });

  // Register Use Cases
  container.register({
    createBlockUseCase: asClass(CreateBlockUseCase).singleton(),
    deleteBlockUseCase: asClass(DeleteBlockUseCase).singleton(),
    getAllBlocksUseCase: asClass(GetAllBlocksUseCase).singleton(),
    getBlockByIdUseCase: asClass(GetBlockByIdUseCase).singleton(),
    updateBlockUseCase: asClass(UpdateBlockUseCase).singleton(),
    
    createTaskUseCase: asClass(CreateTaskUseCase).singleton(),
    getAllTasksUseCase: asClass(GetAllTasksUseCase).singleton(),
    deleteTaskUseCase: asClass(DeleteTaskUseCase).singleton(),
    updateTaskUseCase: asClass(UpdateTaskUseCase).singleton(),
    toggleTaskCompleteUseCase: asClass(ToggleTaskCompleteUseCase).singleton(),
  });
  
  return container;
}

// Singleton instance
let containerInstance: AwilixContainer | null = null;

/**
 * Get the global DI container instance
 */
export function getContainer(): AwilixContainer {
  if (!containerInstance) {
    containerInstance = setupContainer();
  }
  return containerInstance;
}

/**
 * Reset container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}
