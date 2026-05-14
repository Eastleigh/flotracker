import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';

interface SymptomChipProps {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function SymptomChip({
  emoji,
  label,
  selected,
  onPress,
}: SymptomChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
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
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 18,
    marginRight: SPACING.xs + 2,
  },
  label: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.medium,
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.primaryDark,
    fontWeight: FONT.semibold,
  },
});
