import { faCalendar, faCamera, faCheckCircle, faMapMarkerAlt, faPlayCircle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task } from "domain/entities/Task";
import { useAttachmentsStore } from "ui/stores/attachmentsStore";
import { useBlockStore } from "ui/stores/blockStore";

interface ViewTaskModalProps {
    visible: boolean;
    task: Task;
    onClose: () => void;
}

export default function ViewTaskModal({ visible, task, onClose }: ViewTaskModalProps) {
    const { blocks } = useBlockStore();
    const { attachments, loadAttachments, addAttachment, deleteAttachment } = useAttachmentsStore();
    const blockName = blocks.find(b => b.id === task.blockId)?.name;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
    const taskAttachments = attachments[task.id] || [];

    const [fullScreenImage, setFullScreenImage] = useState<{ uri: string, id: string } | null>(null);

    useEffect(() => {
        if (visible) {
            loadAttachments(task.id);
        }
    }, [visible, task.id]);

    const handleAddImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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

    const handleDeleteAttachment = async (id: string, uri: string) => {
        Alert.alert(
            "Delete Attachment",
            "Are you sure you want to delete this attachment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteAttachment(id, uri, task.id);
                        if (fullScreenImage?.id === id) {
                            setFullScreenImage(null);
                        }
                    }
                }
            ]
        );
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
                            <FontAwesomeIcon icon={faTimes} size={20} color="#9ca3af" />
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
                                    <FontAwesomeIcon icon={faMapMarkerAlt} size={14} color="#6b7280" />
                                    <Text className="text-gray-600 ml-2">{blockName}</Text>
                                </View>
                            )}
                            {task.startDate && (
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faPlayCircle} size={14} color="#6b7280" />
                                    <Text className="text-gray-600 ml-2">Start: {formatDate(task.startDate)}</Text>
                                </View>
                            )}
                            {task.dueDate && (
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faCalendar} size={14} color={isOverdue ? "#ef4444" : "#6b7280"} />
                                    <Text className={`ml-2 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                        Due: {formatDate(task.dueDate)}
                                    </Text>
                                </View>
                            )}
                            {task.completedAt && (
                                <View className="flex-row items-center">
                                    <FontAwesomeIcon icon={faCheckCircle} size={14} color="#10b981" />
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
                                        <TouchableOpacity
                                            onPress={() => setFullScreenImage({ uri: att.uri, id: att.id })}
                                            activeOpacity={0.8}
                                        >
                                            <Image
                                                source={{ uri: att.uri }}
                                                className="w-24 h-24 rounded-lg bg-gray-100"
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full"
                                            onPress={() => handleDeleteAttachment(att.id, att.uri)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} size={10} color="white" />
                                        </TouchableOpacity>
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
                                    <FontAwesomeIcon icon={faCamera} size={20} color="#9ca3af" />
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

            {/* Full Screen Image Modal */}
            <Modal
                visible={!!fullScreenImage}
                transparent={true}
                onRequestClose={() => setFullScreenImage(null)}
                animationType="fade"
            >
                <View className="flex-1 bg-black justify-center items-center relative">
                    <TouchableOpacity
                        className="absolute top-12 right-6 z-10 bg-black/40 p-2 rounded-full"
                        onPress={() => setFullScreenImage(null)}
                    >
                        <FontAwesomeIcon icon={faTimes} size={24} color="white" />
                    </TouchableOpacity>

                    {fullScreenImage && (
                        <>
                            <Image
                                source={{ uri: fullScreenImage.uri }}
                                style={{ width: '100%', height: '80%' }}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                className="absolute bottom-12 right-6 bg-red-500/80 p-4 rounded-full"
                                onPress={() => handleDeleteAttachment(fullScreenImage.id, fullScreenImage.uri)}
                            >
                                <FontAwesomeIcon icon={faTrash} size={24} color="white" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
        </Modal>
    );
}
