import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import { getProfile } from './src/utils/storage';
import { PLACEMENTS } from './src/utils/premium';
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
 * Includes preloading of paywalls for instant display and error handling.
 */
function MaybeSuperwallProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  try {
    const { SuperwallProvider } = require('expo-superwall');
    return (
      <SuperwallProvider
        apiKeys={{
          ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY || 'pk_p09QrRkLdq3_B71bXtEzW',
          android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY || '',
        }}
        options={{
          logging: { level: 'warn' },
        }}
        onConfigurationError={(error: Error) => {
          console.warn('[Superwall] Configuration error:', error.message);
        }}
      >
        <SuperwallPreloader />
        {children}
      </SuperwallProvider>
    );
  } catch (e) {
    console.warn('[Superwall] Failed to load provider:', e);
    return <>{children}</>;
  }
}

/**
 * Preloads paywalls after Superwall is configured for instant display.
 */
function SuperwallPreloader() {
  if (Platform.OS === 'web') return null;

  try {
    const { useSuperwall } = require('expo-superwall');
    const PreloaderInner = () => {
      const superwall = useSuperwall();

      useEffect(() => {
        if (superwall.isConfigured && !superwall.isLoading) {
          const placements = Object.values(PLACEMENTS) as string[];
          superwall.preloadPaywalls(placements).catch((err: Error) => {
            console.warn('[Superwall] Preload error:', err.message);
          });
        }
      }, [superwall.isConfigured, superwall.isLoading]);

      return null;
    };

    return <PreloaderInner />;
  } catch {
    return null;
  }
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
