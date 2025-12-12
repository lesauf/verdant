import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBlocks } from "../../../contexts/BlocksContext";
import { type Block } from "../../../data/mockData";

export default function BlocksScreen() {
    const { blocks, addBlock } = useBlocks();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newBlockName, setNewBlockName] = useState("");
    const [newBlockArea, setNewBlockArea] = useState("");

    const handleAddBlock = () => {
        if (!newBlockName || !newBlockArea) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const newBlock: Block = {
            id: String(Date.now()),
            name: newBlockName,
            areaHa: parseFloat(newBlockArea),
            status: "Prep",
            geoJson: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addBlock(newBlock);
        setModalVisible(false);
        setNewBlockName("");
        setNewBlockArea("");
    };

    const renderBlockItem = ({ item }: { item: Block }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(tabs)/blocks/${item.id}`)}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-emerald-500 flex-row justify-between items-center"
        >
            <View>
                <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                <Text className="text-gray-500">{item.areaHa} Ha • {item.status}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#9ca3af" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-gray-900">Farm Blocks</Text>
                <Text className="text-gray-500">{blocks.length} Blocks</Text>
            </View>

            <FlatList
                data={blocks}
                keyExtractor={(item) => item.id}
                renderItem={renderBlockItem}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <FontAwesome5 name="map" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-4 text-center">No blocks yet.{'\n'}Add your first block to get started.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => setModalVisible(true)}
            >
                <FontAwesome5 name="plus" size={24} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Add New Block</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-700 font-semibold mb-2">Block Name</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                            placeholder="e.g. Block A"
                            value={newBlockName}
                            onChangeText={setNewBlockName}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">Area (Ha)</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-900"
                            placeholder="e.g. 2.5"
                            keyboardType="numeric"
                            value={newBlockArea}
                            onChangeText={setNewBlockArea}
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
