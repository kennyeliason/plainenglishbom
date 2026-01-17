import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    // We'll use system fonts for now
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
          },
          headerShadowVisible: false,
          headerTintColor: isDark ? "#6b9ac4" : "#1a4a6e",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 17,
          },
          headerBackTitleVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: {
            backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: "",
            headerBackTitle: "",
          }}
        />
        <Stack.Screen
          name="[book]/index"
          options={{
            title: "Chapters",
            headerBackTitle: "",
          }}
        />
        <Stack.Screen
          name="[book]/[chapter]"
          options={{
            title: "Chapter",
            headerBackTitle: "",
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: "Not Found",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
