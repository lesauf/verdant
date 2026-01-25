import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect } from "react";
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../../src/domain/entities/Task";
import { useAttachmentsStore } from "../../src/presentation/stores/attachmentsStore";
import { useBlockStore } from "../../src/presentation/stores/blockStore";

interface ViewTaskModalProps {
    visible: boolean;
    task: Task;
    onClose: () => void;
}

export default function ViewTaskModal({ visible, task, onClose }: ViewTaskModalProps) {
    const { blocks } = useBlockStore();
    const { attachments, loadAttachments, addAttachment } = useAttachmentsStore();
    const blockName = blocks.find(b => b.id === task.blockId)?.name;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
    const taskAttachments = attachments[task.id] || [];

    useEffect(() => {
        if (visible) {
            loadAttachments(task.id);
        }
    }, [visible, task.id]);

    const handleAddImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            await addAttachment(task.id, result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                await addAttachment(task.id, result.assets[0].uri);
            }
        }
    };

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
                <View className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80%]">
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

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {task.description && (
                            <View className="mb-4">
                                <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                                <Text className="text-gray-600 leading-6">{task.description}</Text>
                            </View>
                        )}

                        <View className="space-y-3 mb-6">
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
                                    <FontAwesome5 name="check-circle" size={14} color="#10b981" />
                                    <Text className="text-gray-600 ml-2">
                                        Completed: {formatDate(task.completedAt)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Attachments Section */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-3">Attachments</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                {taskAttachments.map((att) => (
                                    <View key={att.id} className="mr-3 relative">
                                        <Image
                                            source={{ uri: att.uri }}
                                            className="w-24 h-24 rounded-lg bg-gray-100"
                                            resizeMode="cover"
                                        />
                                    </View>
                                ))}
                                <TouchableOpacity
                                    className="w-24 h-24 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 items-center justify-center mr-3"
                                    onPress={() => {
                                        Alert.alert("Add Attachment", "Choose source", [
                                            { text: "Camera", onPress: handleTakePhoto },
                                            { text: "Gallery", onPress: handleAddImage },
                                            { text: "Cancel", style: "cancel" }
                                        ]);
                                    }}
                                >
                                    <FontAwesome5 name="camera" size={20} color="#9ca3af" />
                                    <Text className="text-xs text-gray-400 mt-1">Add</Text>
                                </TouchableOpacity>
                            </ScrollView>
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
