import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONT, PHASES } from '../constants/theme';
import type { Phase } from '../constants/theme';

interface CycleRingProps {
  currentDay: number;
  cycleLength: number;
  phase: Phase;
  size?: number;
}

export default function CycleRing({
  currentDay,
  cycleLength,
  phase,
  size = 220,
}: CycleRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = currentDay / cycleLength;
  const strokeDashoffset = circumference * (1 - progress);
  const phaseInfo = PHASES[phase];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={phaseInfo.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.emoji}>{phaseInfo.emoji}</Text>
        <Text style={styles.dayText}>Day {currentDay}</Text>
        <Text style={[styles.phaseText, { color: phaseInfo.color }]}>
          {phaseInfo.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  dayText: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.bold,
    color: COLORS.text,
  },
  phaseText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.semibold,
    marginTop: 2,
  },
});
