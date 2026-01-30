import { asClass, AwilixContainer, createContainer, InjectionMode } from 'awilix';
import * as Services from '../../application/services';
import * as UseCases from '../../application/usecases';
import * as Repositories from '../../data/repositories/firebase';

/**
 * Create and configure the DI container
 */
export function setupContainer(): AwilixContainer {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  });

  const registrations: any = {};

  // Helper to register from a definitions object
  const registerFromDefs = (defs: any) => {
    Object.keys(defs).forEach(key => {
      const item = defs[key];
      // Only register if it's a class/constructor and follows naming convention or is a class
      if (typeof item === 'function' && 
          (key.endsWith('Repository') || key.endsWith('Service') || key.endsWith('UseCase'))) {
        
        // Convert PascalCase to camelCase for the registration key
        const registrationKey = key.charAt(0).toLowerCase() + key.slice(1);
        registrations[registrationKey] = asClass(item).singleton();
      }
    });
  };

  // Autoload Repositories, Services and Use Cases
  registerFromDefs(Repositories);
  registerFromDefs(Services);
  registerFromDefs(UseCases);

  container.register(registrations);
  
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
