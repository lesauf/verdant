import { faCalendar, faCheck, faEdit, faMapMarkerAlt, faPlayCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../../src/domain/entities/Task";
import { useBlockStore } from "../../src/presentation/stores/blockStore";
import EditTaskModal from "./EditTaskModal";
import ViewTaskModal from "./ViewTaskModal";

interface TaskItemProps {
    task: Task;
    toggleTaskComplete: (taskId: string) => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
    showActions?: boolean;
    showBlockSelector?: boolean; // Whether to show block selector in edit modal
}

export default function TaskItem({
    task,
    toggleTaskComplete,
    onUpdate,
    onDelete,
    showActions = true,
    showBlockSelector = true
}: TaskItemProps) {
    const { blocks } = useBlockStore();
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
                        onPress={() => toggleTaskComplete(task.id)}
                        className="mr-4"
                    >
                        <View className={`w-6 h-6 rounded-full items-center justify-center ${task.status === 'Done' ? 'bg-emerald-500' : 'border-2 border-gray-300'
                            }`}>
                            {task.status === 'Done' && (
                                <FontAwesomeIcon icon={faCheck} size={12} color="white" />
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
                                    <FontAwesomeIcon icon={faMapMarkerAlt} size={10} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs ml-1">{blockName}</Text>
                                </View>
                            )}
                            {task.startDate && (
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faPlayCircle} size={10} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs ml-1">{formatDate(task.startDate)}</Text>
                                </View>
                            )}
                            {task.dueDate && (
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faCalendar} size={10} color={isOverdue ? "#ef4444" : "#6b7280"} />
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
                                <FontAwesomeIcon icon={faEdit} size={16} color="#6b7280" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="p-2"
                            >
                                <FontAwesomeIcon icon={faTrash} size={16} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Description Modal */}
            <ViewTaskModal
                visible={showDescription}
                task={task}
                onClose={() => setShowDescription(false)}
            />

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
