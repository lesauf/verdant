import { faArrowLeft, faChevronRight, faClipboard, faPlus, faShoppingBasket, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note } from "../../src/domain/entities/Note";
import { useFarm } from "../../src/presentation/context/FarmContext";
import { useNotesStore } from "../../src/presentation/stores/notesStore";

export default function NotesListScreen() {
    const router = useRouter();
    const { notes, loadNotes } = useNotesStore();
    const { currentFarm } = useFarm();

    useEffect(() => {
        if (currentFarm) {
            loadNotes(currentFarm.id);
        }
    }, [currentFarm]);

    const renderNoteItem = ({ item }: { item: Note }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
            onPress={() => router.push(`/notes/${item.id}`)}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${item.type === 'SHOPPING_LIST' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                <FontAwesomeIcon
                    icon={item.type === 'SHOPPING_LIST' ? faShoppingBasket : faStickyNote}
                    size={18}
                    color={item.type === 'SHOPPING_LIST' ? '#d97706' : '#2563eb'}
                />
            </View>
            <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base mb-1">{item.title}</Text>
                <Text className="text-gray-500 text-xs" numberOfLines={1}>
                    {item.type === 'SHOPPING_LIST'
                        ? `${item.items.filter(i => i.checked).length}/${item.items.length} items`
                        : item.content.substring(0, 50).replace(/\n/g, ' ')}
                </Text>
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={14} color="#d1d5db" />
        </TouchableOpacity>
    );

    const handleCreate = () => {
        // Simple type selector
        router.push('/notes/new');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Notes & Lists</Text>
                <View className="w-8" />
            </View>

            <FlatList
                data={notes}
                keyExtractor={item => item.id}
                renderItem={renderNoteItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <FontAwesomeIcon icon={faClipboard} size={48} color="#e5e7eb" />
                        <Text className="text-gray-400 mt-4 text-center">No notes yet.{'\n'}Create your first list or note!</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={handleCreate}
            >
                <FontAwesomeIcon icon={faPlus} size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
