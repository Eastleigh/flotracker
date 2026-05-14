import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import { getProfile } from './src/utils/storage';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import LogScreen from './src/screens/LogScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { focused: IoniconsName; default: IoniconsName }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Calendar: { focused: 'calendar', default: 'calendar-outline' },
  Log: { focused: 'add-circle', default: 'add-circle-outline' },
  Insights: { focused: 'bar-chart', default: 'bar-chart-outline' },
  Settings: { focused: 'settings', default: 'settings-outline' },
};

/**
 * Conditionally wraps children with SuperwallProvider on native platforms.
 * On web, Superwall native modules are not available, so we skip the provider.
 */
function MaybeSuperwallProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  // Dynamic import to avoid loading native module on web
  const { SuperwallProvider } = require('expo-superwall');
  return (
    <SuperwallProvider
      apiKeys={{
        ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY || 'YOUR_SUPERWALL_IOS_KEY',
        android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY || 'YOUR_SUPERWALL_ANDROID_KEY',
      }}
    >
      {children}
    </SuperwallProvider>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      setShowOnboarding(!profile.onboardingComplete);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) return null;

  if (showOnboarding) {
    return (
      <MaybeSuperwallProvider>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </MaybeSuperwallProvider>
    );
  }

  return (
    <MaybeSuperwallProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              const icons = TAB_ICONS[route.name];
              const iconName = focused ? icons.focused : icons.default;
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textLight,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
              paddingBottom: 4,
              height: 56,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen
            name="Log"
            component={LogScreen}
            options={{
              tabBarLabel: 'Log',
            }}
          />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </MaybeSuperwallProvider>
  );
}
