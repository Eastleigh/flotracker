import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, CycleRecord, DailyLog } from './types';

const KEYS = {
  PROFILE: '@bloom_profile',
  CYCLES: '@bloom_cycles',
  DAILY_LOGS: '@bloom_daily_logs',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  defaultCycleLength: 28,
  defaultPeriodLength: 5,
  onboardingComplete: false,
  trackingGoals: [],
};

export async function getProfile(): Promise<UserProfile> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : DEFAULT_PROFILE;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function getCycles(): Promise<CycleRecord[]> {
  const data = await AsyncStorage.getItem(KEYS.CYCLES);
  return data ? JSON.parse(data) : [];
}

export async function saveCycles(cycles: CycleRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CYCLES, JSON.stringify(cycles));
}

export async function getDailyLogs(): Promise<Record<string, DailyLog>> {
  const data = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
  return data ? JSON.parse(data) : {};
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  const logs = await getDailyLogs();
  logs[log.date] = log;
  await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(logs));
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const logs = await getDailyLogs();
  return logs[date] || null;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.PROFILE, KEYS.CYCLES, KEYS.DAILY_LOGS]);
}
