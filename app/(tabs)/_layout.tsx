import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const TABS = [
  { name: 'home',     route: '/(tabs)/home'     as const, icon: 'home'          as const, label: 'Home' },
  { name: 'memories', route: '/(tabs)/memories' as const, icon: 'photo-library' as const, label: 'Memories' },
  { name: 'together', route: '/(tabs)/together' as const, icon: 'favorite'      as const, label: 'Together' },
  { name: 'reflect',  route: '/(tabs)/reflect'  as const, icon: 'menu-book'     as const, label: 'Reflect' },
  { name: 'more',     route: '/(tabs)/more'     as const, icon: 'more-horiz'    as const, label: 'More' },
];

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="memories" />
        <Stack.Screen name="together" />
        <Stack.Screen name="reflect" />
        <Stack.Screen name="more" />
        <Stack.Screen name="(home)" />
      </Stack>
      <FloatingTabBar
        tabs={TABS}
        containerWidth={360}
        borderRadius={35}
        bottomMargin={20}
      />
    </View>
  );
}
