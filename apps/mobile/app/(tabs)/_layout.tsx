import { faHome, faTasks, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import "../../global.css";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = "#10b981"; // emerald-500

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colorScheme === 'dark' ? '#fff' : '#000'} />,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faHome} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="blocks/index"
        options={{
          title: "Blocks",
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faThLarge} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faTasks} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="blocks/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
