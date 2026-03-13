import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TogetherThemeProvider } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "auth-screen" || segments[0] === "auth-popup" || segments[0] === "auth-callback";
    if (!user && !inAuthGroup) {
      router.replace("/auth-screen");
    }
  }, [user, loading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "SpaceMono-Bold": require("../assets/fonts/SpaceMono-Bold.ttf"),
    "SpaceMono-Italic": require("../assets/fonts/SpaceMono-Italic.ttf"),
    "SpaceMono-BoldItalic": require("../assets/fonts/SpaceMono-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <TogetherThemeProvider>
                <WidgetProvider>
                  <NavigationGuard>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="auth-screen" options={{ headerShown: false }} />
                      <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
                      <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
                      <Stack.Screen name="partner-invite" options={{ title: "Partner Invite", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="add-memory" options={{ title: "Add Memory", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="add-vent" options={{ title: "Add Vent", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="add-reflection" options={{ title: "Add Reflection", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="add-goal" options={{ title: "Add Goal", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="add-todo" options={{ title: "Add To-Do", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="customization" options={{ title: "Customize App", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="tips" options={{ title: "Relationship Tips", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="memory-detail/[id]" options={{ title: "Memory", headerBackButtonDisplayMode: "minimal" }} />
                      <Stack.Screen name="tip-detail/[id]" options={{ title: "Tip", headerBackButtonDisplayMode: "minimal" }} />
                    </Stack>
                  </NavigationGuard>
                  <SystemBars style="auto" />
                </WidgetProvider>
              </TogetherThemeProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </>
  );
}
