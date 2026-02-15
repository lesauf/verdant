import { faArrowLeft, faPersonCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonnelScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 ml-2">Personnel</Text>
            </View>

            <View className="flex-1 items-center justify-center p-6">
                <View className="bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faPersonCircleQuestion} size={40} color="#2563eb" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">Personnel Management</Text>
                <Text className="text-gray-500 text-center">
                    This module will allow you to manage your farm team, track labor hours, and assign tasks to specific employees.
                </Text>

                <TouchableOpacity
                    className="mt-8 bg-blue-600 px-6 py-3 rounded-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
