# Bloom — Period & Cycle Tracker

A privacy-first, beautifully designed period and cycle tracking app built with Expo and React Native.

## Features

- **Cycle Tracking** — Visual cycle ring showing current day and phase
- **Calendar View** — Color-coded calendar with period, fertile window, and ovulation markers
- **Symptom Logging** — Track flow, symptoms, mood, and notes daily
- **Smart Predictions** — Cycle predictions based on your logged history
- **Insights & Analytics** — Trends for cycle length, common symptoms, and moods
- **Privacy First** — All data stored locally on your device via AsyncStorage
- **Simple Onboarding** — 3-step setup in under 30 seconds

## Tech Stack

- **Expo SDK 54** / React Native
- **TypeScript** with strict mode
- **React Navigation** (bottom tabs)
- **AsyncStorage** for local persistence
- **date-fns** for date operations
- **react-native-svg** for cycle ring visualization

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
├── App.tsx                    # Root app with navigation + onboarding
├── src/
│   ├── constants/
│   │   ├── theme.ts           # Colors, spacing, typography, phase config
│   │   └── symptoms.ts        # Flow, symptom, and mood options
│   ├── utils/
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── storage.ts         # AsyncStorage persistence layer
│   │   └── cycle.ts           # Cycle prediction algorithm
│   ├── components/
│   │   ├── CycleRing.tsx      # Circular progress ring
│   │   ├── SymptomChip.tsx    # Selectable symptom/mood chip
│   │   └── InfoCard.tsx       # Stats card component
│   └── screens/
│       ├── OnboardingScreen.tsx
│       ├── HomeScreen.tsx
│       ├── CalendarScreen.tsx
│       ├── LogScreen.tsx
│       ├── InsightsScreen.tsx
│       └── SettingsScreen.tsx
├── assets/                    # App icons and splash screen
├── app.json                   # Expo configuration
├── package.json
└── tsconfig.json
```

## Design

- Warm, calming color palette with soft rose pink (#E8838F)
- Clean, minimal interface focused on usability
- Phase-aware tips and insights
- Emoji-based symptom and mood tracking

## Privacy

All data is stored locally on your device using AsyncStorage. No data is sent to any server. No account required.
