import { faArrowLeft, faTruckPickup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MachineryScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 ml-2">Machinery</Text>
            </View>

            <View className="flex-1 items-center justify-center p-6">
                <View className="bg-orange-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faTruckPickup} size={40} color="#d97706" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">Machinery & Equipment</Text>
                <Text className="text-gray-500 text-center">
                    Track your tractors, harvesters, and irrigation systems. Log maintenance schedules and fuel usage.
                </Text>

                <TouchableOpacity
                    className="mt-8 bg-orange-600 px-6 py-3 rounded-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
