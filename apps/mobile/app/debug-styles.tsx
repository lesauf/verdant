import { Text, View } from 'react-native';

export default function DebugStyles() {
    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <View className="w-32 h-32 bg-red-500 rounded-xl mb-4" />
            <Text className="text-xl font-bold text-blue-600">
                If you see a red box and blue text, NativeWind is working!
            </Text>
            <View className="mt-4 p-4 bg-white shadow-md rounded-lg">
                <Text className="text-gray-800">
                    This checks local styles in the app folder.
                </Text>
            </View>
        </View>
    );
}
