import { FontAwesome5 } from "@expo/vector-icons";
import { addDays, addMonths, format, subDays, subMonths } from "date-fns";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DateNavigationProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    viewMode: 'calendar' | 'gantt' | 'list';
}

export default function DateNavigation({ currentDate, onDateChange, viewMode }: DateNavigationProps) {
    if (viewMode === 'list') return null;

    const handlePrev = () => {
        if (viewMode === 'calendar') {
            onDateChange(subMonths(currentDate, 1));
        } else {
            onDateChange(subDays(currentDate, 7)); // Gantt moves by week
        }
    };

    const handleNext = () => {
        if (viewMode === 'calendar') {
            onDateChange(addMonths(currentDate, 1));
        } else {
            onDateChange(addDays(currentDate, 7));
        }
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const getLabel = () => {
        if (viewMode === 'calendar') {
            return format(currentDate, 'MMMM yyyy');
        }
        // Gantt: "Jan 12 - Jan 18"
        const endOfWeek = addDays(currentDate, 6);
        return `${format(currentDate, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
    };

    return (
        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
            <TouchableOpacity onPress={handlePrev} className="p-2">
                <FontAwesome5 name="chevron-left" size={16} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleToday}>
                <Text className="text-lg font-bold text-gray-800">{getLabel()}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} className="p-2">
                <FontAwesome5 name="chevron-right" size={16} color="#374151" />
            </TouchableOpacity>
        </View>
    );
}
