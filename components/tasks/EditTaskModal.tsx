import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React from "react";
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { type Block, type Task } from "../../data/mockData";

interface EditTaskModalProps {
    visible: boolean;
    task: Task | null;
    blocks?: Block[]; // Optional: only needed if we want to show block selector
    onClose: () => void;
    onSave: (taskId: string, updates: Partial<Task>) => void;
}

export default function EditTaskModal({ visible, task, blocks, onClose, onSave }: EditTaskModalProps) {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [blockId, setBlockId] = React.useState<string | null>(null);
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [dueDate, setDueDate] = React.useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);

    React.useEffect(() => {
        if (visible && task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setBlockId(task.blockId || null);
            setStartDate(task.startDate ? new Date(task.startDate) : null);
            setDueDate(task.dueDate ? new Date(task.dueDate) : null);
        }
    }, [visible, task]);

    const handleSave = () => {
        if (!title || !task) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        const updates: Partial<Task> = {
            title,
            description: description || undefined,
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
        };

        // Only include blockId if blocks prop is provided (Tasks screen)
        if (blocks !== undefined) {
            updates.blockId = blockId || undefined;
        }

        onSave(task.id, updates);
        onClose();
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "No date set";
        return date.toLocaleDateString();
    };

    if (!task) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Edit Task</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome5 name="times" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <Text className="text-gray-700 font-semibold mb-2">Task Title</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="e.g. Clear brush"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="Add task details..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Start Date (Optional)</Text>
                        <TouchableOpacity
                            className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text className={startDate ? "text-gray-900" : "text-gray-400"}>
                                {formatDate(startDate)}
                            </Text>
                            <FontAwesome5 name="play-circle" size={16} color="#6b7280" />
                        </TouchableOpacity>

                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowStartDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) setStartDate(selectedDate);
                                }}
                            />
                        )}

                        <Text className="text-gray-700 font-semibold mb-2">Due Date (Optional)</Text>
                        <TouchableOpacity
                            className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                            onPress={() => setShowDueDatePicker(true)}
                        >
                            <Text className={dueDate ? "text-gray-900" : "text-gray-400"}>
                                {formatDate(dueDate)}
                            </Text>
                            <FontAwesome5 name="calendar" size={16} color="#6b7280" />
                        </TouchableOpacity>

                        {showDueDatePicker && (
                            <DateTimePicker
                                value={dueDate || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowDueDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) setDueDate(selectedDate);
                                }}
                            />
                        )}

                        {/* Block selector - only shown if blocks prop is provided */}
                        {blocks && (
                            <>
                                <Text className="text-gray-700 font-semibold mb-2">Assign to Block (Optional)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                                    <TouchableOpacity
                                        onPress={() => setBlockId(null)}
                                        className={`mr-3 px-4 py-2 rounded-full border ${!blockId ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={!blockId ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>None</Text>
                                    </TouchableOpacity>
                                    {blocks.map(block => (
                                        <TouchableOpacity
                                            key={block.id}
                                            onPress={() => setBlockId(block.id)}
                                            className={`mr-3 px-4 py-2 rounded-full border ${blockId === block.id ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                        >
                                            <Text className={blockId === block.id ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>
                                                {block.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        className="bg-emerald-500 p-4 rounded-xl items-center mt-4"
                        onPress={handleSave}
                    >
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
