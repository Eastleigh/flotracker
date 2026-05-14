---
name: testing-landing-page
description: Test the Bloom landing page and privacy policy for bloomtracker.health. Use when verifying static HTML/CSS changes in docs/ folder.
---

# Testing Bloom Landing Page

## Overview
The landing page lives in `docs/` and is deployed via GitHub Pages. It consists of:
- `docs/index.html` — Main landing page (hero, features, comparison, phases, CTA)
- `docs/privacy.html` — Privacy policy (required for App Store / Google Play)
- `docs/icon.png` — 1024x1024 app icon
- `docs/favicon.png` — 48x48 favicon

## Test Setup
1. Open `file:///home/ubuntu/flotracker/docs/index.html` in Chrome
2. No build step, no dev server, no dependencies — pure static HTML
3. Maximize browser before recording: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`

## Key Test Areas

### 1. Content Verification
- Hero: Bloom icon loads (not broken image), gradient heading, 2 CTA buttons, privacy badge
- Features: Exactly 6 cards (Dashboard, Calendar, Logging, Insights, Predictions, Privacy)
- Comparison table: 6 rows, Bloom values in green
- Phases: 4 cards with colored top borders (pink, purple, green, yellow)
- CTA: Store badges with "Coming soon" text
- Footer: Privacy Policy, Features, Why Bloom, Contact links

### 2. Navigation
- Nav "Privacy" link → navigates to `privacy.html`
- Nav anchor links: #features, #compare, #phases scroll to correct sections
- Privacy page "Back to home" → uses `href="/"`

### 3. Privacy Policy
- 7 sections: Data Collection, Data Storage, Data You Provide, Data Deletion, Children's Privacy, Changes, Contact
- TL;DR banner at top
- 8-row summary table at bottom
- Contact email linked

### 4. Responsive Layout
- Use Chrome DevTools device toolbar (Ctrl+Shift+M with DevTools open)
- At ~400px width: feature cards stack single-column, nav links hidden
- Text should not overflow or become unreadable

## Known Limitations
- **file:// protocol**: `href="/"` links (e.g., "Back to home") resolve to filesystem root instead of index.html. This is expected — works correctly when deployed on GitHub Pages.
- **No JavaScript**: Pages are pure HTML/CSS, so no console errors to check for.
- **Store badge links**: Currently `href="#"` placeholders until app is published.

## Deployment
After merging, enable GitHub Pages:
1. Repo Settings → Pages → Source: "Deploy from a branch"
2. Branch: `base-branch`, Folder: `/docs`
3. Custom domain: `bloomtracker.health`
4. DNS: A records → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
5. CNAME: www → Eastleigh.github.io
