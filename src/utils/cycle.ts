import {
  differenceInDays,
  addDays,
  format,
  parseISO,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import type { Phase } from '../constants/theme';
import type { CycleInfo, CycleRecord, DailyLog, InsightData } from './types';

export function getAverageCycleLength(cycles: CycleRecord[]): number {
  const validCycles = cycles.filter(
    (c) => c.cycleLength !== null && c.cycleLength >= 21 && c.cycleLength <= 45
  );
  if (validCycles.length === 0) return 28;
  const recent = validCycles.slice(-6);
  const sum = recent.reduce((acc, c) => acc + (c.cycleLength ?? 28), 0);
  return Math.round(sum / recent.length);
}

export function getAveragePeriodLength(cycles: CycleRecord[]): number {
  const validCycles = cycles.filter(
    (c) => c.endDate !== null && c.startDate !== null
  );
  if (validCycles.length === 0) return 5;
  const recent = validCycles.slice(-6);
  const lengths = recent.map((c) =>
    differenceInDays(parseISO(c.endDate!), parseISO(c.startDate)) + 1
  );
  const sum = lengths.reduce((acc, l) => acc + l, 0);
  return Math.round(sum / lengths.length);
}

export function getCurrentPhase(
  currentDay: number,
  cycleLength: number,
  periodLength: number
): Phase {
  if (currentDay <= periodLength) return 'menstrual';
  const ovulationDay = cycleLength - 14;
  if (currentDay < ovulationDay - 2) return 'follicular';
  if (currentDay <= ovulationDay + 1) return 'ovulation';
  return 'luteal';
}

export function getCycleInfo(
  cycles: CycleRecord[],
  defaultCycleLength: number,
  defaultPeriodLength: number,
  today: Date = new Date()
): CycleInfo {
  const avgCycleLength =
    cycles.length > 0 ? getAverageCycleLength(cycles) : defaultCycleLength;
  const avgPeriodLength =
    cycles.length > 0 ? getAveragePeriodLength(cycles) : defaultPeriodLength;

  const lastCycle = cycles[cycles.length - 1];
  const periodStart = lastCycle
    ? parseISO(lastCycle.startDate)
    : addDays(today, -14);

  const currentDay = differenceInDays(today, periodStart) + 1;
  const adjustedDay =
    currentDay > avgCycleLength
      ? ((currentDay - 1) % avgCycleLength) + 1
      : currentDay;

  const phase = getCurrentPhase(adjustedDay, avgCycleLength, avgPeriodLength);
  const daysUntilPeriod = Math.max(0, avgCycleLength - adjustedDay + 1);

  const nextPeriodDate = addDays(periodStart, avgCycleLength);
  const ovulationDay = avgCycleLength - 14;
  const ovulationDate = addDays(periodStart, ovulationDay - 1);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;

  const isPeriodDay = adjustedDay <= avgPeriodLength;
  const isFertileDay = isWithinInterval(today, {
    start: fertileStart,
    end: fertileEnd,
  });
  const isOvulationDay = isSameDay(today, ovulationDate);

  return {
    currentDay: adjustedDay,
    cycleLength: avgCycleLength,
    phase,
    daysUntilPeriod,
    periodStartDate: format(periodStart, 'yyyy-MM-dd'),
    nextPeriodDate: format(nextPeriodDate, 'yyyy-MM-dd'),
    fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
    ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
  };
}

export function getDatePhase(
  date: Date,
  periodStartDate: Date,
  cycleLength: number,
  periodLength: number
): Phase {
  const dayInCycle = differenceInDays(date, periodStartDate) + 1;
  const adjustedDay =
    dayInCycle > 0
      ? ((dayInCycle - 1) % cycleLength) + 1
      : cycleLength + ((dayInCycle % cycleLength) || -cycleLength) + 1;
  return getCurrentPhase(
    adjustedDay > 0 ? adjustedDay : adjustedDay + cycleLength,
    cycleLength,
    periodLength
  );
}

export function isDateInFertileWindow(
  date: Date,
  periodStartDate: Date,
  cycleLength: number
): boolean {
  const ovulationDay = cycleLength - 14;
  const ovulationDate = addDays(periodStartDate, ovulationDay - 1);
  const fertileStart = addDays(ovulationDate, -5);
  return isWithinInterval(date, { start: fertileStart, end: ovulationDate });
}

export function isDateOvulation(
  date: Date,
  periodStartDate: Date,
  cycleLength: number
): boolean {
  const ovulationDay = cycleLength - 14;
  const ovulationDate = addDays(periodStartDate, ovulationDay - 1);
  return isSameDay(date, ovulationDate);
}

export function isDatePeriod(
  date: Date,
  periodStartDate: Date,
  cycleLength: number,
  periodLength: number
): boolean {
  const dayInCycle = differenceInDays(date, periodStartDate) + 1;
  if (dayInCycle <= 0) return false;
  const adjustedDay = ((dayInCycle - 1) % cycleLength) + 1;
  return adjustedDay <= periodLength;
}

export function getInsights(
  cycles: CycleRecord[],
  logs: Record<string, DailyLog>
): InsightData {
  const avgCycleLength = getAverageCycleLength(cycles);
  const avgPeriodLength = getAveragePeriodLength(cycles);

  const validCycles = cycles.filter(
    (c) => c.cycleLength !== null && c.cycleLength >= 21 && c.cycleLength <= 45
  );
  let regularity: InsightData['cycleRegularity'] = 'insufficient_data';
  if (validCycles.length >= 3) {
    const lengths = validCycles.map((c) => c.cycleLength!);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    regularity = maxLen - minLen <= 7 ? 'regular' : 'irregular';
  }

  const symptomCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};

  Object.values(logs).forEach((log) => {
    log.symptoms.forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
    log.moods.forEach((m) => {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
  });

  const commonSymptoms = Object.entries(symptomCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const commonMoods = Object.entries(moodCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const cycleLengths = validCycles.map((c) => c.cycleLength!);

  return {
    averageCycleLength: avgCycleLength,
    averagePeriodLength: avgPeriodLength,
    cycleRegularity: regularity,
    commonSymptoms,
    commonMoods,
    cycleLengths,
  };
}
