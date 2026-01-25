import { FontAwesome5 } from "@expo/vector-icons";
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NoteType, ShoppingItem } from "../../src/domain/entities/Note";
import { useNotesStore } from "../../src/presentation/stores/notesStore";

export default function NoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { notes, addNote, updateNote, deleteNote } = useNotesStore();

    const [title, setTitle] = useState("");
    const [type, setType] = useState<NoteType>('TEXT');
    const [content, setContent] = useState("");
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (id === 'new') {
            setIsNew(true);
            setTitle("");
            setType('TEXT'); // Default to text, maybe change logic
            setContent("");
            setItems([]);
        } else {
            const note = notes.find(n => n.id === id);
            if (note) {
                setIsNew(false);
                setTitle(note.title);
                setType(note.type);
                setContent(note.content);
                setItems(note.items);
            }
        }
    }, [id, notes]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a title");
            return;
        }

        try {
            if (isNew) {
                const newId = await addNote(title, type);
                // Update the current note with content/items immediately
                await updateNote(newId, {
                    content: type === 'TEXT' ? content : undefined,
                    items: type === 'SHOPPING_LIST' ? items : undefined
                });
                router.replace(`/notes/${newId}` as any);
            } else {
                await updateNote(id!, {
                    title,
                    content: type === 'TEXT' ? content : undefined,
                    items: type === 'SHOPPING_LIST' ? items : undefined
                });
                router.back();
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to save note");
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete", "Are you sure you want to delete this note?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await deleteNote(id!);
                    router.back();
                }
            }
        ]);
    };

    // Shopping List Helpers
    const addItem = () => {
        const newItem: ShoppingItem = {
            id: Crypto.randomUUID(),
            text: "",
            checked: false,
            price: 0
        };
        setItems([...items, newItem]);
    };

    const updateItem = (itemId: string, updates: Partial<ShoppingItem>) => {
        setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
    };

    const toggleItem = (itemId: string) => {
        setItems(items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
    };

    const removeItem = (itemId: string) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    // Calculations
    const totalChecked = items.filter(i => i.checked).reduce((sum, i) => sum + (i.price || 0), 0);
    const totalUnchecked = items.filter(i => !i.checked).reduce((sum, i) => sum + (i.price || 0), 0);
    const grandTotal = totalChecked + totalUnchecked;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>
                <TextInput
                    className="flex-1 font-bold text-xl mx-2"
                    placeholder="Note Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TouchableOpacity onPress={handleSave} className="p-2">
                    <Text className="text-emerald-600 font-bold">Save</Text>
                </TouchableOpacity>
            </View>

            {isNew && (
                <View className="flex-row bg-white p-2 justify-center border-b border-gray-100">
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-lg mr-2 ${type === 'TEXT' ? 'bg-blue-100' : 'bg-transparent'}`}
                        onPress={() => setType('TEXT')}
                    >
                        <Text className={type === 'TEXT' ? 'text-blue-700 font-semibold' : 'text-gray-500'}>Text Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-lg ${type === 'SHOPPING_LIST' ? 'bg-yellow-100' : 'bg-transparent'}`}
                        onPress={() => setType('SHOPPING_LIST')}
                    >
                        <Text className={type === 'SHOPPING_LIST' ? 'text-yellow-700 font-semibold' : 'text-gray-500'}>Shopping List</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView className="flex-1 p-4">
                {type === 'TEXT' ? (
                    <TextInput
                        className="text-base text-gray-800 leading-6 min-h-[300px]"
                        multiline
                        placeholder="Start typing..."
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />
                ) : (
                    <View className="pb-10">
                        {items.map((item, index) => (
                            <View key={item.id} className="flex-row items-center mb-3 bg-white p-2 rounded-lg shadow-sm">
                                <TouchableOpacity onPress={() => toggleItem(item.id)} className="mr-3">
                                    <View className={`w-6 h-6 rounded border-2 items-center justify-center ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {item.checked && <FontAwesome5 name="check" size={12} color="white" />}
                                    </View>
                                </TouchableOpacity>

                                <TextInput
                                    className={`flex-1 text-base mr-2 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                                    placeholder="Item name"
                                    value={item.text}
                                    onChangeText={(text) => updateItem(item.id, { text })}
                                />

                                <View className="flex-row items-center bg-gray-50 rounded px-2 py-1 mr-2">
                                    <Text className="text-gray-500 mr-1">$</Text>
                                    <TextInput
                                        className="w-16 text-right"
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        value={item.price?.toString()}
                                        onChangeText={(text) => {
                                            const price = parseFloat(text);
                                            updateItem(item.id, { price: isNaN(price) ? 0 : price });
                                        }}
                                    />
                                </View>

                                <TouchableOpacity onPress={() => removeItem(item.id)}>
                                    <FontAwesome5 name="times" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity
                            className="flex-row items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-lg mt-2"
                            onPress={addItem}
                        >
                            <FontAwesome5 name="plus" size={14} color="#6b7280" />
                            <Text className="text-gray-500 font-semibold ml-2">Add Item</Text>
                        </TouchableOpacity>

                        {/* Totals Section */}
                        <View className="mt-8 bg-white p-4 rounded-xl shadow-sm">
                            <Text className="font-bold text-gray-900 mb-3">Price Summary</Text>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500">Checked Items</Text>
                                <Text className="font-semibold text-emerald-600">${totalChecked.toFixed(2)}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500">Unchecked Items</Text>
                                <Text className="font-semibold text-gray-600">${totalUnchecked.toFixed(2)}</Text>
                            </View>
                            <View className="h-[1px] bg-gray-100 my-2" />
                            <View className="flex-row justify-between">
                                <Text className="font-bold text-lg text-gray-900">Total</Text>
                                <Text className="font-bold text-lg text-gray-900">${grandTotal.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {!isNew && (
                <View className="p-4 border-t border-gray-100 bg-white">
                    <TouchableOpacity
                        className="flex-row justify-center items-center py-3"
                        onPress={handleDelete}
                    >
                        <FontAwesome5 name="trash" size={16} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2">Delete Note</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
