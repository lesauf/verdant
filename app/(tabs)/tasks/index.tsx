import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isSameDay } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../../components/schedule/CalendarView";
import DateNavigation from "../../../components/schedule/DateNavigation";
import GanttView from "../../../components/schedule/GanttView";
import ScheduleFilters from "../../../components/schedule/ScheduleFilters";
import TaskItem from "../../../components/tasks/TaskItem";
import ViewTaskModal from "../../../components/tasks/ViewTaskModal";
import { useBlockStore } from "../../../src/presentation/stores/blockStore";
import { useTaskStore } from "../../../src/presentation/stores/taskStore";

export default function TasksScreen() {
    const { tasks, loadTasks, createTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();
    const { blocks, loadBlocks } = useBlockStore();

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>('list');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'completed'>('pending');
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Load data on mount
    useEffect(() => {
        loadTasks();
        loadBlocks();
    }, []);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // 1. Block Filter
        if (selectedBlockId) {
            result = result.filter(t => t.blockId === selectedBlockId);
        }

        // 2. Status Filter
        if (statusFilter === 'pending') {
            result = result.filter(t => t.status !== 'Done');
        } else {
            result = result.filter(t => t.status === 'Done');
        }

        return result;
    }, [tasks, selectedBlockId, statusFilter]);

    // Calendar selected day tasks
    const calendarSelectedTasks = useMemo(() => {
        if (viewMode !== 'calendar') return [];
        return filteredTasks.filter(t => {
            if (statusFilter === 'completed') {
                return t.completedAt ? isSameDay(new Date(t.completedAt), currentDate) : false;
            } else {
                // Pending: check range
                let start = t.startDate ? new Date(t.startDate) : null;
                let end = t.dueDate ? new Date(t.dueDate) : null;

                if (!start && !end) return false;
                if (!start) start = end;
                if (!end) end = start;

                if (start && end) {
                    // Reset times for date comparison
                    const d = new Date(currentDate);
                    d.setHours(0, 0, 0, 0);
                    const s = new Date(start);
                    s.setHours(0, 0, 0, 0);
                    const e = new Date(end);
                    e.setHours(0, 0, 0, 0);

                    return d >= s && d <= e;
                }
                return false;
            }
        });
    }, [filteredTasks, viewMode, currentDate, statusFilter]);

    // Add task modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [selectedBlockIdForNewTask, setSelectedBlockIdForNewTask] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    // View Modal State (for Gantt/Calendar interaction)
    const [selectedTaskForView, setSelectedTaskForView] = useState<any | null>(null);

    const handleAddTask = async () => {
        if (!newTaskTitle) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        try {
            await createTask({
                title: newTaskTitle,
                description: newTaskDescription || undefined,
                status: "Todo",
                blockId: selectedBlockIdForNewTask || undefined,
                startDate: startDate || undefined,
                dueDate: dueDate || undefined,
            });

            // Reset form
            setModalVisible(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setSelectedBlockIdForNewTask(null);
            setStartDate(null);
            setDueDate(null);
        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to create task");
        }
    };

    const handleStartDateChange = (_: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const handleDueDateChange = (_: any, selectedDate?: Date) => {
        setShowDueDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "Not set";
        return date.toLocaleDateString();
    };

    const renderTaskList = (data: any[], header?: React.ReactElement) => (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={header}
            renderItem={({ item }) => (
                <TaskItem
                    task={item}
                    toggleTaskComplete={toggleTaskComplete}
                    onUpdate={(taskId, updates) => updateTask(taskId, {
                        ...updates,
                        description: updates.description ?? undefined,
                        blockId: updates.blockId ?? undefined,
                        assignedTo: updates.assignedTo ?? undefined,
                        startDate: updates.startDate ?? undefined,
                        dueDate: updates.dueDate ?? undefined,
                    })}
                    onDelete={deleteTask}
                    showBlockSelector={true}
                />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, paddingTop: 16 }}
            ListEmptyComponent={
                <View className="items-center justify-center mt-10">
                    <FontAwesome5 name="tasks" size={32} color="#d1d5db" />
                    <Text className="text-gray-400 mt-2 text-center">
                        No tasks found for this view.
                    </Text>
                </View>
            }
        />
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Page Title */}
            <View className="px-4 py-3 bg-white border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
            </View>

            <ScheduleFilters
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedBlockId={selectedBlockId}
                setSelectedBlockId={setSelectedBlockId}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                blocks={blocks}
            />

            <DateNavigation
                viewMode={viewMode}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
            />

            {viewMode === 'list' && renderTaskList(filteredTasks)}

            {viewMode === 'calendar' && renderTaskList(calendarSelectedTasks, (
                <View>
                    <CalendarView
                        tasks={filteredTasks}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                    />
                    <View className="mt-4 mb-2">
                        <Text className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            {format(currentDate, 'MMMM d, yyyy')}
                        </Text>
                    </View>
                </View>
            ))}

            {viewMode === 'gantt' && (
                <GanttView
                    tasks={filteredTasks}
                    currentDate={currentDate}
                    onTaskPress={(task) => setSelectedTaskForView(task)}
                />
            )}

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
                    <ScrollView className="bg-white rounded-t-3xl p-6" bounces={false}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">New Task</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-700 font-semibold mb-2">Task Title</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="e.g. Plant tomatoes"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Description (Optional)</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="Add details about this task..."
                            value={newTaskDescription}
                            onChangeText={setNewTaskDescription}
                            multiline
                            numberOfLines={3}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Assign to Block (Optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            <TouchableOpacity
                                className={`mr-2 px-4 py-2 rounded-full ${!selectedBlockIdForNewTask ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                onPress={() => setSelectedBlockIdForNewTask(null)}
                            >
                                <Text className={!selectedBlockIdForNewTask ? 'text-white font-semibold' : 'text-gray-700'}>
                                    No Block
                                </Text>
                            </TouchableOpacity>
                            {blocks.map((block) => (
                                <TouchableOpacity
                                    key={block.id}
                                    className={`mr-2 px-4 py-2 rounded-full ${selectedBlockIdForNewTask === block.id ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                    onPress={() => setSelectedBlockIdForNewTask(block.id)}
                                >
                                    <Text className={selectedBlockIdForNewTask === block.id ? 'text-white font-semibold' : 'text-gray-700'}>
                                        {block.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-gray-700 font-semibold mb-2">Start Date (Optional)</Text>
                        <TouchableOpacity
                            className="bg-gray-100 p-4 rounded-xl mb-4"
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text className="text-gray-900">{formatDate(startDate)}</Text>
                        </TouchableOpacity>

                        <Text className="text-gray-700 font-semibold mb-2">Due Date (Optional)</Text>
                        <TouchableOpacity
                            className="bg-gray-100 p-4 rounded-xl mb-6"
                            onPress={() => setShowDueDatePicker(true)}
                        >
                            <Text className="text-gray-900">{formatDate(dueDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-emerald-500 p-4 rounded-xl items-center"
                            onPress={handleAddTask}
                        >
                            <Text className="text-white font-bold text-lg">Create Task</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartDateChange}
                />
            )}

            {showDueDatePicker && (
                <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDueDateChange}
                />
            )}
            {/* View Task Modal (for Gantt) */}
            {selectedTaskForView && (
                <ViewTaskModal
                    visible={!!selectedTaskForView}
                    task={selectedTaskForView}
                    onClose={() => setSelectedTaskForView(null)}
                />
            )}
        </SafeAreaView>
    );
}
