import { faMap, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlockStatus } from "../../../src/domain/entities/Block";
import { useFarm } from "../../../src/presentation/context/FarmContext";
import { useBlockStore } from "../../../src/presentation/stores";

export default function BlocksScreen() {
    const { blocks, loadBlocks, createBlock } = useBlockStore();
    const { currentFarm } = useFarm();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newBlockName, setNewBlockName] = useState("");
    const [newBlockArea, setNewBlockArea] = useState("");

    // Load blocks when farm changes
    useEffect(() => {
        if (currentFarm) {
            loadBlocks(currentFarm.id);
        }
    }, [currentFarm]);

    const handleAddBlock = async () => {
        if (!currentFarm) {
            Alert.alert("Error", "No farm selected");
            return;
        }

        if (!newBlockName || !newBlockArea) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            await createBlock(currentFarm.id, {
                name: newBlockName,
                areaHa: parseFloat(newBlockArea),
                status: "Prep" as BlockStatus,
                farmId: currentFarm.id,
            });

            setModalVisible(false);
            setNewBlockName("");
            setNewBlockArea("");
        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to create block");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Planted": return "bg-emerald-100 text-emerald-700";
            case "Prep": return "bg-amber-100 text-amber-700";
            case "Fallow": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-gray-900">Blocks</Text>
                <Text className="text-gray-500">{blocks.length} Blocks</Text>
            </View>

            <FlatList
                data={blocks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
                        onPress={() => router.push(`/blocks/${item.id}`)}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
                                <Text className="text-gray-600">{item.areaHa} Hectares</Text>
                            </View>
                            <View className={`px-4 py-2 rounded-full ${getStatusColor(item.status)}`}>
                                <Text className="font-semibold text-sm">{item.status}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <FontAwesomeIcon icon={faMap} size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-4 text-center">No blocks yet.{'\n'}Add your first block!</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => setModalVisible(true)}
            >
                <FontAwesomeIcon icon={faPlus} size={24} color="white" />
            </TouchableOpacity>

            {/* Add Block Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">New Block</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-700 font-semibold mb-2">Block Name</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="e.g. Block A"
                            value={newBlockName}
                            onChangeText={setNewBlockName}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Area (Hectares)</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-900"
                            placeholder="e.g. 2.5"
                            value={newBlockArea}
                            onChangeText={setNewBlockArea}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            className="bg-emerald-500 p-4 rounded-xl items-center"
                            onPress={handleAddBlock}
                        >
                            <Text className="text-white font-bold text-lg">Create Block</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
