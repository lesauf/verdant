import { FontAwesome5 } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuItem = ({ icon, title, subtitle, color = "gray" }) => (
    <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
        <View className={`w-10 h-10 rounded-full items-center justify-center bg-${color}-100 mr-4`}>
            <FontAwesome5 name={icon} size={20} color={color === "gray" ? "#4b5563" : color} />
        </View>
        <View className="flex-1">
            <Text className="font-semibold text-gray-900">{title}</Text>
            {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
        </View>
        <FontAwesome5 name="chevron-right" size={16} color="#9ca3af" />
    </TouchableOpacity>
);

export default function MenuScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-6">Menu</Text>

                <Text className="text-gray-500 font-bold mb-3 uppercase text-xs">Production</Text>
                <MenuItem icon="seedling" title="Crops" subtitle="Manage planting & harvest" color="green" />
                <MenuItem icon="paw" title="Livestock" subtitle="Animals & Herds" color="orange" />

                <Text className="text-gray-500 font-bold mb-3 mt-6 uppercase text-xs">Resources</Text>
                <MenuItem icon="users" title="Labour" subtitle="Team & Timesheets" color="blue" />
                <MenuItem icon="boxes" title="Inventory" subtitle="Stocks & Intrants" color="purple" />

                <Text className="text-gray-500 font-bold mb-3 mt-6 uppercase text-xs">Business</Text>
                <MenuItem icon="chart-line" title="Finances" subtitle="Expenses & Revenue" color="emerald" />
                <MenuItem icon="cog" title="Settings" subtitle="App preferences" />
            </ScrollView>
        </SafeAreaView>
    );
}
