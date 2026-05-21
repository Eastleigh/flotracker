import React from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Premium feature definitions.
 * Free users get basic tracking; premium unlocks advanced features.
 */
export type PremiumFeature =
  | 'advanced_insights'
  | 'export_data'
  | 'unlimited_history'
  | 'custom_reminders';

/**
 * Placement names registered with Superwall dashboard.
 * These map to campaigns configured in the Superwall dashboard.
 */
export const PLACEMENTS = {
  INSIGHTS_CHARTS: 'insights_charts',
  EXPORT_DATA: 'export_data',
  UNLIMITED_HISTORY: 'unlimited_history',
  ONBOARDING_OFFER: 'onboarding_offer',
} as const;

/**
 * Check if the platform supports native Superwall SDK.
 * Superwall requires native modules — not available on web.
 */
export function isSuperwallSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Premium badge component shown on gated features.
 */
export function PremiumBadge() {
  return (
    <View style={badgeStyles.container}>
      <Text style={badgeStyles.text}>PRO</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FDE8ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E07A8E',
    letterSpacing: 0.5,
  },
});

/**
 * Loading overlay shown while paywall is being fetched.
 */
export function PaywallLoading() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.card}>
        <ActivityIndicator size="large" color="#F2A0B0" />
        <Text style={loadingStyles.text}>Loading...</Text>
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9999,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
  },
});
