import { faPlus, faUser, faUserClock, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetRoleTemplatesUseCase } from '../../src/application/usecases/permissions/getRoleTemplates.usecase';
import { UpdateMemberRoleUseCase } from '../../src/application/usecases/permissions/updateMemberRole.usecase';
import { FarmMember } from '../../src/domain/entities/Farm';
import { RoleTemplate } from '../../src/domain/entities/RoleTemplate';
import { getContainer } from '../../src/infrastructure/di/container';
import { useFarm } from '../../src/presentation/context/FarmContext';

export default function TeamScreen() {
    const router = useRouter();
    const { view } = useLocalSearchParams<{ view: 'assignments' | 'access' }>();
    const { currentFarm, userRole, can } = useFarm();
    const [members, setMembers] = useState<FarmMember[]>([]);
    const [templates, setTemplates] = useState<RoleTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const isAccessView = view === 'access';

    useEffect(() => {
        loadData();
    }, [currentFarm]);

    const loadData = async () => {
        if (!currentFarm) return;
        setLoading(true);
        try {
            const container = getContainer();
            const farmRepository = container.resolve('farmRepository');
            const getRoleTemplatesUseCase = container.resolve<GetRoleTemplatesUseCase>('getRoleTemplatesUseCase');

            const [memberList, roleTemplates] = await Promise.all([
                farmRepository.getMembers(currentFarm.id),
                getRoleTemplatesUseCase.execute(currentFarm.id)
            ]);

            setMembers(memberList);
            setTemplates(roleTemplates);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        if (!currentFarm || !can('members:edit')) {
            Alert.alert('Permission Denied', 'You do not have permission to change member roles.');
            return;
        }

        // Show role selection options
        const options = templates.map(t => ({
            text: t.name,
            onPress: async () => {
                try {
                    setLoading(true);
                    const container = getContainer();
                    const updateMemberRoleUseCase = container.resolve<UpdateMemberRoleUseCase>('updateMemberRoleUseCase');
                    await updateMemberRoleUseCase.execute({
                        farmId: currentFarm.id,
                        userId,
                        roleTemplateId: t.id
                    });

                    Alert.alert('Success', 'Member role updated successfully.');
                    await loadData();
                } catch (error: any) {
                    console.error('Failed to update role:', error);
                    Alert.alert('Error', error.message || 'Failed to update role.');
                } finally {
                    setLoading(false);
                }
            }
        }));

        Alert.alert(
            'Change Role',
            'Select a new role for this member:',
            [...options, { text: 'Cancel', style: 'cancel' }]
        );
    };

    const getRoleLabel = (roleIdOrName: string) => {
        // Try to find a template with this ID
        const template = templates.find(t => t.id === roleIdOrName);
        if (template) return template.name;

        // Return capitalized name if it's a legacy role
        return roleIdOrName.charAt(0).toUpperCase() + roleIdOrName.slice(1);
    };

    const renderMemberItem = ({ item }: { item: FarmMember }) => {
        const isPending = item.status === 'pending';
        const displayName = item.displayName || 'Unknown Member';
        const roleLabel = getRoleLabel(item.role);

        return (
            <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isPending ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    <FontAwesomeIcon icon={isPending ? faUserClock : faUser} size={18} color={isPending ? '#d97706' : '#059669'} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 font-medium">{displayName}</Text>
                    <View className="flex-row items-center">
                        {isPending && (
                            <Text className="text-amber-600 text-xs mr-2 italic">Pending (Invited)</Text>
                        )}
                        <View className="bg-gray-100 px-2 py-0.5 rounded">
                            <Text className="text-gray-500 text-xs">{roleLabel}</Text>
                        </View>
                    </View>
                </View>

                {isAccessView && (
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => handleUpdateRole(item.userId, item.role)}
                        disabled={!can('members:edit')}
                    >
                        <FontAwesomeIcon icon={faUserShield} size={16} color={can('members:edit') ? "#059669" : "#9ca3af"} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                    {isAccessView ? 'Team Access & Roles' : 'Personnel & Assignments'}
                </Text>
                {isAccessView && (
                    <TouchableOpacity
                        onPress={() => router.push('/team/invite')}
                        className="bg-emerald-600 px-3 py-1.5 rounded-lg flex-row items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} size={12} color="white" />
                        <Text className="text-white font-bold ml-1.5 text-sm">Invite</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => item.userId}
                    renderItem={renderMemberItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8">
                            <Text className="text-gray-400">No members found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
