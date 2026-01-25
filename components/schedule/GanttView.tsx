import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../../src/domain/entities/Task";

interface GanttViewProps {
    tasks: Task[];
    currentDate: Date;
    onTaskPress?: (task: Task) => void;
}

export default function GanttView({ tasks, currentDate, onTaskPress }: GanttViewProps) {
    const daysToShow = 7;
    const dates = Array.from({ length: daysToShow }, (_, i) => addDays(currentDate, i));

    return (
        <ScrollView className="flex-1 mt-4">
            <View className="flex-row">
                {/* Left Column: Tasks */}
                <View className="w-1/3 border-r border-gray-200 bg-white pt-10">
                    {tasks.map(task => (
                        <TouchableOpacity
                            key={task.id}
                            className="h-12 justify-center px-2 border-b border-gray-100"
                            onPress={() => onTaskPress?.(task)}
                        >
                            <Text className="text-xs font-medium text-gray-700" numberOfLines={1}>
                                {task.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Right Column: Timeline */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 bg-white">
                    <View>
                        {/* Header Row */}
                        <View className="flex-row h-10 border-b border-gray-200">
                            {dates.map(date => (
                                <View key={date.toISOString()} className="w-12 items-center justify-center border-r border-gray-100 bg-gray-50">
                                    <Text className="text-xs font-bold text-gray-500">{format(date, 'd')}</Text>
                                    <Text className="text-[10px] text-gray-400">{format(date, 'EE')}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Task Rows */}
                        {tasks.map(task => {
                            // Calculate simple bar logic
                            // If no startDate, assume 1 day at dueDate
                            // If no dueDate, assume not scheduled (handled by filter maybe?)

                            const taskStart = task.startDate ? startOfDay(task.startDate) : (task.dueDate ? startOfDay(task.dueDate) : null);
                            const taskEnd = task.dueDate ? startOfDay(task.dueDate) : taskStart;

                            return (
                                <View key={task.id} className="flex-row h-12 items-center border-b border-gray-100 relative">
                                    {dates.map(date => (
                                        <View key={date.toISOString()} className="w-12 h-full border-r border-gray-100" />
                                    ))}

                                    {/* Render Bar if visible in range */}
                                    {taskStart && taskEnd && (
                                        (() => {
                                            const viewStart = startOfDay(currentDate);
                                            // Ensure end date includes the full day
                                            const compareEnd = addDays(taskEnd, 1);

                                            // Check overlap
                                            // Task [Start, End]
                                            // View [ViewStart, ViewStart+7]

                                            const relativeStart = differenceInDays(taskStart, viewStart);
                                            const duration = differenceInDays(taskEnd, taskStart) + 1;

                                            // If task ends before view starts or starts after view ends, skip visual
                                            if (relativeStart >= daysToShow || (relativeStart + duration) <= 0) return null;

                                            // Clamping visual
                                            const visualLeft = Math.max(relativeStart * 48, 0); // 48 = w-12 (approx 48px)
                                            const visualWidth = Math.min(duration * 48, (daysToShow * 48) - visualLeft); // Clamp width to view

                                            // Determine color
                                            const bgColor = task.status === 'Done' ? 'bg-emerald-500' : 'bg-blue-500';

                                            return (
                                                <TouchableOpacity
                                                    className={`absolute h-6 rounded-md ${bgColor} opacity-80`}
                                                    style={{
                                                        left: visualLeft,
                                                        width: visualWidth - 4, // margin
                                                        marginLeft: 2
                                                    }}
                                                    onPress={() => onTaskPress?.(task)}
                                                />
                                            );
                                        })()
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
}
