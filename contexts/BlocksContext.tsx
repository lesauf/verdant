import { mockBlocks, type Block } from "../data/mockData";
import { createDataContext } from "./createDataContext";

/**
 * BlocksContext - Global state management for farm blocks
 * Created using the generic context factory to eliminate code duplication
 */

const { DataProvider, useData } = createDataContext<Block>(
    "BlocksContext",
    mockBlocks
);

// Export with semantic naming
export const BlocksProvider = DataProvider;
export const useBlocks = () => {
    const { items, addItem, updateItem, deleteItem } = useData();

    return {
        blocks: items,
        addBlock: addItem,
        updateBlock: updateItem,
        deleteBlock: deleteItem,
    };
};
