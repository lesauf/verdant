import { faCalendarAlt, faList, faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Block } from "domain/entities/Block";

interface ScheduleFiltersProps {
    viewMode: 'list' | 'calendar' | 'gantt';
    setViewMode: (mode: 'list' | 'calendar' | 'gantt') => void;
    selectedBlockId: string | null;
    setSelectedBlockId: (id: string | null) => void;
    blocks: Block[];
    statusFilter: 'pending' | 'completed';
    setStatusFilter: (status: 'pending' | 'completed') => void;
}

export default function ScheduleFilters({
    viewMode,
    setViewMode,
    selectedBlockId,
    setSelectedBlockId,
    statusFilter,
    setStatusFilter,
    blocks
}: ScheduleFiltersProps) {
    return (
        <View style={styles.container}>
            {/* View Mode Toggle */}
            <View style={styles.toggleContainer}>
                <Pressable
                    style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('list')}
                >
                    <FontAwesomeIcon icon={faList} size={14} color={viewMode === 'list' ? "#10b981" : "#6b7280"} />
                </Pressable>
                <Pressable
                    style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('calendar')}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} size={14} color={viewMode === 'calendar' ? "#10b981" : "#6b7280"} />
                </Pressable>
                <Pressable
                    style={[styles.toggleButton, viewMode === 'gantt' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('gantt')}
                >
                    <FontAwesomeIcon icon={faStream} size={14} color={viewMode === 'gantt' ? "#10b981" : "#6b7280"} />
                </Pressable>
            </View>

            {/* Status Filter */}
            <View style={styles.statusContainer}>
                <Pressable
                    style={[styles.statusButton, statusFilter === 'pending' && styles.statusButtonActive]}
                    onPress={() => setStatusFilter('pending')}
                >
                    <Text style={[styles.statusText, statusFilter === 'pending' && styles.statusTextActive]}>To Do</Text>
                </Pressable>
                <Pressable
                    style={[styles.statusButton, statusFilter === 'completed' && styles.statusButtonActive]}
                    onPress={() => setStatusFilter('completed')}
                >
                    <Text style={[styles.statusText, statusFilter === 'completed' && styles.statusTextActive]}>Done</Text>
                </Pressable>
            </View>

            {/* Block Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                <Pressable
                    style={[
                        styles.filterChip,
                        !selectedBlockId ? styles.filterChipActive : styles.filterChipInactive,
                        !selectedBlockId ? { backgroundColor: '#ecfdf5', borderColor: '#10b981' } : { backgroundColor: 'white', borderColor: '#e5e7eb' }
                    ]}
                    onPress={() => setSelectedBlockId(null)}
                >
                    <Text style={[styles.filterText, !selectedBlockId ? { color: '#047857', fontWeight: '600' } : { color: '#4b5563' }]}>
                        All Blocks
                    </Text>
                </Pressable>
                {blocks.map((block) => (
                    <Pressable
                        key={block.id}
                        style={[
                            styles.filterChip,
                            selectedBlockId === block.id ? { backgroundColor: '#ecfdf5', borderColor: '#10b981' } : { backgroundColor: 'white', borderColor: '#e5e7eb' }
                        ]}
                        onPress={() => setSelectedBlockId(block.id)}
                    >
                        <Text style={[styles.filterText, selectedBlockId === block.id ? { color: '#047857', fontWeight: '600' } : { color: '#4b5563' }]}>
                            {block.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 8,
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    toggleButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
    },
    statusButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    statusTextActive: {
        color: '#10b981',
        fontWeight: '600',
    },
    filterScroll: {
        paddingVertical: 12,
        paddingLeft: 16,
    },
    filterContent: {
        paddingRight: 16,
    },
    filterChip: {
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
    },
    filterChipActive: {
        backgroundColor: '#ecfdf5', // emerald-50
        borderColor: '#10b981', // emerald-500
    },
    filterChipInactive: {
        backgroundColor: 'white',
        borderColor: '#e5e7eb', // gray-200
    },
    filterText: {
        fontSize: 14,
    }
});
