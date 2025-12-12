import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditBlockModal from "../../../components/blocks/EditBlockModal";
import AddTaskModal from "../../../components/tasks/AddTaskModal";
import TaskItem from "../../../components/tasks/TaskItem";
import { useBlockStore } from "../../../src/presentation/stores/blockStore";
import { useTaskStore } from "../../../src/presentation/stores/taskStore";

export default function BlockDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { blocks, loadBlocks, updateBlock } = useBlockStore();
    const { tasks: allTasks, loadTasks, createTask, updateTask, deleteTask } = useTaskStore();

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
                        <TouchableOpacity
                            className="bg-gray-100 p-3 rounded-full"
                            onPress={() => setEditBlockModalVisible(true)}
                        >
                            <FontAwesome5 name="edit" size={18} color="#374151" />
                        </TouchableOpacity>
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
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                                showBlockSelector={false}
                            />
                        )}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-12">
                                <FontAwesome5 name="tasks" size={48} color="#d1d5db" />
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
                onSave={async (blockId, updates) => {
                    await updateBlock(blockId, updates);
                    setEditBlockModalVisible(false);
                }}
            />

            <AddTaskModal
                visible={isAddTaskModalVisible}
                onClose={() => setAddTaskModalVisible(false)}
                onSave={async (task) => {
                    await createTask({
                        ...task,
                        blockId: String(id),
                    });
                    setAddTaskModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}
