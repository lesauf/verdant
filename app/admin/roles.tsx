import { IconSymbol } from '@/components/ui/icon-symbol';
import { GetRoleTemplatesUseCase } from '@/src/application/usecases/permissions/getRoleTemplates.usecase';
import { SyncRoleTemplatesAcrossFarmsUseCase } from '@/src/application/usecases/permissions/syncRoleTemplatesAcrossFarms.usecase';
import { UpdateRoleTemplateUseCase } from '@/src/application/usecases/permissions/updateRoleTemplate.usecase';
import { Permission } from '@/src/domain/entities/Permission';
import { RoleTemplate } from '@/src/domain/entities/RoleTemplate';
import { getContainer } from '@/src/infrastructure/di/container';
import { PermissionMatrix } from '@/src/presentation/components/permissions/PermissionMatrix';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { useFarm } from '@/src/presentation/context/FarmContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleManagementScreen() {
    const router = useRouter();
    const { currentFarm, userRole, can } = useFarm();
    const { width } = useWindowDimensions();
    const isPortrait = width < 768;
    const { user } = useAuth();
    const [templates, setTemplates] = useState<RoleTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const container = getContainer();
    const getRoleTemplatesUseCase = container.resolve<GetRoleTemplatesUseCase>('getRoleTemplatesUseCase');
    const updateRoleTemplateUseCase = container.resolve<UpdateRoleTemplateUseCase>('updateRoleTemplateUseCase');
    const syncRoleTemplatesUseCase = container.resolve<SyncRoleTemplatesAcrossFarmsUseCase>('syncRoleTemplatesAcrossFarmsUseCase');

    useEffect(() => {
        loadTemplates();
    }, [currentFarm]);

    const loadTemplates = async () => {
        if (!currentFarm) return;

        try {
            setIsLoading(true);
            const roleTemplates = await getRoleTemplatesUseCase.execute(currentFarm.id);
            setTemplates(roleTemplates);
        } catch (error) {
            console.error('Failed to load role templates:', error);
            Alert.alert('Error', 'Failed to load role templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTemplate = (template: RoleTemplate) => {
        setSelectedTemplate(template);
        setEditedPermissions([...template.permissions]);
    };

    const handlePermissionToggle = (permission: Permission) => {
        setEditedPermissions(prev => {
            if (prev.includes(permission)) {
                return prev.filter(p => p !== permission);
            } else {
                return [...prev, permission];
            }
        });
    };

    const handleSave = async () => {
        if (!selectedTemplate || !currentFarm) return;

        try {
            setIsSaving(true);
            await updateRoleTemplateUseCase.execute({
                farmId: currentFarm.id,
                templateId: selectedTemplate.id,
                permissions: editedPermissions,
            });

            Alert.alert('Success', 'Role template updated successfully');
            await loadTemplates();
            setSelectedTemplate(null);
        } catch (error: any) {
            console.error('Failed to save role template:', error);
            Alert.alert('Error', error.message || 'Failed to save role template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        if (!currentFarm || !user || userRole !== 'owner') return;

        Alert.alert(
            'Sync Role Templates',
            'This will apply these role templates to all farms where you are the owner. Existing templates will be overwritten. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sync to All Farms',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSyncing(true);
                            const results = await syncRoleTemplatesUseCase.execute(user.uid, currentFarm.id);

                            const successCount = results.filter(r => r.success).length;
                            const failCount = results.filter(r => !r.success).length;

                            Alert.alert(
                                'Sync Complete',
                                `Successfully synced to ${successCount} farm(s).${failCount > 0 ? ` Failed: ${failCount}` : ''}`
                            );
                        } catch (error: any) {
                            console.error('Failed to sync templates:', error);
                            Alert.alert('Error', error.message || 'Failed to sync templates');
                        } finally {
                            setIsSyncing(false);
                        }
                    },
                },
            ]
        );
    };

    if (!currentFarm) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Please select a farm first</Text>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#4A7C2C" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color="#059669" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Role Management</Text>
                </View>

                {can('farm:edit') && (
                    <TouchableOpacity
                        onPress={handleSync}
                        disabled={isSyncing}
                        style={[styles.syncButton, isSyncing && styles.disabledButton]}
                    >
                        {isSyncing ? (
                            <ActivityIndicator size="small" color="#059669" />
                        ) : (
                            <>
                                <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#059669" />
                                <Text style={styles.syncText}>Sync Defaults</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={[styles.content, isPortrait && styles.contentVertical]}>
                    {/* Template List */}
                    <View style={[styles.templateList, isPortrait && styles.templateListVertical]}>
                        <Text style={styles.sectionTitle}>Role Templates</Text>
                        <ScrollView horizontal={!isPortrait} style={isPortrait ? undefined : styles.templateScrollHorizontal}>
                            <View style={isPortrait ? undefined : styles.templateRowHorizontal}>
                                {templates.map(template => (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={[
                                            styles.templateCard,
                                            isPortrait && styles.templateCardVertical,
                                            selectedTemplate?.id === template.id && styles.templateCardSelected
                                        ]}
                                        onPress={() => handleSelectTemplate(template)}
                                    >
                                        <View style={styles.templateHeader}>
                                            <Text style={styles.templateName}>{template.name}</Text>
                                            {template.isSystemRole && (
                                                <View style={styles.systemBadge}>
                                                    <Text style={styles.systemBadgeText}>System</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.templateDescription} numberOfLines={2}>{template.description}</Text>
                                        <Text style={styles.templatePermissions}>
                                            {template.permissions.length} permission(s)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Permission Editor */}
                    {selectedTemplate && (
                        <View style={[styles.editorPanel, isPortrait && styles.editorPanelVertical]}>
                            <View style={styles.editorHeader}>
                                <Text style={styles.editorTitle}>Editing: {selectedTemplate.name}</Text>
                                {selectedTemplate.isSystemRole && (
                                    <Text style={styles.systemWarning}>System roles cannot be edited</Text>
                                )}
                            </View>

                            <ScrollView style={styles.matrixContainer} horizontal>
                                <PermissionMatrix
                                    permissions={editedPermissions}
                                    onPermissionToggle={handlePermissionToggle}
                                    disabled={selectedTemplate.isSystemRole}
                                />
                            </ScrollView>

                            {!selectedTemplate.isSystemRole && (
                                <View style={styles.editorActions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setSelectedTemplate(null)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                        onPress={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Save Changes</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    contentVertical: {
        flexDirection: 'column',
    },
    templateList: {
        width: 300,
        backgroundColor: '#FFF',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        padding: 16,
    },
    templateListVertical: {
        width: '100%',
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        maxHeight: 250,
    },
    templateScrollHorizontal: {
        flexGrow: 0,
    },
    templateRowHorizontal: {
        flexDirection: 'row',
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    templateCard: {
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    templateCardVertical: {
        marginBottom: 8,
    },
    templateCardSelected: {
        borderColor: '#4A7C2C',
        backgroundColor: '#F0F7ED',
    },
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    templateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    systemBadge: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    systemBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
    },
    templateDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    templatePermissions: {
        fontSize: 12,
        color: '#999',
    },
    editorPanel: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 16,
    },
    editorPanelVertical: {
        minHeight: 400,
    },
    editorHeader: {
        marginBottom: 16,
    },
    editorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    systemWarning: {
        fontSize: 13,
        color: '#F59E0B',
        fontStyle: 'italic',
    },
    matrixContainer: {
        flex: 1,
        marginBottom: 16,
    },
    editorActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CCC',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#4A7C2C',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#059669',
    },
    disabledButton: {
        opacity: 0.5,
    },
    syncText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
});
