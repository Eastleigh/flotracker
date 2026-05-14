import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import CycleRing from '../components/CycleRing';
import InfoCard from '../components/InfoCard';
import { COLORS, FONT, PHASES, RADIUS, SPACING } from '../constants/theme';
import { getCycles, getProfile, getDailyLogs, saveDailyLog } from '../utils/storage';
import { getCycleInfo } from '../utils/cycle';
import type { CycleInfo, DailyLog } from '../utils/types';

const QUICK_SYMPTOMS = [
  { id: 'cramps', emoji: '😣', label: 'Cramps' },
  { id: 'headache', emoji: '🤕', label: 'Headache' },
  { id: 'fatigue', emoji: '😴', label: 'Fatigue' },
  { id: 'bloating', emoji: '🫧', label: 'Bloating' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
];

const PHASE_TIPS: Record<string, string> = {
  menstrual: 'Rest and hydrate. Your body is doing important work right now.',
  follicular: 'Energy is rising! Great time for new projects and socializing.',
  ovulation: 'You may feel most confident and energetic during this phase.',
  luteal: 'Slow down and practice self-care. Cravings are totally normal.',
};

export default function HomeScreen() {
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const loadData = useCallback(async () => {
    const [profile, cycles] = await Promise.all([getProfile(), getCycles()]);
    setUserName(profile.name);
    const info = getCycleInfo(
      cycles,
      profile.defaultCycleLength,
      profile.defaultPeriodLength
    );
    setCycleInfo(info);

    const today = format(new Date(), 'yyyy-MM-dd');
    const logs = await getDailyLogs();
    setTodayLog(logs[today] || null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const toggleQuickSymptom = useCallback(
    async (symptomId: string) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const current: DailyLog = todayLog || {
        date: today,
        flow: null,
        symptoms: [],
        moods: [],
        notes: '',
        intimacy: false,
      };

      const allTags = [...current.symptoms, ...current.moods];
      const isSelected = allTags.includes(symptomId);

      const isMood = ['happy', 'anxious'].includes(symptomId);
      let updated: DailyLog;

      if (isMood) {
        updated = {
          ...current,
          moods: isSelected
            ? current.moods.filter((m) => m !== symptomId)
            : [...current.moods, symptomId],
        };
      } else {
        updated = {
          ...current,
          symptoms: isSelected
            ? current.symptoms.filter((s) => s !== symptomId)
            : [...current.symptoms, symptomId],
        };
      }

      setTodayLog(updated);
      await saveDailyLog(updated);
    },
    [todayLog]
  );

  if (!cycleInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const greeting = userName ? `Hi ${userName}` : 'Hi there';
  const phaseInfo = PHASES[cycleInfo.phase];
  const loggedSymptoms = todayLog
    ? [...todayLog.symptoms, ...todayLog.moods]
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>{greeting} 👋</Text>
      <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      <View style={styles.ringContainer}>
        <CycleRing
          currentDay={cycleInfo.currentDay}
          cycleLength={cycleInfo.cycleLength}
          phase={cycleInfo.phase}
        />
      </View>

      <View style={styles.cardsRow}>
        <InfoCard
          title="Next Period"
          value={
            cycleInfo.daysUntilPeriod === 0
              ? 'Today'
              : `${cycleInfo.daysUntilPeriod}d`
          }
          subtitle={format(parseISO(cycleInfo.nextPeriodDate), 'MMM d')}
          icon="📅"
          color={COLORS.primary}
        />
        <View style={{ width: SPACING.md }} />
        <InfoCard
          title="Fertile Window"
          value={
            cycleInfo.isFertileDay
              ? 'Now'
              : format(parseISO(cycleInfo.fertileWindowStart), 'MMM d')
          }
          subtitle={cycleInfo.isFertileDay ? 'High chance' : 'Upcoming'}
          icon="🌸"
          color={COLORS.fertile}
        />
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipEmoji}>{phaseInfo.emoji}</Text>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{phaseInfo.label} Phase Tip</Text>
          <Text style={styles.tipText}>{PHASE_TIPS[cycleInfo.phase]}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Log</Text>
      <View style={styles.quickSymptoms}>
        {QUICK_SYMPTOMS.map((symptom) => (
          <TouchableOpacity
            key={symptom.id}
            style={[
              styles.quickChip,
              loggedSymptoms.includes(symptom.id) && styles.quickChipSelected,
            ]}
            onPress={() => toggleQuickSymptom(symptom.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickEmoji}>{symptom.emoji}</Text>
            <Text
              style={[
                styles.quickLabel,
                loggedSymptoms.includes(symptom.id) &&
                  styles.quickLabelSelected,
              ]}
            >
              {symptom.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  greeting: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.bold,
    color: COLORS.text,
  },
  date: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickSymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quickChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  quickLabel: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  quickLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: FONT.semibold,
  },
});
