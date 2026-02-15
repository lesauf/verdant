import { Permission, PermissionsByCategory } from 'domain/entities/Permission';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PermissionMatrixProps {
    permissions: Permission[];
    onPermissionToggle: (permission: Permission) => void;
    disabled?: boolean;
}

/**
 * Permission Matrix Component
 * Visual grid showing resources × actions with checkboxes
 */
export function PermissionMatrix({ permissions, onPermissionToggle, disabled = false }: PermissionMatrixProps) {
    const hasPermission = (permission: Permission): boolean => {
        // Check for exact permission or wildcard
        if (permissions.includes(permission)) return true;
        if (permissions.includes('*')) return true;

        // Check for resource wildcard (e.g., 'tasks:*')
        const resource = permission.split(':')[0];
        const wildcardPermission = `${resource}:*` as Permission;
        return permissions.includes(wildcardPermission);
    };

    const getActionFromPermission = (permission: Permission): string => {
        const action = permission.split(':')[1];
        return action.charAt(0).toUpperCase() + action.slice(1);
    };

    const getUniqueActions = (): string[] => {
        const actions = new Set<string>();
        Object.values(PermissionsByCategory).flat().forEach(permission => {
            if (!permission.endsWith(':*') && permission !== '*') {
                actions.add(getActionFromPermission(permission));
            }
        });
        return Array.from(actions).sort();
    };

    const actions = getUniqueActions();

    return (
        <ScrollView horizontal style={styles.container}>
            <View>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={[styles.cell, styles.headerCell, styles.resourceColumn]}>
                        <Text style={styles.headerText}>Resource</Text>
                    </View>
                    {actions.map(action => (
                        <View key={action} style={[styles.cell, styles.headerCell]}>
                            <Text style={styles.headerText}>{action}</Text>
                        </View>
                    ))}
                </View>

                {/* Data Rows */}
                {Object.entries(PermissionsByCategory).map(([category, categoryPermissions]) => {
                    const resource = categoryPermissions[0].split(':')[0];

                    return (
                        <View key={category} style={styles.dataRow}>
                            <View style={[styles.cell, styles.resourceColumn]}>
                                <Text style={styles.resourceText}>{category}</Text>
                            </View>
                            {actions.map(action => {
                                const permission = `${resource}:${action.toLowerCase()}` as Permission;
                                const isValidPermission = categoryPermissions.includes(permission);
                                const isChecked = hasPermission(permission);

                                if (!isValidPermission) {
                                    return <View key={action} style={styles.cell} />;
                                }

                                return (
                                    <TouchableOpacity
                                        key={action}
                                        style={styles.cell}
                                        onPress={() => !disabled && onPermissionToggle(permission)}
                                        disabled={disabled}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            isChecked && styles.checkboxChecked,
                                            disabled && styles.checkboxDisabled
                                        ]}>
                                            {isChecked && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#2D5016',
        backgroundColor: '#F5F5F5',
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    cell: {
        width: 80,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    headerCell: {
        backgroundColor: '#F5F5F5',
    },
    resourceColumn: {
        width: 120,
        alignItems: 'flex-start',
        paddingLeft: 12,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D5016',
    },
    resourceText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#CCC',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    checkboxChecked: {
        backgroundColor: '#4A7C2C',
        borderColor: '#4A7C2C',
    },
    checkboxDisabled: {
        opacity: 0.5,
    },
    checkmark: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
