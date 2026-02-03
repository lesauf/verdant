import { faPlus, faUser, faUserClock, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmMember } from '../../src/domain/entities/Farm';
import { getContainer } from '../../src/infrastructure/di/container';
import { useFarm } from '../../src/presentation/context/FarmContext';

export default function TeamScreen() {
    const router = useRouter();
    const { view } = useLocalSearchParams<{ view: 'assignments' | 'access' }>();
    const { currentFarm } = useFarm();
    const [members, setMembers] = useState<FarmMember[]>([]);
    const [loading, setLoading] = useState(true);

    const isAccessView = view === 'access';

    useEffect(() => {
        loadMembers();
    }, [currentFarm]);

    const loadMembers = async () => {
        if (!currentFarm) return;
        setLoading(true);
        try {
            const container = getContainer();
            const farmRepository = container.resolve('farmRepository');
            const memberList = await farmRepository.getMembers(currentFarm.id);
            setMembers(memberList);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMemberItem = ({ item }: { item: FarmMember }) => {
        const isPending = item.status === 'pending';
        const displayName = item.displayName || 'Unknown Member';
        const roleLabel = item.role.charAt(0).toUpperCase() + item.role.slice(1);

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
                    <TouchableOpacity className="p-2">
                        <FontAwesomeIcon icon={faUserShield} size={16} color="#9ca3af" />
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
