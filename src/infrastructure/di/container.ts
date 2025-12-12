import { AwilixContainer, createContainer, InjectionMode } from 'awilix';

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
