import { create } from 'zustand';
import {
  CreateBlockInput,
  UpdateBlockInput,
} from '../../application/usecases/blocks';
import { Block } from '../../domain/entities/Block';
import { getContainer } from '../../infrastructure/di/container';

interface BlockStore {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadBlocks: () => Promise<void>;
  createBlock: (input: CreateBlockInput) => Promise<void>;
  updateBlock: (id: string, updates: UpdateBlockInput) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  getBlockById: (id: string) => Block | undefined;
}

/**
 * Zustand store for Blocks
 * Uses clean architecture and DI container
 */
export const useBlockStore = create<BlockStore>((set, get) => ({
  blocks: [],
  loading: false,
  error: null,

  loadBlocks: async () => {
    set({ loading: true, error: null });
    try {
      const container = getContainer();
      const getAllBlocksUseCase = container.resolve('getAllBlocksUseCase');
      const blocks = await getAllBlocksUseCase.execute();
      set({ blocks, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load blocks',
        loading: false 
      });
    }
  },

  createBlock: async (input: CreateBlockInput) => {
    try {
      const container = getContainer();
      const createBlockUseCase = container.resolve('createBlockUseCase');
      const newBlock = await createBlockUseCase.execute(input);
      set(state => ({ blocks: [...state.blocks, newBlock] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create block' });
      throw error;
    }
  },

  updateBlock: async (id: string, updates: UpdateBlockInput) => {
    try {
      const container = getContainer();
      const updateBlockUseCase = container.resolve('updateBlockUseCase');
      const updatedBlock = await updateBlockUseCase.execute(id, updates);
      set(state => ({
        blocks: state.blocks.map(b => b.id === id ? updatedBlock : b)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update block' });
      throw error;
    }
  },

  deleteBlock: async (id: string) => {
    try {
      const container = getContainer();
      const deleteBlockUseCase = container.resolve('deleteBlockUseCase');
      await deleteBlockUseCase.execute(id);
      set(state => ({
        blocks: state.blocks.filter(b => b.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete block' });
      throw error;
    }
  },

  getBlockById: (id: string) => {
    return get().blocks.find(b => b.id === id);
  },
}));
