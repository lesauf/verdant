import { faCheckCircle, faExpandArrowsAlt, faMap, faTasks } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
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

    // Normalize today to midnight
    const todayStart = new Date(today);

    // Normalize task start date to midnight
    const taskStart = new Date(task.startDate);
    taskStart.setHours(0, 0, 0, 0);

    // Case 1: Starts today and has no end date
    if (!task.dueDate) {
      return taskStart.getTime() === todayStart.getTime();
    }

    // Case 2: Range includes today
    // Normalize task due date to midnight
    const taskEnd = new Date(task.dueDate);
    taskEnd.setHours(0, 0, 0, 0);

    return todayStart.getTime() >= taskStart.getTime() && todayStart.getTime() <= taskEnd.getTime();
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
            <FontAwesomeIcon icon={faMap} size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalBlocks}</Text>
            <Text className="text-white opacity-90">Total Blocks</Text>
          </View>
          <View className="bg-blue-500 p-4 rounded-xl flex-1 ml-2">
            <FontAwesomeIcon icon={faExpandArrowsAlt} size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalArea.toFixed(1)}</Text>
            <Text className="text-white opacity-90">Total Ha</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-purple-500 p-4 rounded-xl flex-1 mr-2">
            <FontAwesomeIcon icon={faTasks} size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{totalTasks}</Text>
            <Text className="text-white opacity-90">Total Tasks</Text>
          </View>
          <View className="bg-orange-500 p-4 rounded-xl flex-1 ml-2">
            <FontAwesomeIcon icon={faCheckCircle} size={24} color="white" />
            <Text className="text-white text-2xl font-bold mt-2">{completedTasks}</Text>
            <Text className="text-white opacity-90">Completed</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
