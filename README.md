# Organicles — Distribution Tracking (Expo prototype)

A clickable prototype of the distribution-tracking app: **Owner**, **Distributor**, and **Reconcile** screens, with mock data. The Distributor screen is interactive — mark each mart delivered or returned and the counts and cash collected update live.

> This is a **wireframe prototype** — structure, flow, and behaviour, not final visual design. All names and figures are illustrative. It is meant to sit on top of Ginkgo (orders would come from Ginkgo's API); here that data is mocked.

## How to run

These files use the classic `App.js` entry point. The cleanest way to run them:

```bash
# 1. Scaffold a fresh blank Expo app (pulls the current Expo SDK)
npx create-expo-app@latest organicles --template blank
cd organicles

# 2. Copy the files from this prototype into the project, replacing App.js:
#    App.js, theme.js, data.js, components.js, and the screens/ folder

# 3. Start it
npx expo start
```

Then open it with the **Expo Go** app on your phone (scan the QR code), or press `i` / `a` for the iOS / Android simulator.

## Files

| File | What it is |
|------|------------|
| `App.js` | App shell: header + bottom tab switcher between the three screens |
| `theme.js` | Colors and the rupee formatter |
| `data.js` | Mock data — replace with Ginkgo API data when building for real |
| `components.js` | Reusable UI: cards, KPI tiles, chips, buttons |
| `screens/OwnerScreen.js` | Prepare a load sheet + sheets to reconcile |
| `screens/DistributorScreen.js` | Today's sheet, live marking and cash tally |
| `screens/ReconcileScreen.js` | Cash math, exceptions, accept/hold |

## Notes for going further

- **Navigation:** this prototype uses a simple state-based tab switch to keep dependencies minimal. For a real app, consider `@react-navigation` for stack + tab navigation.
- **The real data source is Ginkgo.** Before building beyond a prototype, confirm Ginkgo's API exposes confirmed orders the way this assumes — that's still the one unverified assumption the whole plan rests on.
- This prototype has **no backend** — state lives in memory and resets on reload. Persisting sheets and reconciliation is the next real piece of work.
