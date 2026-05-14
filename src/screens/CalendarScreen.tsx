import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
  isSameMonth,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS, SPACING } from '../constants/theme';
import { getCycles, getProfile, getDailyLogs } from '../utils/storage';
import { isDatePeriod, isDateInFertileWindow, isDateOvulation } from '../utils/cycle';
import type { CycleRecord, DailyLog } from '../utils/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [profile, cycleData, logData] = await Promise.all([
          getProfile(),
          getCycles(),
          getDailyLogs(),
        ]);
        setCycles(cycleData);
        setCycleLength(profile.defaultCycleLength);
        setPeriodLength(profile.defaultPeriodLength);
        setLogs(logData);
      })();
    }, [])
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const lastCycle = cycles[cycles.length - 1];
  const periodStartDate = lastCycle
    ? parseISO(lastCycle.startDate)
    : new Date();

  const getDayStatus = (date: Date) => {
    if (cycles.length === 0) return 'normal';
    const isPeriod = isDatePeriod(date, periodStartDate, cycleLength, periodLength);
    const isOvDay = isDateOvulation(date, periodStartDate, cycleLength);
    const isFertile = isDateInFertileWindow(date, periodStartDate, cycleLength);

    if (isOvDay) return 'ovulation';
    if (isPeriod) return 'period';
    if (isFertile) return 'fertile';
    return 'normal';
  };

  const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
  const hasLog = (date: Date) => {
    const key = getDateKey(date);
    const log = logs[key];
    return log && (log.flow || log.symptoms.length > 0 || log.moods.length > 0);
  };

  const selectedLog = logs[getDateKey(selectedDate)];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {Array.from({ length: startPadding }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.dayCell} />
        ))}
        {days.map((date) => {
          const status = getDayStatus(date);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const logged = hasLog(date);

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={styles.dayCell}
              onPress={() => setSelectedDate(date)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayCircle,
                  status === 'period' && styles.periodDay,
                  status === 'fertile' && styles.fertileDay,
                  status === 'ovulation' && styles.ovulationDay,
                  isSelected && styles.selectedDay,
                  isToday && !isSelected && styles.todayBorder,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    (status === 'period' || isSelected) &&
                      styles.dayTextLight,
                    !isSameMonth(date, currentMonth) &&
                      styles.dayTextMuted,
                  ]}
                >
                  {format(date, 'd')}
                </Text>
              </View>
              {logged && <View style={styles.logDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fertileLight }]} />
          <Text style={styles.legendText}>Fertile</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.ovulation }]} />
          <Text style={styles.legendText}>Ovulation</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>Logged</Text>
        </View>
      </View>

      {selectedDate && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedDate}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          {selectedLog ? (
            <View>
              {selectedLog.flow && (
                <Text style={styles.logDetail}>
                  Flow: {selectedLog.flow}
                </Text>
              )}
              {selectedLog.symptoms.length > 0 && (
                <Text style={styles.logDetail}>
                  Symptoms: {selectedLog.symptoms.join(', ')}
                </Text>
              )}
              {selectedLog.moods.length > 0 && (
                <Text style={styles.logDetail}>
                  Mood: {selectedLog.moods.join(', ')}
                </Text>
              )}
              {selectedLog.notes !== '' && (
                <Text style={styles.logDetail}>
                  Notes: {selectedLog.notes}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noLog}>No data logged for this day</Text>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  monthTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.bold,
    color: COLORS.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT.size.xs,
    fontWeight: FONT.semibold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodDay: {
    backgroundColor: COLORS.primary,
  },
  fertileDay: {
    backgroundColor: COLORS.fertileLight,
  },
  ovulationDay: {
    backgroundColor: COLORS.ovulation,
  },
  selectedDay: {
    backgroundColor: COLORS.text,
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.medium,
    color: COLORS.text,
  },
  dayTextLight: {
    color: COLORS.white,
  },
  dayTextMuted: {
    color: COLORS.textLight,
  },
  logDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.secondary,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
  },
  selectedInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDate: {
    fontSize: FONT.size.md,
    fontWeight: FONT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  logDetail: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'capitalize',
  },
  noLog: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
