---
name: testing-bloom
description: Test the Bloom period tracker app end-to-end via Expo web. Use when verifying UI, data persistence, or cycle prediction changes.
---

# Testing Bloom (Period & Cycle Tracker)

## Prerequisites

- Node.js and npm installed
- Dependencies installed: `npm install --legacy-peer-deps`
- Web dependencies: `npm install --legacy-peer-deps react-dom react-native-web`

## Starting the App

```bash
cd /home/ubuntu/flotracker
npx expo start --web --port 8081
```

Wait for "Web is waiting on http://localhost:8081" before opening the browser.

**Note**: `npx expo install` may fail with peer dependency conflicts. Always use `--legacy-peer-deps` with npm commands in this repo.

## App Structure (6 screens)

| Screen | Tab | Key Elements |
|---|---|---|
| Onboarding | (no tab — shown on first launch) | 3 steps: name → cycle length/period length → last period days ago |
| Home | Home | Greeting with name, cycle ring (Day N / Phase), Next Period card, Fertile Window card, phase tip, Quick Log chips |
| Calendar | Calendar | Monthly view with color-coded days (pink=period, green=fertile, yellow=ovulation), legend, selected day detail |
| Log | Log | Flow level, 10 symptom chips, 8 mood chips, intimacy toggle, notes textarea, Save Log button |
| Insights | Insights | Avg Cycle/Period stats, Top Symptoms/Moods bars, 4 phase education cards |
| Settings | Settings | Profile (name, cycle/period length), Data (total logs, tracked cycles), Export, Reset, app footer |

## Primary Test Flow

1. **Onboarding**: Open localhost:8081 → type name (e.g. "Luna") → Next → verify cycle=28, period=5 → Next → verify days ago=14 → "Let's Go!"
2. **Home verification**: Greeting shows entered name, cycle ring shows correct day number and phase, bottom nav has 5 tabs
3. **Log symptoms**: Click Log tab → select Medium flow → select Cramps + Fatigue → select Happy mood → click "Save Log" → verify green "Saved!" confirmation
4. **Calendar verification**: Click Calendar tab → verify today's date shows logged data (flow, symptoms, mood) → verify color-coded period/fertile/ovulation days
5. **Settings verification**: Click Settings → verify name, cycle length, period length match onboarding input → verify total logs count incremented
6. **Insights verification**: Click Insights → verify avg cycle days shown → verify logged symptoms/moods appear in frequency bars → verify 4 phase cards present

## Known Quirks

- **Peer dependency conflicts**: Always use `--legacy-peer-deps` flag with npm install commands
- **Expo web dependencies**: `react-dom` and `react-native-web` are NOT in package.json by default — install them before running web target
- **Cycle recalculation on flow log**: Logging flow (e.g. Medium) on a non-period day may trigger a new cycle start, changing the home screen from e.g. "Day 15 / Ovulation" to "Day 1 / Menstrual". This is expected behavior, not a bug.
- **Avg Period discrepancy**: Insights "Avg Period" may differ from onboarding input because it's calculated from actual cycle records, which may include auto-generated data
- **Version compatibility warnings**: Expo may warn about package version mismatches (e.g. vector-icons, react-native-screens). These warnings don't block web testing.

## Data Storage

All data is stored locally via AsyncStorage (web: localStorage). To reset state for a fresh test, clear browser localStorage or use Settings → "Reset all data".

## Devin Secrets Needed

None — this is a fully local app with no external APIs or authentication.
