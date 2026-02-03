import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmRole } from '../../src/domain/entities/Farm';
import { getContainer } from '../../src/infrastructure/di/container';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useFarm } from '../../src/presentation/context/FarmContext';

export default function InviteMemberScreen() {
    const router = useRouter();
    const { currentFarm, selectFarm } = useFarm();
    const { user } = useAuth();

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<FarmRole>('worker');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        // ... (validation)

        if (!currentFarm || !user) {
            Alert.alert('Error', 'Session error. Please try again.');
            return;
        }

        setLoading(true);
        try {
            const container = getContainer();
            const inviteMemberUseCase = container.resolve('inviteMemberUseCase');

            await inviteMemberUseCase.execute({
                farmId: currentFarm.id,
                email: email.trim(),
                role: role,
                invitedByUserId: user.uid
            });

            // Refresh members by re-selecting the farm
            await selectFarm(currentFarm.id);

            Alert.alert('Success', `Invitation sent to ${email}`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Invite failed:', error);
            Alert.alert('Invite Failed', error.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 ml-2">Invite Member</Text>
            </View>

            <View className="p-6">
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <FontAwesomeIcon icon={faEnvelope} size={18} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900 text-base"
                            placeholder="colleague@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <Text className="text-gray-500 text-xs mt-1 ml-1">
                        If they don't have an account, we'll create a pending invite.
                    </Text>
                </View>

                <View className="mb-8">
                    <Text className="text-gray-700 font-semibold mb-2">Role</Text>
                    <View className="flex-row gap-3">
                        {(['worker', 'manager', 'owner'] as FarmRole[]).map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRole(r)}
                                className={`flex-1 items-center justify-center py-3 rounded-xl border ${role === r
                                    ? 'bg-emerald-50 border-emerald-500'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <Text className={`capitalize font-medium ${role === r ? 'text-emerald-700' : 'text-gray-600'
                                    }`}>
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleInvite}
                    disabled={loading}
                    className={`bg-emerald-600 py-4 rounded-xl items-center justify-center ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Send Invite</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
