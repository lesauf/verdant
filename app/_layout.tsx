import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Sidebar } from '../components/navigation/Sidebar';
import "../global.css";
import { getContainer } from '../src/infrastructure/di/container';
import { AuthProvider } from '../src/presentation/context/AuthContext';
import { FarmProvider } from '../src/presentation/context/FarmContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const container = getContainer();

  // Resolve use cases for FarmProvider
  const getFarmsForUserUseCase = container.resolve('getFarmsForUserUseCase');
  const getFarmByIdUseCase = container.resolve('getFarmByIdUseCase');
  const createFarmUseCase = container.resolve('createFarmUseCase');
  const checkPermissionUseCase = container.resolve('checkPermissionUseCase');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <FarmProvider
          getFarmsForUserUseCase={getFarmsForUserUseCase}
          getFarmByIdUseCase={getFarmByIdUseCase}
          createFarmUseCase={createFarmUseCase}
          checkPermissionUseCase={checkPermissionUseCase}
        >
          <Drawer
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{
              headerShown: false,
              drawerType: 'front',
            }}
          >
            <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Home' }} />
          </Drawer>
        </FarmProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
