import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Badge, Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useSavedPlans } from '@/context/SavedPlansContext';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';

function NativeTabLayout() {
  const { plans } = useSavedPlans();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journey">
        <Icon sf={{ default: 'map', selected: 'map.fill' }} />
        <Label>Journey</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        <Label>Library</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grocery">
        <Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
        <Label>Grocery</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Icon sf={{ default: 'bookmark', selected: 'bookmark.fill' }} />
        <Label>Saved</Label>
        {plans.length > 0 ? <Badge>{String(plans.length)}</Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { plans } = useSavedPlans();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="map" tintColor={color} size={24} />
            ) : (
              <Feather name="map" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book" tintColor={color} size={24} />
            ) : (
              <Feather name="book" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="cart" tintColor={color} size={24} />
            ) : (
              <Feather name="shopping-cart" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarBadge: plans.length > 0 ? plans.length : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bookmark" tintColor={color} size={24} />
            ) : (
              <Feather name="bookmark" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
