import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Block, Task } from "../data/mockData";
import EditTaskModal from "./EditTaskModal";

interface TaskItemProps {
    task: Task;
    blocks: Block[];
    onToggleComplete: (taskId: string) => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
    showActions?: boolean;
    showBlockSelector?: boolean; // Whether to show block selector in edit modal
}

export default function TaskItem({
    task,
    blocks,
    onToggleComplete,
    onUpdate,
    onDelete,
    showActions = true,
    showBlockSelector = true
}: TaskItemProps) {
    const [showDescription, setShowDescription] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const blockName = blocks.find(b => b.id === task.blockId)?.name;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(task.id)
                }
            ]
        );
    };

    return (
        <>
            <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => onToggleComplete(task.id)}
                        className="mr-4"
                    >
                        <View className={`w-6 h-6 rounded-full items-center justify-center ${task.status === 'Done' ? 'bg-emerald-500' : 'border-2 border-gray-300'
                            }`}>
                            {task.status === 'Done' && (
                                <FontAwesome5 name="check" size={12} color="white" />
                            )}
                        </View>
                    </TouchableOpacity>

                    <View className="flex-1">
                        <TouchableOpacity onPress={() => setShowDescription(true)}>
                            <Text className={`text-base font-semibold ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900'
                                }`}>
                                {task.title}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center mt-1 flex-wrap gap-2">
                            {blockName && (
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="map-marker-alt" size={10} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs ml-1">{blockName}</Text>
                                </View>
                            )}
                            {task.startDate && (
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="play-circle" size={10} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs ml-1">{formatDate(task.startDate)}</Text>
                                </View>
                            )}
                            {task.dueDate && (
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="calendar" size={10} color={isOverdue ? "#ef4444" : "#6b7280"} />
                                    <Text className={`text-xs ml-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                                        {formatDate(task.dueDate)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {showActions && (
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={handleEdit}
                                className="p-2"
                            >
                                <FontAwesome5 name="edit" size={16} color="#6b7280" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="p-2"
                            >
                                <FontAwesome5 name="trash" size={16} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Description Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showDescription}
                onRequestClose={() => setShowDescription(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center p-4"
                    activeOpacity={1}
                    onPress={() => setShowDescription(false)}
                >
                    <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-xl font-bold text-gray-900 mb-2">{task.title}</Text>
                                <View className={`px-3 py-1 rounded-full self-start ${task.status === 'Done' ? 'bg-emerald-100' :
                                    task.status === 'In Progress' ? 'bg-amber-100' :
                                        'bg-gray-100'
                                    }`}>
                                    <Text className={`text-xs font-semibold ${task.status === 'Done' ? 'text-emerald-700' :
                                        task.status === 'In Progress' ? 'text-amber-700' :
                                            'text-gray-700'
                                        }`}>
                                        {task.status}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowDescription(false)}>
                                <FontAwesome5 name="times" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-64">
                            {task.description && (
                                <View className="mb-4">
                                    <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                                    <Text className="text-gray-600 leading-6">{task.description}</Text>
                                </View>
                            )}

                            <View className="space-y-3">
                                {blockName && (
                                    <View className="flex-row items-center">
                                        <FontAwesome5 name="map-marker-alt" size={14} color="#6b7280" />
                                        <Text className="text-gray-600 ml-2">{blockName}</Text>
                                    </View>
                                )}
                                {task.startDate && (
                                    <View className="flex-row items-center">
                                        <FontAwesome5 name="play-circle" size={14} color="#6b7280" />
                                        <Text className="text-gray-600 ml-2">Start: {formatDate(task.startDate)}</Text>
                                    </View>
                                )}
                                {task.dueDate && (
                                    <View className="flex-row items-center">
                                        <FontAwesome5 name="calendar" size={14} color={isOverdue ? "#ef4444" : "#6b7280"} />
                                        <Text className={`ml-2 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                            Due: {formatDate(task.dueDate)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            className="bg-emerald-500 p-3 rounded-xl items-center mt-4"
                            onPress={() => setShowDescription(false)}
                        >
                            <Text className="text-white font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Task Modal - Encapsulated */}
            <EditTaskModal
                visible={showEditModal}
                task={task}
                blocks={showBlockSelector ? blocks : undefined}
                onClose={() => setShowEditModal(false)}
                onSave={onUpdate}
            />
        </>
    );
}
