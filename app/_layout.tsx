import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AppProviders } from '../contexts/AppProviders';
import { BlocksProvider } from '../contexts/BlocksContext';
import { TasksProvider } from '../contexts/TasksContext';
import "../global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Define all providers in an array
  // Order matters: outer providers first, inner providers last
  const providers = [
    BlocksProvider,
    TasksProvider,
    // Future providers can be easily added here:
    // InventoryProvider,
    // GPSProvider,
    // FinancesProvider,
    // WorkersProvider,
    // LivestockProvider,
  ];

  return (
    <AppProviders providers={providers}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="+not-found" /> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
