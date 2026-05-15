# Hydration Reminder

A visual water-drinking tracker that keeps you hydrated throughout the workday.

## What it does

- **Animated SVG glass** — a realistic glass fills and empties over 30 minutes as the countdown runs. The water surface has a gentle wave animation; when the glass is empty it pulses softly to signal it's time to drink.
- **30-minute timer** — counts down from 30:00 with start, pause, and reset controls. When the timer ends, it waits for you to confirm you drank before restarting.
- **Daily goal of 8 glasses** — eight water-drop icons at the bottom fill in as you log each drink, with a live `glasses / 8` counter.
- **Streak counter** — tracks how many consecutive days you've hit the 8-glass goal. Resets automatically if you miss a day, carries over at midnight if you succeeded.
- **Personalized greeting** — on first visit a modal asks for your name and displays it in the header. Stored in `localStorage` so it persists across sessions.
- **Persistence** — glasses count, streak, and last-goal date are saved to `localStorage`. On reload the app restores today's progress or resets for a new day, whichever applies.

## Tech stack

- **React 19** — UI and state management
- **Vite 8** — dev server and bundler
- **Tailwind CSS v4** — utility-first styling via the `@tailwindcss/vite` plugin
- **SVG animation** — hand-drawn trapezoid glass with CSS keyframe wave animations and clip-path water fill
- **localStorage** — client-side persistence for name, daily progress, and streak data

## Getting started

```bash
git clone https://github.com/your-username/hydration-reminder.git
cd hydration-reminder
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To build for production:

```bash
npm run build
```

## Why I built this

It's easy to spend hours at a desk and realise at the end of the day you've barely had any water. Most reminder apps are either too heavy (full habit-tracking suites) or too simple (just a notification). This app lives in a browser tab, gives you a satisfying visual cue — a glass that visibly empties — and a small daily goal to work toward. The streak counter adds just enough accountability to make it stick.
