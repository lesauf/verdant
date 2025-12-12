import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskItem from "../../../components/TaskItem";
import { useBlocks } from "../../../contexts/BlocksContext";
import { useTasks } from "../../../contexts/TasksContext";
import { type Task } from "../../../data/mockData";

export default function TasksScreen() {
    const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useTasks();
    const { blocks } = useBlocks();
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskDescription, setEditTaskDescription] = useState("");
    const [editTaskBlockId, setEditTaskBlockId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [editStartDate, setEditStartDate] = useState<Date | null>(null);
    const [editDueDate, setEditDueDate] = useState<Date | null>(null);
    const [showEditStartDatePicker, setShowEditStartDatePicker] = useState(false);
    const [showEditDueDatePicker, setShowEditDueDatePicker] = useState(false);

    const handleAddTask = () => {
        if (!newTaskTitle) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        const newTask: Task = {
            id: String(Date.now()),
            title: newTaskTitle,
            description: newTaskDescription || undefined,
            status: "Todo",
            blockId: selectedBlockId || undefined,
            assignedTo: null,
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            createdAt: new Date(),
        };

        addTask(newTask);
        setModalVisible(false);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setSelectedBlockId(null);
        setStartDate(null);
        setDueDate(null);
    };

    const handleEditTask = () => {
        if (!editTaskTitle || !editingTask) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        updateTask(editingTask.id, {
            title: editTaskTitle,
            description: editTaskDescription || undefined,
            blockId: editTaskBlockId || undefined,
            startDate: editStartDate || undefined,
            dueDate: editDueDate || undefined
        });
        setEditModalVisible(false);
        setEditingTask(null);
        setEditTaskTitle("");
        setEditTaskDescription("");
        setEditTaskBlockId(null);
        setEditStartDate(null);
        setEditDueDate(null);
    };

    const handleDeleteTask = (taskId: string) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTask(taskId)
                }
            ]
        );
    };

    const handleToggleTaskComplete = (taskId: string) => {
        toggleTaskComplete(taskId);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description || "");
        setEditTaskBlockId(task.blockId || null);
        setEditStartDate(task.startDate ? new Date(task.startDate) : null);
        setEditDueDate(task.dueDate ? new Date(task.dueDate) : null);
        setEditModalVisible(true);
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return "No date set";
        return new Date(date).toLocaleDateString();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
                <Text className="text-gray-500">{tasks.length} Tasks</Text>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        blocks={blocks}
                        onToggleComplete={handleToggleTaskComplete}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTask}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <FontAwesome5 name="clipboard-list" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-4 text-center">No tasks yet.{'\n'}What needs to be done?</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => setModalVisible(true)}
            >
                <FontAwesome5 name="plus" size={24} color="white" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">New Task</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text className="text-gray-700 font-semibold mb-2">Task Title</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                                placeholder="e.g. Clear brush from Block A"
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                            />

                            <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                                placeholder="Add task details..."
                                value={newTaskDescription}
                                onChangeText={setNewTaskDescription}
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

                            <Text className="text-gray-700 font-semibold mb-2">Assign to Block (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                                <TouchableOpacity
                                    onPress={() => setSelectedBlockId(null)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${!selectedBlockId ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={!selectedBlockId ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>None</Text>
                                </TouchableOpacity>
                                {blocks.map(block => (
                                    <TouchableOpacity
                                        key={block.id}
                                        onPress={() => setSelectedBlockId(block.id)}
                                        className={`mr-3 px-4 py-2 rounded-full border ${selectedBlockId === block.id ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={selectedBlockId === block.id ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>{block.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </ScrollView>

                        <TouchableOpacity
                            className="bg-emerald-500 p-4 rounded-xl items-center mt-4"
                            onPress={handleAddTask}
                        >
                            <Text className="text-white font-bold text-lg">Create Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Task Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Edit Task</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text className="text-gray-700 font-semibold mb-2">Task Title</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                                placeholder="e.g. Clear brush from Block A"
                                value={editTaskTitle}
                                onChangeText={setEditTaskTitle}
                            />

                            <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                                placeholder="Add task details..."
                                value={editTaskDescription}
                                onChangeText={setEditTaskDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            <Text className="text-gray-700 font-semibold mb-2">Start Date (Optional)</Text>
                            <TouchableOpacity
                                className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                                onPress={() => setShowEditStartDatePicker(true)}
                            >
                                <Text className={editStartDate ? "text-gray-900" : "text-gray-400"}>
                                    {formatDate(editStartDate)}
                                </Text>
                                <FontAwesome5 name="play-circle" size={16} color="#6b7280" />
                            </TouchableOpacity>

                            {showEditStartDatePicker && (
                                <DateTimePicker
                                    value={editStartDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowEditStartDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) setEditStartDate(selectedDate);
                                    }}
                                />
                            )}

                            <Text className="text-gray-700 font-semibold mb-2">Due Date (Optional)</Text>
                            <TouchableOpacity
                                className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center justify-between"
                                onPress={() => setShowEditDueDatePicker(true)}
                            >
                                <Text className={editDueDate ? "text-gray-900" : "text-gray-400"}>
                                    {formatDate(editDueDate)}
                                </Text>
                                <FontAwesome5 name="calendar" size={16} color="#6b7280" />
                            </TouchableOpacity>

                            {showEditDueDatePicker && (
                                <DateTimePicker
                                    value={editDueDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowEditDueDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) setEditDueDate(selectedDate);
                                    }}
                                />
                            )}

                            <Text className="text-gray-700 font-semibold mb-2">Assign to Block (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                                <TouchableOpacity
                                    onPress={() => setEditTaskBlockId(null)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${!editTaskBlockId ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={!editTaskBlockId ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>None</Text>
                                </TouchableOpacity>
                                {blocks.map(block => (
                                    <TouchableOpacity
                                        key={block.id}
                                        onPress={() => setEditTaskBlockId(block.id)}
                                        className={`mr-3 px-4 py-2 rounded-full border ${editTaskBlockId === block.id ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={editTaskBlockId === block.id ? 'text-emerald-700 font-semibold' : 'text-gray-600'}>{block.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </ScrollView>

                        <TouchableOpacity
                            className="bg-emerald-500 p-4 rounded-xl items-center mt-4"
                            onPress={handleEditTask}
                        >
                            <Text className="text-white font-bold text-lg">Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
