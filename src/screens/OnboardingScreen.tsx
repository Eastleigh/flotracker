import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';
import { saveProfile, saveCycles } from '../utils/storage';
import type { UserProfile } from '../utils/types';
import { format, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [lastPeriodDaysAgo, setLastPeriodDaysAgo] = useState('14');

  const goNext = () => {
    if (step < 2) {
      const nextStep = step + 1;
      setStep(nextStep);
      scrollRef.current?.scrollTo({ x: nextStep * width, animated: true });
    } else {
      handleComplete();
    }
  };

  const goBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      scrollRef.current?.scrollTo({ x: prevStep * width, animated: true });
    }
  };

  const handleComplete = async () => {
    const profile: UserProfile = {
      name: name.trim(),
      defaultCycleLength: parseInt(cycleLength, 10) || 28,
      defaultPeriodLength: parseInt(periodLength, 10) || 5,
      onboardingComplete: true,
      trackingGoals: [],
    };
    await saveProfile(profile);

    const daysAgo = parseInt(lastPeriodDaysAgo, 10) || 14;
    const startDate = subDays(new Date(), daysAgo);
    const endDate = subDays(
      new Date(),
      daysAgo - (parseInt(periodLength, 10) || 5)
    );

    await saveCycles([
      {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        cycleLength: null,
      },
    ]);

    onComplete();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.progressContainer}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {/* Step 1: Welcome */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.emoji}>🌸</Text>
          <Text style={styles.heading}>Welcome to Bloom</Text>
          <Text style={styles.subheading}>
            Your private, simple cycle tracker.{'\n'}Let's get you set up in 30
            seconds.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name (optional)"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        </View>

        {/* Step 2: Cycle Info */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.heading}>Your Cycle</Text>
          <Text style={styles.subheading}>
            Don't worry if you're not sure — you can always adjust these later.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              How long is your typical cycle?
            </Text>
            <View style={styles.numberRow}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setCycleLength(String(Math.max(21, parseInt(cycleLength) - 1)))
                }
              >
                <Text style={styles.numberButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.numberInput}
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                textAlign="center"
              />
              <Text style={styles.unitText}>days</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setCycleLength(String(Math.min(45, parseInt(cycleLength) + 1)))
                }
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              How long does your period last?
            </Text>
            <View style={styles.numberRow}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setPeriodLength(
                    String(Math.max(1, parseInt(periodLength) - 1))
                  )
                }
              >
                <Text style={styles.numberButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.numberInput}
                value={periodLength}
                onChangeText={setPeriodLength}
                keyboardType="number-pad"
                textAlign="center"
              />
              <Text style={styles.unitText}>days</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setPeriodLength(
                    String(Math.min(10, parseInt(periodLength) + 1))
                  )
                }
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Step 3: Last Period */}
        <View style={[styles.slide, { width }]}>
          <Text style={styles.emoji}>🌺</Text>
          <Text style={styles.heading}>Last Period</Text>
          <Text style={styles.subheading}>
            When did your last period start? This helps us predict your cycle.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              My last period started about...
            </Text>
            <View style={styles.numberRow}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setLastPeriodDaysAgo(
                    String(Math.max(0, parseInt(lastPeriodDaysAgo) - 1))
                  )
                }
              >
                <Text style={styles.numberButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.numberInput}
                value={lastPeriodDaysAgo}
                onChangeText={setLastPeriodDaysAgo}
                keyboardType="number-pad"
                textAlign="center"
              />
              <Text style={styles.unitText}>days ago</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() =>
                  setLastPeriodDaysAgo(
                    String(Math.min(60, parseInt(lastPeriodDaysAgo) + 1))
                  )
                }
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.privacyNote}>
            🔒 All your data stays on your device. Always.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={goNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === 2 ? "Let's Go!" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: SPACING.xxl + SPACING.xl,
    gap: SPACING.sm,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  emoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subheading: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT.size.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: FONT.size.xl,
    color: COLORS.primary,
    fontWeight: FONT.bold,
  },
  numberInput: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.bold,
    color: COLORS.text,
    width: 60,
  },
  unitText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  },
  privacyNote: {
    fontSize: FONT.size.sm,
    color: COLORS.fertile,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontWeight: FONT.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.md,
  },
  nextButtonText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.bold,
    color: COLORS.white,
  },
});
