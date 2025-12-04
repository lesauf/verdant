import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockBlocks, mockTasks } from "../../data/mockData";

export default function DashboardScreen() {
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Calculate real stats
  const totalBlocks = mockBlocks.length;
  const totalArea = mockBlocks.reduce((sum, block) => sum + block.areaHa, 0);
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === "Done").length;
  const inProgressTasks = mockTasks.filter(t => t.status === "In Progress").length;
  const todoTasks = mockTasks.filter(t => t.status === "Todo").length;

  // Blocks by status
  const plantedBlocks = mockBlocks.filter(b => b.status === "Planted").length;
  const prepBlocks = mockBlocks.filter(b => b.status === "Prep").length;
  const fallowBlocks = mockBlocks.filter(b => b.status === "Fallow").length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Verdant</Text>
            <Text className="text-gray-500">Good Morning, Farmer</Text>
          </View>
          <View className="bg-emerald-100 p-2 rounded-full">
            <FontAwesome5 name="cloud-sun" size={24} color="#10b981" />
          </View>
        </View>

        {/* Farm Overview Stats */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Farm Overview</Text>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <FontAwesome5 name="map" size={20} color="#10b981" className="mb-2" />
              <Text className="text-2xl font-bold text-gray-900">{totalBlocks}</Text>
              <Text className="text-gray-500 text-sm">Blocks</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <FontAwesome5 name="expand-arrows-alt" size={20} color="#10b981" className="mb-2" />
              <Text className="text-2xl font-bold text-gray-900">{totalArea.toFixed(1)}</Text>
              <Text className="text-gray-500 text-sm">Hectares</Text>
            </View>
          </View>
        </View>

        {/* Tasks Stats */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Tasks Overview</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600">Total Tasks</Text>
              <Text className="text-xl font-bold text-gray-900">{totalTasks}</Text>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-emerald-50 p-3 rounded-lg">
                <Text className="text-emerald-700 font-bold text-lg">{completedTasks}</Text>
                <Text className="text-emerald-600 text-xs">Done</Text>
              </View>
              <View className="flex-1 bg-amber-50 p-3 rounded-lg">
                <Text className="text-amber-700 font-bold text-lg">{inProgressTasks}</Text>
                <Text className="text-amber-600 text-xs">In Progress</Text>
              </View>
              <View className="flex-1 bg-gray-50 p-3 rounded-lg">
                <Text className="text-gray-700 font-bold text-lg">{todoTasks}</Text>
                <Text className="text-gray-600 text-xs">To Do</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Blocks Status */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Blocks Status</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <View className="w-3 h-3 rounded-full bg-emerald-500 mb-2" />
              <Text className="text-xl font-bold text-gray-900">{plantedBlocks}</Text>
              <Text className="text-gray-500 text-sm">Planted</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <View className="w-3 h-3 rounded-full bg-amber-500 mb-2" />
              <Text className="text-xl font-bold text-gray-900">{prepBlocks}</Text>
              <Text className="text-gray-500 text-sm">Prep</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <View className="w-3 h-3 rounded-full bg-gray-400 mb-2" />
              <Text className="text-xl font-bold text-gray-900">{fallowBlocks}</Text>
              <Text className="text-gray-500 text-sm">Fallow</Text>
            </View>
          </View>
        </View>

        {/* Today's Focus */}
        <View className="mb-20">
          <Text className="text-lg font-bold text-gray-900 mb-3">Today's Focus</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <FontAwesome5 name="clipboard-check" size={16} color="#10b981" />
              <Text className="text-gray-900 font-semibold ml-2">Priority Tasks</Text>
            </View>
            {todoTasks > 0 || inProgressTasks > 0 ? (
              <Text className="text-gray-600">
                You have {todoTasks + inProgressTasks} pending task{todoTasks + inProgressTasks !== 1 ? 's' : ''} to complete
              </Text>
            ) : (
              <Text className="text-gray-600">All tasks completed! 🎉</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => setShowQuickActions(true)}
      >
        <FontAwesome5 name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Quick Actions Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showQuickActions}
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>

            <TouchableOpacity
              className="flex-row items-center bg-emerald-50 p-4 rounded-xl mb-3"
              onPress={() => {
                setShowQuickActions(false);
                router.push("/(tabs)/blocks/index");
              }}
            >
              <View className="bg-emerald-500 w-10 h-10 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="map-marked-alt" size={18} color="white" />
              </View>
              <View>
                <Text className="text-gray-900 font-semibold">Add Block</Text>
                <Text className="text-gray-500 text-sm">Create a new farm block</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-amber-50 p-4 rounded-xl mb-3"
              onPress={() => {
                setShowQuickActions(false);
                router.push("/(tabs)/tasks/index");
              }}
            >
              <View className="bg-amber-500 w-10 h-10 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="tasks" size={18} color="white" />
              </View>
              <View>
                <Text className="text-gray-900 font-semibold">Add Task</Text>
                <Text className="text-gray-500 text-sm">Create a new task</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 p-4 rounded-xl items-center mt-2"
              onPress={() => setShowQuickActions(false)}
            >
              <Text className="text-gray-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
