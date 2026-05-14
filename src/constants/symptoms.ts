export interface SymptomOption {
  id: string;
  label: string;
  emoji: string;
  category: 'flow' | 'symptom' | 'mood';
}

export const FLOW_OPTIONS: SymptomOption[] = [
  { id: 'spotting', label: 'Spotting', emoji: '💧', category: 'flow' },
  { id: 'light', label: 'Light', emoji: '🩸', category: 'flow' },
  { id: 'medium', label: 'Medium', emoji: '🩸🩸', category: 'flow' },
  { id: 'heavy', label: 'Heavy', emoji: '🩸🩸🩸', category: 'flow' },
];

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: 'cramps', label: 'Cramps', emoji: '😣', category: 'symptom' },
  { id: 'headache', label: 'Headache', emoji: '🤕', category: 'symptom' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧', category: 'symptom' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴', category: 'symptom' },
  { id: 'acne', label: 'Acne', emoji: '😖', category: 'symptom' },
  { id: 'breast_tenderness', label: 'Tender breasts', emoji: '💗', category: 'symptom' },
  { id: 'backache', label: 'Backache', emoji: '🔙', category: 'symptom' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢', category: 'symptom' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫', category: 'symptom' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙', category: 'symptom' },
];

export const MOOD_OPTIONS: SymptomOption[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', category: 'mood' },
  { id: 'calm', label: 'Calm', emoji: '😌', category: 'mood' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', category: 'mood' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', category: 'mood' },
  { id: 'sad', label: 'Sad', emoji: '😢', category: 'mood' },
  { id: 'irritable', label: 'Irritable', emoji: '😤', category: 'mood' },
  { id: 'sensitive', label: 'Sensitive', emoji: '🥺', category: 'mood' },
  { id: 'confident', label: 'Confident', emoji: '💪', category: 'mood' },
];
