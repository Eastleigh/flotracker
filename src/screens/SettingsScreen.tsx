import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';
import {
  getProfile,
  saveProfile,
  getDailyLogs,
  getCycles,
  clearAllData,
} from '../utils/storage';
import type { UserProfile } from '../utils/types';

function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && styles.dangerText]}>
        {label}
      </Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editingCycle, setEditingCycle] = useState(false);
  const [cycleInput, setCycleInput] = useState('');
  const [editingPeriod, setEditingPeriod] = useState(false);
  const [periodInput, setPeriodInput] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await getProfile();
        setProfile(p);
        setNameInput(p.name);
        setCycleInput(String(p.defaultCycleLength));
        setPeriodInput(String(p.defaultPeriodLength));

        const [logs, cycles] = await Promise.all([
          getDailyLogs(),
          getCycles(),
        ]);
        setTotalLogs(Object.keys(logs).length);
        setTotalCycles(cycles.length);
      })();
    }, [])
  );

  const updateName = async () => {
    if (!profile) return;
    const updated = { ...profile, name: nameInput.trim() };
    await saveProfile(updated);
    setProfile(updated);
    setEditingName(false);
  };

  const updateCycleLength = async () => {
    if (!profile) return;
    const len = parseInt(cycleInput, 10);
    if (isNaN(len) || len < 21 || len > 45) {
      Alert.alert('Invalid', 'Cycle length should be between 21-45 days.');
      return;
    }
    const updated = { ...profile, defaultCycleLength: len };
    await saveProfile(updated);
    setProfile(updated);
    setEditingCycle(false);
  };

  const updatePeriodLength = async () => {
    if (!profile) return;
    const len = parseInt(periodInput, 10);
    if (isNaN(len) || len < 1 || len > 10) {
      Alert.alert('Invalid', 'Period length should be between 1-10 days.');
      return;
    }
    const updated = { ...profile, defaultPeriodLength: len };
    await saveProfile(updated);
    setProfile(updated);
    setEditingPeriod(false);
  };

  const handleExport = async () => {
    const [logs, cycles, prof] = await Promise.all([
      getDailyLogs(),
      getCycles(),
      getProfile(),
    ]);
    const data = JSON.stringify({ profile: prof, cycles, logs }, null, 2);
    Alert.alert(
      'Export Data',
      `Your data has ${totalLogs} logs and ${totalCycles} cycles. Data export will be available in a future update.`
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your data including cycles, logs, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            const p = await getProfile();
            setProfile(p);
            setTotalLogs(0);
            setTotalCycles(0);
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  if (!profile) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                autoFocus
              />
              <TouchableOpacity onPress={updateName}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={COLORS.fertile}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <SettingRow
              icon="👤"
              label="Name"
              value={profile.name || 'Not set'}
              onPress={() => setEditingName(true)}
            />
          )}

          {editingCycle ? (
            <View style={styles.editRow}>
              <Text style={styles.editLabel}>Cycle length (days):</Text>
              <TextInput
                style={[styles.editInput, styles.editInputSmall]}
                value={cycleInput}
                onChangeText={setCycleInput}
                keyboardType="number-pad"
                autoFocus
              />
              <TouchableOpacity onPress={updateCycleLength}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={COLORS.fertile}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <SettingRow
              icon="🔄"
              label="Cycle length"
              value={`${profile.defaultCycleLength} days`}
              onPress={() => setEditingCycle(true)}
            />
          )}

          {editingPeriod ? (
            <View style={styles.editRow}>
              <Text style={styles.editLabel}>Period length (days):</Text>
              <TextInput
                style={[styles.editInput, styles.editInputSmall]}
                value={periodInput}
                onChangeText={setPeriodInput}
                keyboardType="number-pad"
                autoFocus
              />
              <TouchableOpacity onPress={updatePeriodLength}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={COLORS.fertile}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <SettingRow
              icon="📏"
              label="Period length"
              value={`${profile.defaultPeriodLength} days`}
              onPress={() => setEditingPeriod(true)}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <SettingRow
            icon="📊"
            label="Total logs"
            value={String(totalLogs)}
          />
          <SettingRow
            icon="🔄"
            label="Tracked cycles"
            value={String(totalCycles)}
          />
          <SettingRow
            icon="📤"
            label="Export data"
            onPress={handleExport}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🗑️"
            label="Reset all data"
            onPress={handleReset}
            danger
          />
        </View>
      </View>

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Bloom</Text>
        <Text style={styles.aboutSubtitle}>Period & Cycle Tracker</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutPrivacy}>
          Your data stays on your device. Always.
        </Text>
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
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: FONT.size.md,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  dangerText: {
    color: COLORS.error,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  editLabel: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  editInput: {
    flex: 1,
    fontSize: FONT.size.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  editInputSmall: {
    flex: 0,
    width: 60,
    textAlign: 'center',
  },
  about: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  aboutTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.bold,
    color: COLORS.primary,
  },
  aboutSubtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  aboutVersion: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  aboutPrivacy: {
    fontSize: FONT.size.xs,
    color: COLORS.fertile,
    marginTop: SPACING.md,
    fontWeight: FONT.medium,
  },
});
