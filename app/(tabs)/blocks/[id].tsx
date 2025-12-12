import { FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditBlockModal from "../../../components/blocks/EditBlockModal";
import AddTaskModal from "../../../components/tasks/AddTaskModal";
import TaskItem from "../../../components/tasks/TaskItem";
import { useBlocks } from "../../../contexts/BlocksContext";
import { useTasks } from "../../../contexts/TasksContext";
import { type Task } from "../../../data/mockData";

export default function BlockDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { blocks, updateBlock } = useBlocks();
    const block = blocks.find(b => b.id === String(id));
    const { tasks: allTasks, addTask, updateTask, toggleTaskComplete, deleteTask } = useTasks();

    // Filter tasks for this specific block from global state
    const tasks = useMemo(() => {
        return allTasks.filter(t => t.blockId === String(id));
    }, [allTasks, id]);

    // Modal visibility state
    const [isEditBlockModalVisible, setEditBlockModalVisible] = React.useState(false);
    const [isAddTaskModalVisible, setAddTaskModalVisible] = React.useState(false);

    if (!block) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <FontAwesome5 name="exclamation-circle" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4">Block not found</Text>
            </SafeAreaView>
        );
    }

    const completedTasks = tasks.filter(t => t.status === "Done").length;
    const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
    const todoTasks = tasks.filter(t => t.status === "Todo").length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Planted": return "bg-emerald-100 text-emerald-700";
            case "Prep": return "bg-amber-100 text-amber-700";
            case "Fallow": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const handleEditBlock = (name: string, area: number, status: "Planted" | "Prep" | "Fallow") => {
        updateBlock(block.id, {
            name,
            areaHa: area,
            status,
            updatedAt: new Date(),
        });
        setEditBlockModalVisible(false);
    };

    const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask: Task = {
            ...taskData,
            id: String(Date.now()),
            createdAt: new Date(),
        };
        addTask(newTask);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.push('/(tabs)/blocks')} className="mr-3">
                    <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 flex-1">Block Details</Text>
                <TouchableOpacity onPress={() => setEditBlockModalVisible(true)} className="bg-emerald-100 p-2 rounded-lg">
                    <FontAwesome5 name="edit" size={18} color="#10b981" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Block Info Card */}
                <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 mb-2">{block.name}</Text>
                            <Text className="text-gray-600 text-lg">{block.areaHa} Hectares</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full ${getStatusColor(block.status)}`}>
                            <Text className="font-semibold">{block.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View className="flex-row mb-4 gap-3">
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                        <Text className="text-gray-500 text-sm mb-1">Total Tasks</Text>
                        <Text className="text-2xl font-bold text-gray-900">{tasks.length}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                        <Text className="text-gray-500 text-sm mb-1">Completed</Text>
                        <Text className="text-2xl font-bold text-emerald-600">{completedTasks}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                        <Text className="text-gray-500 text-sm mb-1">Pending</Text>
                        <Text className="text-2xl font-bold text-amber-600">{todoTasks + inProgressTasks}</Text>
                    </View>
                </View>

                {/* Tasks Section */}
                <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-bold text-gray-900">Tasks</Text>
                        <TouchableOpacity
                            onPress={() => setAddTaskModalVisible(true)}
                            className="bg-emerald-500 px-4 py-2 rounded-lg flex-row items-center"
                        >
                            <FontAwesome5 name="plus" size={14} color="white" />
                            <Text className="text-white font-semibold ml-2">Add Task</Text>
                        </TouchableOpacity>
                    </View>
                    {tasks.length > 0 ? (
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TaskItem
                                    task={item}
                                    blocks={blocks}
                                    onToggleComplete={toggleTaskComplete}
                                    onUpdate={updateTask}
                                    onDelete={deleteTask}
                                />
                            )}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View className="bg-white rounded-xl p-8 items-center">
                            <FontAwesome5 name="clipboard-list" size={40} color="#d1d5db" />
                            <Text className="text-gray-400 mt-3">No tasks assigned to this block</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
            <EditBlockModal
                visible={isEditBlockModalVisible}
                block={block}
                onClose={() => setEditBlockModalVisible(false)}
                onSave={handleEditBlock}
            />

            <AddTaskModal
                visible={isAddTaskModalVisible}
                blockId={block.id}
                blockName={block.name}
                onClose={() => setAddTaskModalVisible(false)}
                onAdd={handleAddTask}
            />
        </SafeAreaView>
    );
}
