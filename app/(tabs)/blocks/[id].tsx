import { faEdit, faTasks, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditBlockModal from "../../../components/blocks/EditBlockModal";
import AddTaskModal from "../../../components/tasks/AddTaskModal";
import TaskItem from "../../../components/tasks/TaskItem";
import { useBlockStore } from "../../../src/presentation/stores/blockStore";
import { useTaskStore } from "../../../src/presentation/stores/taskStore";

export default function BlockDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { blocks, loadBlocks, updateBlock, deleteBlock } = useBlockStore();
    const { tasks: allTasks, loadTasks, createTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();

    const block = blocks.find(b => b.id === String(id));

    // Filter tasks for this specific block
    const tasks = useMemo(() => {
        return allTasks.filter(t => t.blockId === String(id));
    }, [allTasks, id]);

    // Load data on mount
    useEffect(() => {
        loadBlocks();
        loadTasks();
    }, []);

    // Modal visibility state
    const [isEditBlockModalVisible, setEditBlockModalVisible] = React.useState(false);
    const [isAddTaskModalVisible, setAddTaskModalVisible] = React.useState(false);

    if (!block) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-500">Block not found</Text>
            </SafeAreaView>
        );
    }

    const handleDeleteBlock = () => {
        Alert.alert(
            "Delete Block",
            `Are you sure you want to delete "${block.name}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteBlock(String(id));
                        router.back();
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Planted": return "bg-emerald-500";
            case "Prep": return "bg-amber-500";
            case "Fallow": return "bg-gray-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Header Section */}
                <View className="bg-white p-6 mb-4 shadow-sm">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-gray-900 mb-2">{block.name}</Text>
                            <Text className="text-lg text-gray-600 mb-3">{block.areaHa} Hectares</Text>
                            <View className={`self-start px-4 py-2 rounded-full ${getStatusColor(block.status)}`}>
                                <Text className="text-white font-semibold">{block.status}</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="bg-gray-100 p-3 rounded-full"
                                onPress={() => setEditBlockModalVisible(true)}
                            >
                                <FontAwesomeIcon icon={faEdit} size={18} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-50 p-3 rounded-full"
                                onPress={handleDeleteBlock}
                            >
                                <FontAwesomeIcon icon={faTrash} size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Tasks Section */}
                <View className="px-4 mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-xl font-bold text-gray-900">Tasks</Text>
                        <Text className="text-gray-500">{tasks.length} tasks</Text>
                    </View>

                    <TouchableOpacity
                        className="bg-emerald-500 p-4 rounded-xl items-center mb-4"
                        onPress={() => setAddTaskModalVisible(true)}
                    >
                        <Text className="text-white font-bold">Add Task</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TaskItem
                                task={item}
                                toggleTaskComplete={toggleTaskComplete}
                                onUpdate={(taskId, updates) => updateTask(taskId, {
                                    ...updates,
                                    description: updates.description ?? undefined,
                                    blockId: updates.blockId ?? undefined,
                                    assignedTo: updates.assignedTo ?? undefined,
                                    startDate: updates.startDate ?? undefined,
                                    dueDate: updates.dueDate ?? undefined,
                                })}
                                onDelete={deleteTask}
                                showBlockSelector={false}
                            />
                        )}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-12">
                                <FontAwesomeIcon icon={faTasks} size={48} color="#d1d5db" />
                                <Text className="text-gray-400 mt-4 text-center">
                                    No tasks yet.{'\n'}Add your first task!
                                </Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>

            <EditBlockModal
                visible={isEditBlockModalVisible}
                block={block}
                onClose={() => setEditBlockModalVisible(false)}
                onSave={async (blockId, name, areaHa, status) => {
                    await updateBlock(blockId, { name, areaHa, status });
                    setEditBlockModalVisible(false);
                }}
            />

            <AddTaskModal
                visible={isAddTaskModalVisible}
                blockId={String(id)}
                blockName={block.name}
                onClose={() => setAddTaskModalVisible(false)}
                onAdd={async (task) => {
                    await createTask({
                        ...task,
                        description: task.description ?? undefined,
                        assignedTo: task.assignedTo ?? undefined,
                        startDate: task.startDate ?? undefined,
                        dueDate: task.dueDate ?? undefined,
                        blockId: String(id),
                    });
                    setAddTaskModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}
