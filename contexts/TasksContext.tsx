import { mockTasks, type Task } from "../data/mockData";
import { createDataContext } from "./createDataContext";

/**
 * TasksContext - Global state management for farm tasks
 * Created using the generic context factory to eliminate code duplication
 */

const { DataProvider, useData } = createDataContext<Task>(
    "TasksContext",
    mockTasks
);

// Export with semantic naming
export const TasksProvider = DataProvider;
export const useTasks = () => {
    const { items, addItem, updateItem, deleteItem } = useData();

    // Add task-specific helper for toggling completion
    const toggleTaskComplete = (taskId: string) => {
        const task = items.find(t => t.id === taskId);
        if (task) {
            updateItem(taskId, {
                status: task.status === "Done" ? "Todo" : "Done"
            });
        }
    };

    return {
        tasks: items,
        addTask: addItem,
        updateTask: updateItem,
        deleteTask: deleteItem,
        toggleTaskComplete,
    };
};
