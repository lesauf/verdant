import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React from "react";
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Task } from "../../src/domain/entities";

interface AddTaskModalProps {
    visible: boolean;
    blockId: string;
    blockName: string;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function AddTaskModal({ visible, blockId, blockName, onClose, onAdd }: AddTaskModalProps) {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [dueDate, setDueDate] = React.useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStartDate(null);
        setDueDate(null);
    };

    React.useEffect(() => {
        if (!visible) resetForm();
    }, [visible]);

    const handleAdd = () => {
        if (!title) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        onAdd(new Task({
            title,
            description: description,
            status: "Todo",
            blockId,
            assignedTo: null,
            startDate: startDate,
            dueDate: dueDate,
            updatedAt: undefined,
            syncedAt: null,
            isDeleted: false
        }));
        onClose();
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "No date set";
        return date.toLocaleDateString();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 h-[75%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">New Task for {blockName}</Text>
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
                    </ScrollView>

                    <TouchableOpacity
                        className="bg-emerald-500 p-4 rounded-xl items-center mt-4"
                        onPress={handleAdd}
                    >
                        <Text className="text-white font-bold text-lg">Create Task</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
