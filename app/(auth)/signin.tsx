import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../../src/presentation/context/AuthContext';

const { width } = Dimensions.get('window');

export default function SignInScreen() {
    const { signInWithGoogle, isLoading } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-[#0a0a0a]">
            <StatusBar style="light" />
            <View className="flex-1 px-8 justify-between py-20">
                <View className="mt-10">
                    <Text className="text-emerald-500 text-6xl font-bold tracking-tighter">Verdant</Text>
                    <Text className="text-gray-400 text-xl font-medium mt-2">Precision modular farming.</Text>
                </View>

                <View className="items-center">
                    <View className="w-20 h-20 bg-emerald-500/10 rounded-3xl items-center justify-center mb-8 border border-emerald-500/20">
                        <View className="w-10 h-10 bg-emerald-500 rounded-xl" />
                    </View>
                    <Text className="text-white text-3xl font-semibold mb-2">Welcome Back</Text>
                    <Text className="text-gray-500 text-center mb-10 text-base leading-6">
                        Sign in to manage your farms, blocks, and tasks seamlessly with local-first precision.
                    </Text>

                    <TouchableOpacity
                        onPress={signInWithGoogle}
                        disabled={isLoading}
                        activeOpacity={0.8}
                        style={{ width: width - 64 }}
                        className="bg-white h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-emerald-500/10"
                    >
                        {isLoading ? (
                            <Text className="text-black text-lg font-bold">Authenticating...</Text>
                        ) : (
                            <View className="flex-row items-center">
                                {/* Simple Google-colored circles representation */}
                                <View className="flex-row mr-3">
                                    <View className="w-2 h-2 rounded-full bg-red-500 mr-0.5" />
                                    <View className="w-2 h-2 rounded-full bg-blue-500 mr-0.5" />
                                    <View className="w-2 h-2 rounded-full bg-yellow-500 mr-0.5" />
                                    <View className="w-2 h-2 rounded-full bg-green-500" />
                                </View>
                                <Text className="text-black text-lg font-bold">Sign In with Google</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {isLoading && (
                        <View className="mt-6 flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                            <Text className="text-emerald-500 font-medium">Connecting to secure vault...</Text>
                        </View>
                    )}
                </View>

                <View className="items-center">
                    <Text className="text-gray-600 text-xs text-center px-4">
                        By continuing, you agree to Verdant&apos;s
                        <Text className="text-gray-500 font-medium"> Terms of Service </Text>
                        and
                        <Text className="text-gray-500 font-medium"> Privacy Policy</Text>.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
