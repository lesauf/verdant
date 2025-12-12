import { create } from 'zustand';
import { IdService } from '../../application/services/id.service';
import { ValidationService } from '../../application/services/validation.service';
import {
    CreateBlockInput,
    CreateBlockUseCase,
    DeleteBlockUseCase,
    GetAllBlocksUseCase,
    UpdateBlockInput,
    UpdateBlockUseCase
} from '../../application/usecases/blocks';
import { BlockRepository } from '../../data/repositories/BlockRepository';
import { Block } from '../../domain/entities/Block';

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
 * Replaces the old BlocksContext with clean architecture
 */
export const useBlockStore = create<BlockStore>((set, get) => {
  // Initialize use cases with dependencies
  const blockRepository = new BlockRepository();
  const idService = new IdService();
  const validationService = new ValidationService();
  
  const getAllBlocksUseCase = new GetAllBlocksUseCase(blockRepository);
  const createBlockUseCase = new CreateBlockUseCase(blockRepository, idService, validationService);
  const updateBlockUseCase = new UpdateBlockUseCase(blockRepository, validationService);
  const deleteBlockUseCase = new DeleteBlockUseCase(blockRepository);
  
  return {
    blocks: [],
    loading: false,
    error: null,

    loadBlocks: async () => {
      set({ loading: true, error: null });
      try {
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
        const newBlock = await createBlockUseCase.execute(input);
        set(state => ({ blocks: [...state.blocks, newBlock] }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create block' });
        throw error;
      }
    },

    updateBlock: async (id: string, updates: UpdateBlockInput) => {
      try {
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
  };
});
