import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Sidebar } from '../components/navigation/Sidebar';
import "../global.css";
import { getContainer } from '../src/infrastructure/di/container';
import { AuthProvider, useAuth } from '../src/presentation/context/AuthContext';
import { FarmProvider } from '../src/presentation/context/FarmContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not authenticated and not already in auth group
      router.replace('/(auth)/signin');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return <>{children}</>;
}

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
        <AuthGuard>
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
              <Drawer.Screen
                name="(auth)/signin"
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { display: 'none' }
                }}
              />
            </Drawer>
          </FarmProvider>
        </AuthGuard>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
