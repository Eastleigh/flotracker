import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';

interface InfoCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export default function InfoCard({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.primary,
}: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flex: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.bold,
  },
  subtitle: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
