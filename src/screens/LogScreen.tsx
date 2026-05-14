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
import { format } from 'date-fns';
import SymptomChip from '../components/SymptomChip';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';
import { FLOW_OPTIONS, SYMPTOM_OPTIONS, MOOD_OPTIONS } from '../constants/symptoms';
import { getDailyLog, saveDailyLog, getCycles, saveCycles, getProfile } from '../utils/storage';
import type { DailyLog, CycleRecord } from '../utils/types';

export default function LogScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [intimacy, setIntimacy] = useState(false);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const log = await getDailyLog(today);
        if (log) {
          setSelectedFlow(log.flow);
          setSelectedSymptoms(log.symptoms);
          setSelectedMoods(log.moods);
          setNotes(log.notes);
          setIntimacy(log.intimacy);
        } else {
          setSelectedFlow(null);
          setSelectedSymptoms([]);
          setSelectedMoods([]);
          setNotes('');
          setIntimacy(false);
        }
        setSaved(false);
      })();
    }, [today])
  );

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const selectFlow = (id: string) => {
    setSelectedFlow((prev) => (prev === id ? null : id));
    setSaved(false);
  };

  const handleSave = async () => {
    const log: DailyLog = {
      date: today,
      flow: selectedFlow,
      symptoms: selectedSymptoms,
      moods: selectedMoods,
      notes,
      intimacy,
    };
    await saveDailyLog(log);

    if (selectedFlow && selectedFlow !== 'spotting') {
      const cycles = await getCycles();
      const profile = await getProfile();
      const lastCycle = cycles[cycles.length - 1];

      if (!lastCycle || lastCycle.endDate !== null) {
        const newCycle: CycleRecord = {
          startDate: today,
          endDate: null,
          cycleLength: null,
        };
        if (lastCycle && lastCycle.startDate) {
          const lastStart = new Date(lastCycle.startDate);
          const todayDate = new Date(today);
          const diff = Math.round(
            (todayDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff >= 21 && diff <= 45) {
            lastCycle.cycleLength = diff;
          }
        }
        cycles.push(newCycle);
        await saveCycles(cycles);
      }
    } else if (!selectedFlow || selectedFlow === 'spotting') {
      const cycles = await getCycles();
      const lastCycle = cycles[cycles.length - 1];
      if (lastCycle && lastCycle.endDate === null) {
        const startDate = new Date(lastCycle.startDate);
        const todayDate = new Date(today);
        const daysSinceStart = Math.round(
          (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceStart >= 2) {
          const yesterday = new Date(todayDate);
          yesterday.setDate(yesterday.getDate() - 1);
          lastCycle.endDate = format(yesterday, 'yyyy-MM-dd');
          await saveCycles(cycles);
        }
      }
    }

    setSaved(true);
    Alert.alert('Saved', 'Your log has been saved for today.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Log Today</Text>
      <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      <Text style={styles.sectionTitle}>Flow</Text>
      <View style={styles.chipContainer}>
        {FLOW_OPTIONS.map((option) => (
          <SymptomChip
            key={option.id}
            emoji={option.emoji}
            label={option.label}
            selected={selectedFlow === option.id}
            onPress={() => selectFlow(option.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Symptoms</Text>
      <View style={styles.chipContainer}>
        {SYMPTOM_OPTIONS.map((option) => (
          <SymptomChip
            key={option.id}
            emoji={option.emoji}
            label={option.label}
            selected={selectedSymptoms.includes(option.id)}
            onPress={() => toggleSymptom(option.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Mood</Text>
      <View style={styles.chipContainer}>
        {MOOD_OPTIONS.map((option) => (
          <SymptomChip
            key={option.id}
            emoji={option.emoji}
            label={option.label}
            selected={selectedMoods.includes(option.id)}
            onPress={() => toggleMood(option.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Intimacy</Text>
      <TouchableOpacity
        style={[styles.intimacyButton, intimacy && styles.intimacyActive]}
        onPress={() => {
          setIntimacy(!intimacy);
          setSaved(false);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.intimacyEmoji}>{intimacy ? '💕' : '🤍'}</Text>
        <Text
          style={[
            styles.intimacyText,
            intimacy && styles.intimacyTextActive,
          ]}
        >
          {intimacy ? 'Yes' : 'No'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="How are you feeling today?"
        placeholderTextColor={COLORS.textLight}
        value={notes}
        onChangeText={(text) => {
          setNotes(text);
          setSaved(false);
        }}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.saveButton, saved && styles.saveButtonSaved]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {saved ? 'Saved!' : 'Save Log'}
        </Text>
      </TouchableOpacity>
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
  },
  date: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  intimacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  intimacyActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  intimacyEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  intimacyText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.medium,
    color: COLORS.textSecondary,
  },
  intimacyTextActive: {
    color: COLORS.primaryDark,
    fontWeight: FONT.semibold,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT.size.md,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonSaved: {
    backgroundColor: COLORS.fertile,
  },
  saveButtonText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.bold,
    color: COLORS.white,
  },
});
