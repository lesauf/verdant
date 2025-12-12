import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { type Block } from "../../data/mockData";

interface EditBlockModalProps {
    visible: boolean;
    block: Block;
    onClose: () => void;
    onSave: (name: string, area: number, status: "Planted" | "Prep" | "Fallow") => void;
}

export default function EditBlockModal({ visible, block, onClose, onSave }: EditBlockModalProps) {
    const [name, setName] = React.useState(block.name);
    const [area, setArea] = React.useState(String(block.areaHa));
    const [status, setStatus] = React.useState<"Planted" | "Prep" | "Fallow">(block.status as any);

    React.useEffect(() => {
        if (visible) {
            setName(block.name);
            setArea(String(block.areaHa));
            setStatus(block.status as any);
        }
    }, [visible, block]);

    const handleSave = () => {
        onSave(name, parseFloat(area), status);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Edit Block</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome5 name="times" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-700 font-semibold mb-2">Block Name</Text>
                    <TextInput
                        className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                        placeholder="e.g. Block A"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Area (Ha)</Text>
                    <TextInput
                        className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-900"
                        placeholder="e.g. 2.5"
                        keyboardType="numeric"
                        value={area}
                        onChangeText={setArea}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Status</Text>
                    <View className="flex-row gap-3 mb-6">
                        {(["Planted", "Prep", "Fallow"] as const).map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setStatus(s)}
                                className={`flex-1 py-3 rounded-xl border ${status === s ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`text-center font-semibold ${status === s ? 'text-emerald-700' : 'text-gray-600'}`}>
                                    {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        className="bg-emerald-500 p-4 rounded-xl items-center"
                        onPress={handleSave}
                    >
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
