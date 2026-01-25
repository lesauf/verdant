import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Block } from "../../src/domain/entities/Block";

interface ScheduleFiltersProps {
    viewMode: 'list' | 'calendar' | 'gantt';
    setViewMode: (mode: 'list' | 'calendar' | 'gantt') => void;
    selectedBlockId: string | null;
    setSelectedBlockId: (id: string | null) => void;
    blocks: Block[];
}

export default function ScheduleFilters({
    viewMode,
    setViewMode,
    selectedBlockId,
    setSelectedBlockId,
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
                    <FontAwesome5 name="list" size={14} color={viewMode === 'list' ? "#10b981" : "#6b7280"} />
                </Pressable>
                <Pressable
                    style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('calendar')}
                >
                    <FontAwesome5 name="calendar-alt" size={14} color={viewMode === 'calendar' ? "#10b981" : "#6b7280"} />
                </Pressable>
                <Pressable
                    style={[styles.toggleButton, viewMode === 'gantt' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('gantt')}
                >
                    <FontAwesome5 name="stream" size={14} color={viewMode === 'gantt' ? "#10b981" : "#6b7280"} />
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
                <View style={{ width: 16 }} />
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
