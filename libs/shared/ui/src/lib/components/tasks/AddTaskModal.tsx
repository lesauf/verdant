import { faCalendar, faPlayCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from "react";
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Block, Task } from "domain/entities";
import { useFarm } from "ui/context/FarmContext";

interface AddTaskModalProps {
    visible: boolean;
    blockId?: string;
    blockName?: string;
    blocks?: Block[]; // Optional: if provided, allows selecting a block
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function AddTaskModal({ visible, blockId, blockName, blocks, onClose, onAdd }: AddTaskModalProps) {
    const { members } = useFarm();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [dueDate, setDueDate] = React.useState<Date | null>(null);
    const [assignedTo, setAssignedTo] = React.useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(blockId || null);
    const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStartDate(null);
        setDueDate(null);
        setAssignedTo(null);
        setSelectedBlockId(blockId || null);
    };

    React.useEffect(() => {
        if (!visible) resetForm();
        else setSelectedBlockId(blockId || null);
    }, [visible, blockId]);

    const handleAdd = () => {
        if (!title) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        onAdd(new Task({
            title,
            description: description,
            status: "Todo",
            blockId: selectedBlockId || undefined,
            assignedTo: assignedTo,
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
                <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">
                            {blockName ? `New Task for ${blockName}` : "New Task"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesomeIcon icon={faTimes} size={20} color="#9ca3af" />
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

                        <Text className="text-gray-700 font-semibold mb-2">Assign To</Text>
                        <View className="mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                                <TouchableOpacity
                                    onPress={() => setAssignedTo(null)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${assignedTo === null
                                        ? 'bg-gray-800 border-gray-800'
                                        : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Text className={assignedTo === null ? 'text-white' : 'text-gray-700'}>Unassigned</Text>
                                </TouchableOpacity>
                                {members.map(member => (
                                    <TouchableOpacity
                                        key={member.userId}
                                        onPress={() => setAssignedTo(member.userId)}
                                        className={`mr-3 px-4 py-2 rounded-full border ${assignedTo === member.userId
                                            ? 'bg-emerald-600 border-emerald-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={assignedTo === member.userId ? 'text-white' : 'text-gray-700'}>
                                            {member.displayName || 'Member'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

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

                        {/* Block Selector - Only if blocks prop provided */}
                        {blocks && (
                            <>
                                <Text className="text-gray-700 font-semibold mb-2">Assign to Block (Optional)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    <TouchableOpacity
                                        className={`mr-2 px-4 py-2 rounded-full ${!selectedBlockId ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                        onPress={() => setSelectedBlockId(null)}
                                    >
                                        <Text className={!selectedBlockId ? 'text-white font-semibold' : 'text-gray-700'}>
                                            No Block
                                        </Text>
                                    </TouchableOpacity>
                                    {blocks.map((block) => (
                                        <TouchableOpacity
                                            key={block.id}
                                            className={`mr-2 px-4 py-2 rounded-full ${selectedBlockId === block.id ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                            onPress={() => setSelectedBlockId(block.id)}
                                        >
                                            <Text className={selectedBlockId === block.id ? 'text-white font-semibold' : 'text-gray-700'}>
                                                {block.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        <Text className="text-gray-700 font-semibold mb-2">Start Date (Optional)</Text>
                        <TouchableOpacity
                            className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text className={startDate ? "text-gray-900" : "text-gray-400"}>
                                {formatDate(startDate)}
                            </Text>
                            <FontAwesomeIcon icon={faPlayCircle} size={16} color="#6b7280" />
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
                            <FontAwesomeIcon icon={faCalendar} size={16} color="#6b7280" />
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
