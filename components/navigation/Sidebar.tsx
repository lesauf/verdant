import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useFarm } from '../../src/presentation/context/FarmContext';
import { IconSymbol } from '../ui/icon-symbol';

export function Sidebar(props: DrawerContentComponentProps) {
    const colorScheme = useColorScheme();
    const { currentFarm, availableFarms, selectFarm } = useFarm();
    const { user } = useAuth();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const activeColor = '#22c55e'; // Green-500
    const backgroundColor = theme.background;
    const textColor = theme.text;
    const secondaryTextColor = theme.icon;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <Text style={[styles.appName, { color: activeColor }]}>Verdant</Text>
                {user && (
                    <View style={styles.userSection}>
                        <Text style={[styles.userName, { color: textColor }]}>{user.displayName || 'User'}</Text>
                        <Text style={[styles.userEmail, { color: secondaryTextColor }]}>{user.email}</Text>
                    </View>
                )}
            </View>

            <ScrollView style={styles.content}>
                <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>FARMS</Text>
                {availableFarms.map((farm) => (
                    <TouchableOpacity
                        key={farm.id}
                        style={[
                            styles.farmItem,
                            currentFarm?.id === farm.id && { backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f3f4f6' }
                        ]}
                        onPress={() => {
                            selectFarm(farm.id);
                            props.navigation.closeDrawer();
                        }}
                    >
                        <IconSymbol
                            name="house.fill"
                            size={20}
                            color={currentFarm?.id === farm.id ? activeColor : secondaryTextColor}
                        />
                        <Text
                            style={[
                                styles.farmName,
                                { color: textColor },
                                currentFarm?.id === farm.id && { fontWeight: 'bold', color: activeColor }
                            ]}
                        >
                            {farm.name}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addItem}>
                    <IconSymbol name="plus" size={20} color={activeColor} />
                    <Text style={[styles.addItemText, { color: activeColor }]}>Add New Farm</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.navItem}>
                    <IconSymbol name="gear" size={20} color={secondaryTextColor} />
                    <Text style={[styles.navItemText, { color: textColor }]}>Account Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <IconSymbol name="info.circle" size={20} color={secondaryTextColor} />
                    <Text style={[styles.navItemText, { color: textColor }]}>Help & Support</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e7eb',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    userSection: {
        marginTop: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 8,
    },
    farmItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    activeFarmItem: {
        // Background handled dynamically
    },
    farmName: {
        marginLeft: 12,
        fontSize: 16,
    },
    addItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 8,
    },
    addItemText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    navItemText: {
        marginLeft: 12,
        fontSize: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e5e7eb',
    },
    logoutButton: {
        padding: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
