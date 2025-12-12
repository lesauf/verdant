import React, { createContext, ReactNode, useContext, useState } from "react";

/**
 * Generic context factory for creating CRUD-based data contexts
 * Eliminates code duplication across different data types (tasks, blocks, etc.)
 */

interface BaseEntity {
    id: string;
}

interface DataContextValue<T extends BaseEntity> {
    items: T[];
    addItem: (item: T) => void;
    updateItem: (id: string, updates: Partial<T>) => void;
    deleteItem: (id: string) => void;
}

export function createDataContext<T extends BaseEntity>(
    displayName: string,
    initialData: T[]
) {
    const DataContext = createContext<DataContextValue<T> | undefined>(undefined);
    DataContext.displayName = displayName;

    function DataProvider({ children }: { children: ReactNode }) {
        const [items, setItems] = useState<T[]>(initialData);

        const addItem = (item: T) => {
            setItems(prevItems => [...prevItems, item]);
        };

        const updateItem = (id: string, updates: Partial<T>) => {
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, ...updates } : item
                )
            );
        };

        const deleteItem = (id: string) => {
            setItems(prevItems => prevItems.filter(item => item.id !== id));
        };

        return (
            <DataContext.Provider value={{ items, addItem, updateItem, deleteItem }}>
                {children}
            </DataContext.Provider>
        );
    }

    function useData() {
        const context = useContext(DataContext);
        if (context === undefined) {
            throw new Error(`useData must be used within a ${displayName}Provider`);
        }
        return context;
    }

    return { DataProvider, useData };
}
