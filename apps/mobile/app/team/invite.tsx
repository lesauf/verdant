import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetRoleTemplatesUseCase } from 'application/usecases/permissions/getRoleTemplates.usecase';
import { RoleTemplate } from 'domain/entities/RoleTemplate';
import { getContainer } from 'infrastructure/di/container';
import { useAuth } from 'ui/context/AuthContext';
import { useFarm } from 'ui/context/FarmContext';

export default function InviteMemberScreen() {
    const router = useRouter();
    const { currentFarm, selectFarm } = useFarm();
    const { user } = useAuth();

    const [email, setEmail] = useState('');
    const [templates, setTemplates] = useState<RoleTemplate[]>([]);
    const [selectedRoleTemplateId, setSelectedRoleTemplateId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetchingTemplates, setFetchingTemplates] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, [currentFarm]);

    const loadTemplates = async () => {
        if (!currentFarm) return;
        try {
            setFetchingTemplates(true);
            const container = getContainer();
            const getRoleTemplatesUseCase = container.resolve<GetRoleTemplatesUseCase>('getRoleTemplatesUseCase');
            const roleTemplates = await getRoleTemplatesUseCase.execute(currentFarm.id);
            setTemplates(roleTemplates);

            // Default to worker if available
            const worker = roleTemplates.find(t => t.name.toLowerCase() === 'worker');
            if (worker) {
                setSelectedRoleTemplateId(worker.id);
            } else if (roleTemplates.length > 0) {
                setSelectedRoleTemplateId(roleTemplates[0].id);
            }
        } catch (error) {
            console.error('Failed to load role templates:', error);
        } finally {
            setFetchingTemplates(false);
        }
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }

        if (!selectedRoleTemplateId) {
            Alert.alert('Error', 'Please select a role.');
            return;
        }

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
                role: selectedRoleTemplateId as any, // Cast for now as we transition
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

            <ScrollView className="p-6">
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
                    {fetchingTemplates ? (
                        <ActivityIndicator color="#059669" />
                    ) : (
                        <View className="flex-row flex-wrap gap-3">
                            {templates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    onPress={() => setSelectedRoleTemplateId(template.id)}
                                    className={`items-center justify-center px-4 py-3 rounded-xl border ${selectedRoleTemplateId === template.id
                                        ? 'bg-emerald-50 border-emerald-500'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}
                                    style={{ minWidth: '45%' }}
                                >
                                    <View className="items-center">
                                        <Text className={`font-medium ${selectedRoleTemplateId === template.id ? 'text-emerald-700' : 'text-gray-600'}`}>
                                            {template.name}
                                        </Text>
                                        {template.isSystemRole && (
                                            <Text className="text-[10px] text-gray-400">System</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleInvite}
                    disabled={loading || fetchingTemplates}
                    className={`bg-emerald-600 py-4 rounded-xl items-center justify-center ${loading || fetchingTemplates ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Send Invite</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
