import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../../src/domain/entities/Task";
import { useBlockStore } from "../../src/presentation/stores/blockStore";

interface ViewTaskModalProps {
    visible: boolean;
    task: Task;
    onClose: () => void;
}

export default function ViewTaskModal({ visible, task, onClose }: ViewTaskModalProps) {
    const { blocks } = useBlockStore();
    const blockName = blocks.find(b => b.id === task.blockId)?.name;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-center items-center p-4"
                activeOpacity={1}
                onPress={onClose}
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
                        <TouchableOpacity onPress={onClose}>
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
                            {task.completedAt && (
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="calendar" size={14} color={isOverdue ? "#ef4444" : "#6b7280"} />
                                    <Text className={`ml-2 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                        Completed: {formatDate(task.completedAt)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        className="bg-emerald-500 p-3 rounded-xl items-center mt-4"
                        onPress={onClose}
                    >
                        <Text className="text-white font-semibold">Close</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
