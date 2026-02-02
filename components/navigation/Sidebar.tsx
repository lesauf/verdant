import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useFarm } from '../../src/presentation/context/FarmContext';
import { AddFarmModal } from '../farms/AddFarmModal';
import { IconSymbol } from '../ui/icon-symbol';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function Sidebar(props: DrawerContentComponentProps) {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { currentFarm, availableFarms, selectFarm } = useFarm();
    const { user, signOut } = useAuth();

    const [isFarmsCollapsed, setIsFarmsCollapsed] = useState(true);
    const [isOperationsCollapsed, setIsOperationsCollapsed] = useState(false);
    const [isAssetsCollapsed, setIsAssetsCollapsed] = useState(true);
    const [isAdminCollapsed, setIsAdminCollapsed] = useState(true);

    const [isAddFarmModalVisible, setIsAddFarmModalVisible] = useState(false);
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const toggleFarms = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsFarmsCollapsed(!isFarmsCollapsed);
    };

    const toggleOperations = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOperationsCollapsed(!isOperationsCollapsed);
    };

    const toggleAssets = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsAssetsCollapsed(!isAssetsCollapsed);
    };

    const toggleAdmin = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsAdminCollapsed(!isAdminCollapsed);
    };

    const navigateTo = (path: any) => {
        router.push(path);
        props.navigation.closeDrawer();
    };

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
                {/* FARMS SECTION */}
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={toggleFarms}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>FARMS</Text>
                    <IconSymbol
                        name={isFarmsCollapsed ? "chevron.right" : "chevron.down"}
                        size={14}
                        color={secondaryTextColor}
                    />
                </TouchableOpacity>

                {!isFarmsCollapsed && (
                    <View style={styles.sectionContent}>
                        {availableFarms.map((farm) => (
                            <TouchableOpacity
                                key={farm.id}
                                style={[
                                    styles.navItem,
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
                                        styles.navItemText,
                                        { color: textColor },
                                        currentFarm?.id === farm.id && { fontWeight: 'bold', color: activeColor }
                                    ]}
                                >
                                    {farm.name}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.addItem}
                            onPress={() => setIsAddFarmModalVisible(true)}
                        >
                            <IconSymbol name="plus" size={20} color={activeColor} />
                            <Text style={[styles.addItemText, { color: activeColor }]}>Add New Farm</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.divider} />

                {/* OPERATIONS SECTION */}
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={toggleOperations}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>OPERATIONS</Text>
                    <IconSymbol
                        name={isOperationsCollapsed ? "chevron.right" : "chevron.down"}
                        size={14}
                        color={secondaryTextColor}
                    />
                </TouchableOpacity>

                {!isOperationsCollapsed && (
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/(tabs)')}>
                            <IconSymbol name="square.grid.2x2" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Dashboard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/(tabs)/blocks')}>
                            <IconSymbol name="map" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Blocks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/crops')}>
                            <IconSymbol name="leaf.fill" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Crops</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/(tabs)/tasks')}>
                            <IconSymbol name="checklist" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Tasks</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.divider} />

                {/* ASSETS SECTION */}
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={toggleAssets}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>ASSETS</Text>
                    <IconSymbol
                        name={isAssetsCollapsed ? "chevron.right" : "chevron.down"}
                        size={14}
                        color={secondaryTextColor}
                    />
                </TouchableOpacity>

                {!isAssetsCollapsed && (
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/personnel')}>
                            <IconSymbol name="person.2" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Personnel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/machinery')}>
                            <IconSymbol name="wrench.and.screwdriver" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Machinery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/livestock')}>
                            <IconSymbol name="pawprint.fill" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Livestock</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/inventories')}>
                            <IconSymbol name="shippingbox" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Inventories</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.divider} />

                {/* ADMIN SECTION */}
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={toggleAdmin}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>ADMIN</Text>
                    <IconSymbol
                        name={isAdminCollapsed ? "chevron.right" : "chevron.down"}
                        size={14}
                        color={secondaryTextColor}
                    />
                </TouchableOpacity>

                {!isAdminCollapsed && (
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/notes')}>
                            <IconSymbol name="note.text" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Notes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/members')}>
                            <IconSymbol name="person.fill" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Members</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/settings')}>
                            <IconSymbol name="gear" size={20} color={secondaryTextColor} />
                            <Text style={[styles.navItemText, { color: textColor }]}>Farm Settings</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => signOut()}
                >
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <AddFarmModal
                visible={isAddFarmModalVisible}
                onClose={() => setIsAddFarmModalVisible(false)}
            />
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    sectionContent: {
        marginLeft: 4,
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
        marginVertical: 12,
        opacity: 0.5,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginVertical: 2,
    },
    navItemText: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
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
