import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';

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
  const { Text, View } = require('react-native');
  return (
    <View
      style={{
        backgroundColor: '#FDE8ED',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: '#E07A8E',
          letterSpacing: 0.5,
        }}
      >
        PRO
      </Text>
    </View>
  );
}
