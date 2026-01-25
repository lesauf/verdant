import { format } from "date-fns";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Task } from "../../src/domain/entities/Task";

interface CalendarViewProps {
    tasks: Task[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

export default function CalendarView({ tasks, currentDate, onDateChange }: CalendarViewProps) {
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        tasks.forEach(task => {
            if (task.dueDate) {
                const dateStr = format(task.dueDate, 'yyyy-MM-dd');
                if (!marks[dateStr]) {
                    marks[dateStr] = { dots: [] };
                }

                // Add dot logic (limit to 3 for UI sake)
                if (marks[dateStr].dots.length < 3) {
                    marks[dateStr].dots.push({
                        color: task.status === 'Done' ? '#10b981' : '#f59e0b',
                        key: task.id
                    });
                }
            }
        });

        // Mark selected date
        const currentStr = format(currentDate, 'yyyy-MM-dd');
        marks[currentStr] = {
            ...marks[currentStr],
            selected: true,
            selectedColor: '#10b981'
        };

        return marks;
    }, [tasks, currentDate]);

    return (
        <View className="bg-white rounded-xl shadow-sm mx-4 mt-4 overflow-hidden">
            <Calendar
                current={format(currentDate, 'yyyy-MM-dd')}
                key={format(currentDate, 'yyyy-MM-dd')} // Force re-render on month change if needed
                onDayPress={(day: { dateString: string | number | Date; }) => {
                    onDateChange(new Date(day.dateString));
                }}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{
                    todayTextColor: '#10b981',
                    selectedDayBackgroundColor: '#10b981',
                    arrowColor: '#10b981',
                    dotColor: '#10b981',
                }}
                hideArrows={true} // We use our own navigation
                renderHeader={() => null} // We use our own header
            />
        </View>
    );
}
