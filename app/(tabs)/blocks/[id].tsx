import { FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskItem from "../../../components/TaskItem";
import { mockBlocks, mockTasks, type Task } from "../../../data/mockData";

export default function BlockDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const block = mockBlocks.find(b => b.id === String(id));

    // Filter tasks for this specific block
    const blockTasks = useMemo(() => {
        return mockTasks.filter(t => t.blockId === String(id));
    }, [id, mockTasks]);

    const [tasks, setTasks] = useState<Task[]>(() => blockTasks);

    // Update tasks when block changes
    useEffect(() => {
        setTasks(blockTasks);
    }, [blockTasks]);

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

    const toggleTaskComplete = (taskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === "Done" ? "Todo" : "Done" }
                : task
        ));
    };

    const handleEdit = (task: Task) => {
        // Navigate to tasks screen
        router.push("/(tabs)/tasks");
    };

    const handleDelete = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.push('/(tabs)/blocks')} className="mr-3">
                    <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 flex-1">Block Details</Text>
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
                    <Text className="text-lg font-bold text-gray-900 mb-3">Tasks</Text>
                    {tasks.length > 0 ? (
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TaskItem
                                    task={item}
                                    blocks={mockBlocks}
                                    onToggleComplete={toggleTaskComplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    showActions={false}
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

            {/* Add Task FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push("/(tabs)/tasks")}
            >
                <FontAwesome5 name="plus" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
