import { faPlus, faTasks } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { format, isSameDay } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../../components/schedule/CalendarView";
import DateNavigation from "../../../components/schedule/DateNavigation";
import GanttView from "../../../components/schedule/GanttView";
import ScheduleFilters from "../../../components/schedule/ScheduleFilters";
import AddTaskModal from "../../../components/tasks/AddTaskModal";
import TaskItem from "../../../components/tasks/TaskItem";
import ViewTaskModal from "../../../components/tasks/ViewTaskModal";
import { useFarm } from "../../../src/presentation/context/FarmContext";
import { useBlockStore } from "../../../src/presentation/stores/blockStore";
import { useTaskStore } from "../../../src/presentation/stores/taskStore";

export default function TasksScreen() {
    const { tasks, loadTasks, createTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();
    const { blocks, loadBlocks } = useBlockStore();
    const { currentFarm } = useFarm();

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>('list');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'completed'>('pending');
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Load data when current farm changes
    useEffect(() => {
        if (currentFarm) {
            loadTasks(currentFarm.id);
            loadBlocks(currentFarm.id);
        }
    }, [currentFarm]);

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

    // View Modal State (for Gantt/Calendar interaction)
    const [selectedTaskForView, setSelectedTaskForView] = useState<any | null>(null);

    const handleAddTask = async (taskData: any) => {
        if (!currentFarm) return;

        try {
            await createTask(currentFarm.id, {
                ...taskData,
                farmId: currentFarm.id,
            });
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to create task");
        }
    };

    const renderTaskList = (data: any[], header?: React.ReactElement) => (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={header}
            renderItem={({ item }) => {
                const farmId = currentFarm?.id;
                if (!farmId) return null;

                return (
                    <TaskItem
                        task={item}
                        toggleTaskComplete={(taskId) => toggleTaskComplete(farmId, taskId)}
                        onUpdate={(taskId, updates) => updateTask(farmId, taskId, {
                            ...updates,
                            description: updates.description ?? undefined,
                            blockId: updates.blockId ?? undefined,
                            assignedTo: updates.assignedTo ?? undefined,
                            startDate: updates.startDate ?? undefined,
                            dueDate: updates.dueDate ?? undefined,
                        })}
                        onDelete={(taskId) => deleteTask(farmId, taskId)}
                        showBlockSelector={true}
                    />
                );
            }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, paddingTop: 16 }}
            ListEmptyComponent={
                <View className="items-center justify-center mt-10">
                    <FontAwesomeIcon icon={faTasks} size={32} color="#d1d5db" />
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
                <FontAwesomeIcon icon={faPlus} size={24} color="white" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <AddTaskModal
                visible={isModalVisible}
                blocks={blocks}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddTask}
            />

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
