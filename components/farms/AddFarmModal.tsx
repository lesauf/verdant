import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFarm } from '../../src/presentation/context/FarmContext';
import { IconSymbol } from '../ui/icon-symbol';

interface AddFarmModalProps {
    visible: boolean;
    onClose: () => void;
}

export function AddFarmModal({ visible, onClose }: AddFarmModalProps) {
    const { createFarm, isLoading } = useFarm();
    const [farmName, setFarmName] = useState('');

    const handleSubmit = async () => {
        console.log('AddFarmModal: Handle submit for', farmName);
        if (!farmName.trim()) {
            Alert.alert('Error', 'Please enter a farm name');
            return;
        }

        try {
            console.log('AddFarmModal: Calling createFarm');
            await createFarm(farmName.trim());
            console.log('AddFarmModal: createFarm finished, closing modal');
            setFarmName('');
            onClose();
        } catch (error) {
            console.error('AddFarmModal: Error in submit', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create farm');
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalText}>Create New Farm</Text>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <IconSymbol name="xmark" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Farm Name"
                        value={farmName}
                        onChangeText={setFarmName}
                        autoFocus
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.textStyle}>Create Farm</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        borderRadius: 12,
        padding: 14,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#22c55e',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
    },
});
