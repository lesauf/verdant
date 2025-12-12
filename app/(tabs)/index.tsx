import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBlockStore } from "../../src/presentation/stores/blockStore";
import { useTaskStore } from "../../src/presentation/stores/taskStore";

export default function DashboardScreen() {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { blocks, loadBlocks } = useBlockStore();
  const { tasks, loadTasks } = useTaskStore();

  // Load data on mount
  useEffect(() => {
    loadBlocks();
    loadTasks();
  }, []);

  // Calculate real stats
  const totalBlocks = blocks.length;
  const totalArea = blocks.reduce((sum, block) => sum + block.areaHa, 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const todoTasks = tasks.filter(t => t.status === "Todo").length;

  // Blocks by status
  const plantedBlocks = blocks.filter(b => b.status === "Planted").length;
  const prepBlocks = blocks.filter(b => b.status === "Prep").length;
  const fallowBlocks = blocks.filter(b => b.status === "Fallow").length;

  // Get today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysTasks = tasks.filter(task => {
    if (!task.startDate) return false;
    const taskDate = new Date(task.startDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-gray-500 mt-1">Farm Overview</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-emerald-500 p-4 rounded-xl flex-1 mr-2">
            <FontAwesome5 name="map" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalBlocks}</Text>
            <Text className="text-white opacity-90">Total Blocks</Text>
          </View>
          <View className="bg-blue-500 p-4 rounded-xl flex-1 ml-2">
            <FontAwesome5 name="expand-arrows-alt" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalArea.toFixed(1)}</Text>
            <Text className="text-white opacity-90">Total Ha</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-purple-500 p-4 rounded-xl flex-1 mr-2">
            <FontAwesome5 name="tasks" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalTasks}</Text>
            <Text className="text-white opacity-90">Total Tasks</Text>
          </View>
          <View className="bg-orange-500 p-4 rounded-xl flex-1 ml-2">
            <FontAwesome5 name="check-circle" size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{completedTasks}</Text>
            <Text className="text-white opacity-90">Completed</Text>
          </View>
        </View>

        {/* Block Status Breakdown */}
        <View className="bg-white p-5 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Block Status</Text>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-gray-700">Planted</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{plantedBlocks}</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
              <Text className="text-gray-700">Prep</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{prepBlocks}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
              <Text className="text-gray-700">Fallow</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{fallowBlocks}</Text>
          </View>
        </View>

        {/* Task Progress */}
        <View className="bg-white p-5 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Task Progress</Text>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <Text className="text-gray-700">To Do</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{todoTasks}</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <Text className="text-gray-700">In Progress</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{inProgressTasks}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-gray-700">Done</Text>
            </View>
            <Text className="text-gray-900 font-semibold">{completedTasks}</Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View className="bg-white p-5 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Priority Tasks (Today)</Text>
          {todaysTasks.length === 0 ? (
            <Text className="text-gray-400 text-center py-4">No tasks scheduled for today</Text>
          ) : (
            todaysTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                className="bg-gray-50 p-3 rounded-lg mb-2"
                onPress={() => router.push('/tasks')}
              >
                <Text className="fontbold text-gray-900 mb-1">{task.title}</Text>
                {task.description && (
                  <Text className="text-gray-600 text-sm">{task.description}</Text>
                )}
                <View className={`mt-2 self-start px-3 py-1 rounded-full ${task.status === 'Done' ? 'bg-emerald-100' :
                    task.status === 'In Progress' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                  <Text className={`text-xs font-semibold ${task.status === 'Done' ? 'text-emerald-700' :
                      task.status === 'In Progress' ? 'text-blue-700' : 'text-red-700'
                    }`}>{task.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View className="bg-white p-5 rounded-xl shadow-sm mb-20">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>

          <TouchableOpacity
            className="bg-emerald-500 p-4 rounded-lg mb-3 flex-row items-center"
            onPress={() => router.push('/blocks')}
          >
            <FontAwesome5 name="plus-circle" size={20} color="white" />
            <Text className="text-white font-bold ml-3">Add New Block</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg flex-row items-center"
            onPress={() => router.push('/tasks')}
          >
            <FontAwesome5 name="plus-circle" size={20} color="white" />
            <Text className="text-white font-bold ml-3">Create New Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
