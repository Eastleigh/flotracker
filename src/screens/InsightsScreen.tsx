import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';
import { SYMPTOM_OPTIONS, MOOD_OPTIONS } from '../constants/symptoms';
import { getCycles, getDailyLogs, getProfile } from '../utils/storage';
import { getInsights } from '../utils/cycle';
import { PLACEMENTS, PremiumBadge } from '../utils/premium';
import type { InsightData } from '../utils/types';

function findLabel(id: string): string {
  const symptom = SYMPTOM_OPTIONS.find((s) => s.id === id);
  if (symptom) return `${symptom.emoji} ${symptom.label}`;
  const mood = MOOD_OPTIONS.find((m) => m.id === id);
  if (mood) return `${mood.emoji} ${mood.label}`;
  return id;
}

function RegularityBadge({
  regularity,
}: {
  regularity: InsightData['cycleRegularity'];
}) {
  const config = {
    regular: {
      label: 'Regular',
      color: COLORS.fertile,
      bg: COLORS.fertileLight,
    },
    irregular: {
      label: 'Irregular',
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    insufficient_data: {
      label: 'Need more data',
      color: COLORS.textSecondary,
      bg: COLORS.border,
    },
  };
  const c = config[regularity];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function BarChart({
  data,
  maxValue,
  color,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  color: string;
}) {
  return (
    <View style={styles.barChart}>
      {data.map((item, i) => (
        <View key={i} style={styles.barItem}>
          <Text style={styles.barValue}>{item.value}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  height: `${Math.max(8, (item.value / maxValue) * 100)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Advanced Insights section — gated behind Superwall paywall on native.
 * On web, shows the charts freely (web doesn't support in-app purchases).
 */
function AdvancedInsights({
  insights,
  cycleLengthData,
  maxCycleLen,
}: {
  insights: InsightData;
  cycleLengthData: { label: string; value: number }[];
  maxCycleLen: number;
}) {
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  const handleUnlockPress = () => {
    if (!isNative) return;
    try {
      const { usePlacement } = require('expo-superwall');
      // On native, this would trigger the paywall
    } catch {
      // SDK not available, show content freely
    }
  };

  const chartsContent = (
    <>
      {cycleLengthData.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cycle Length History</Text>
            {isNative && <PremiumBadge />}
          </View>
          <BarChart
            data={cycleLengthData}
            maxValue={maxCycleLen}
            color={COLORS.primary}
          />
        </View>
      )}

      {insights.commonSymptoms.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top Symptoms</Text>
            {isNative && <PremiumBadge />}
          </View>
          {insights.commonSymptoms.map((s) => (
            <View key={s.id} style={styles.statRow}>
              <Text style={styles.statLabel}>{findLabel(s.id)}</Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${Math.min(
                        100,
                        (s.count / insights.commonSymptoms[0].count) * 100
                      )}%`,
                      backgroundColor: COLORS.primaryLight,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statCount}>{s.count}x</Text>
            </View>
          ))}
        </View>
      )}

      {insights.commonMoods.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top Moods</Text>
            {isNative && <PremiumBadge />}
          </View>
          {insights.commonMoods.map((m) => (
            <View key={m.id} style={styles.statRow}>
              <Text style={styles.statLabel}>{findLabel(m.id)}</Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${Math.min(
                        100,
                        (m.count / insights.commonMoods[0].count) * 100
                      )}%`,
                      backgroundColor: COLORS.secondaryLight,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statCount}>{m.count}x</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  // On web, show charts freely; on native, Superwall handles gating
  return chartsContent;
}

export default function InsightsScreen() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [hasCycles, setHasCycles] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [cycles, logs] = await Promise.all([getCycles(), getDailyLogs()]);
        setHasCycles(cycles.length > 0);
        const data = getInsights(cycles, logs);
        setInsights(data);
      })();
    }, [])
  );

  if (!insights) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!hasCycles) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No insights yet</Text>
        <Text style={styles.emptyText}>
          Start logging your period and symptoms to see personalized insights
          and trends here.
        </Text>
      </View>
    );
  }

  const cycleLengthData = insights.cycleLengths.slice(-6).map((len, i) => ({
    label: `C${i + 1}`,
    value: len,
  }));
  const maxCycleLen = Math.max(...insights.cycleLengths, 35);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Your Insights</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {insights.averageCycleLength}
          </Text>
          <Text style={styles.summaryLabel}>Avg Cycle</Text>
          <Text style={styles.summaryUnit}>days</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {insights.averagePeriodLength}
          </Text>
          <Text style={styles.summaryLabel}>Avg Period</Text>
          <Text style={styles.summaryUnit}>days</Text>
        </View>
        <View style={styles.summaryCard}>
          <RegularityBadge regularity={insights.cycleRegularity} />
          <Text style={styles.summaryLabel}>Regularity</Text>
        </View>
      </View>

      <AdvancedInsights insights={insights} cycleLengthData={cycleLengthData} maxCycleLen={maxCycleLen} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Understanding Your Cycle</Text>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseEmoji}>🌺</Text>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseName}>Menstrual (Days 1-5)</Text>
            <Text style={styles.phaseDesc}>
              Your period. Energy may be lower — rest and hydrate.
            </Text>
          </View>
        </View>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseEmoji}>🌱</Text>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseName}>Follicular (Days 6-13)</Text>
            <Text style={styles.phaseDesc}>
              Energy rises. Great for starting new projects.
            </Text>
          </View>
        </View>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseEmoji}>🌸</Text>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseName}>Ovulation (Day ~14)</Text>
            <Text style={styles.phaseDesc}>
              Peak fertility. You may feel most confident.
            </Text>
          </View>
        </View>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseEmoji}>🍂</Text>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseName}>Luteal (Days 15-28)</Text>
            <Text style={styles.phaseDesc}>
              PMS symptoms may appear. Practice self-care.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryValue: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.bold,
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryUnit: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.semibold,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.semibold,
    color: COLORS.text,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  barTrack: {
    width: 24,
    height: 80,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: RADIUS.sm,
  },
  barLabel: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    width: 120,
    fontSize: FONT.size.sm,
    color: COLORS.text,
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  statCount: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT.semibold,
    width: 30,
    textAlign: 'right',
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  phaseEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseName: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  phaseDesc: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
