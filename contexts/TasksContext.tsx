import React, { createContext, ReactNode, useContext, useState } from "react";
import { mockTasks, type Task } from "../data/mockData";

interface TasksContextType {
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    toggleTaskComplete: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    const addTask = (task: Task) => {
        setTasks(prevTasks => [...prevTasks, task]);
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            )
        );
    };

    const deleteTask = (taskId: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    const toggleTaskComplete = (taskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, status: task.status === "Done" ? "Todo" : "Done" }
                    : task
            )
        );
    };

    return (
        <TasksContext.Provider
            value={{ tasks, addTask, updateTask, deleteTask, toggleTaskComplete }}
        >
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
}
