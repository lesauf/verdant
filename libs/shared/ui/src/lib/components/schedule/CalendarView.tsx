import { format } from "date-fns";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Task } from "domain/entities/Task";

interface CalendarViewProps {
    tasks: Task[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

export default function CalendarView({ tasks, currentDate, onDateChange }: CalendarViewProps) {
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        tasks.forEach(task => {
            // Determine range
            let start = task.startDate ? new Date(task.startDate) : null;
            let end = task.dueDate ? new Date(task.dueDate) : null;

            if (task.status === 'Done' && task.completedAt) {
                // For done tasks, only show on completed day
                start = new Date(task.completedAt);
                end = new Date(task.completedAt);
            } else if (!start && end) {
                start = end;
            } else if (start && !end) {
                end = start;
            }

            if (start && end) {
                // Iterate days
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    if (!marks[dateStr]) {
                        marks[dateStr] = { dots: [] };
                    }
                    if (marks[dateStr].dots.length < 3) {
                        // Check if dot already exists for this task to avoid duplicates if range logic is quirky
                        if (!marks[dateStr].dots.find((dot: any) => dot.key === task.id)) {
                            marks[dateStr].dots.push({
                                color: task.status === 'Done' ? '#10b981' : '#f59e0b',
                                key: task.id
                            });
                        }
                    }
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
                onDayPress={(day: { dateString: string; }) => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    onDateChange(new Date(year, month - 1, dayNum));
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
