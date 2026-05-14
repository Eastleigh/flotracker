import type { Phase } from '../constants/theme';

export interface UserProfile {
  name: string;
  defaultCycleLength: number;
  defaultPeriodLength: number;
  onboardingComplete: boolean;
  trackingGoals: string[];
}

export interface CycleRecord {
  startDate: string; // ISO date string
  endDate: string | null;
  cycleLength: number | null;
}

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  flow: string | null;
  symptoms: string[];
  moods: string[];
  notes: string;
  intimacy: boolean;
}

export interface CycleInfo {
  currentDay: number;
  cycleLength: number;
  phase: Phase;
  daysUntilPeriod: number;
  periodStartDate: string;
  nextPeriodDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  isPeriodDay: boolean;
  isFertileDay: boolean;
  isOvulationDay: boolean;
}

export interface InsightData {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleRegularity: 'regular' | 'irregular' | 'insufficient_data';
  commonSymptoms: { id: string; count: number }[];
  commonMoods: { id: string; count: number }[];
  cycleLengths: number[];
}
