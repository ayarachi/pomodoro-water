import { useState, useEffect, useRef } from 'react'

const TOTAL    = 30 * 60
const GOAL     = 8
const LS_NAME  = 'wtr_name'
const LS_DATA  = 'wtr_data'

const MESSAGES = [
  'Your skin thanks you! ✨',
  'Great habit! Keep it up 💪',
  'Hydration = energy! ⚡',
  'Your body loves you for this 💙',
  'One more closer to your goal! 🎯',
  'Keep flowing! 🌊',
  'Refreshing choice! 🌿',
]

const WA =
  'M 0 0 C 12 -8 38 -8 50 0 C 62 8 88 8 100 0 C 112 -8 138 -8 150 0 C 162 8 188 8 200 0 ' +
  'C 212 -8 238 -8 250 0 C 262 8 288 8 300 0 C 312 -8 338 -8 350 0 C 362 8 388 8 400 0'

const WB =
  'M -25 3 C -13 -5 13 -5 25 3 C 37 11 63 11 75 3 C 87 -5 113 -5 125 3 C 137 11 163 11 175 3 ' +
  'C 187 -5 213 -5 225 3 C 237 11 263 11 275 3 C 287 -5 313 -5 325 3 C 337 11 363 11 375 3 ' +
  'C 387 -5 413 -5 425 3'

const STYLES = `
  @keyframes waveA    { from { transform: translateX(0) }     to { transform: translateX(-100px) } }
  @keyframes waveB    { from { transform: translateX(-25px) } to { transform: translateX(-125px) } }
  @keyframes glsBlink { 0%,100% { opacity:1 } 50% { opacity:.28 } }
  @keyframes msgPop {
    0%   { opacity:0; transform:translateY(8px)  }
    15%  { opacity:1; transform:translateY(0)    }
    80%  { opacity:1; transform:translateY(0)    }
    100% { opacity:0; transform:translateY(-5px) }
  }
  .wave-a    { animation: waveA    3s   linear        infinite }
  .wave-b    { animation: waveB    5s   linear        infinite }
  .gls-blink { animation: glsBlink 1.8s ease-in-out  infinite }
  .msg-pop   { animation: msgPop   3s   ease-out      forwards }
`

// ─── helpers ──────────────────────────────────────────────────────────────────

const localDate = (offset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
const todayStr     = () => localDate(0)
const yesterdayStr = () => localDate(-1)

function loadData() {
  try {
    const raw = localStorage.getItem(LS_DATA)
    if (!raw) return { glasses: 0, streak: 0, lastGoalDate: '' }
    const d = JSON.parse(raw)
    if (d.date === todayStr()) {
      return { glasses: d.glasses ?? 0, streak: d.streak ?? 0, lastGoalDate: d.lastGoalDate ?? '' }
    }
    // New day: reset glasses, keep streak only if goal was met yesterday
    return {
      glasses: 0,
      streak: d.lastGoalDate === yesterdayStr() ? (d.streak ?? 0) : 0,
      lastGoalDate: d.lastGoalDate ?? '',
    }
  } catch {
    return { glasses: 0, streak: 0, lastGoalDate: '' }
  }
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Drop({ on }) {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28">
      <path
        d="M11 2C11 2 2 12 2 18c0 5 3.6 8 9 8s9-3 9-8c0-6-9-16-9-16Z"
        fill={on ? '#2563eb' : 'none'}
        stroke={on ? '#1d4ed8' : '#bfdbfe'}
        strokeWidth="1.5"
      />
    </svg>
  )
}

function Glass({ fill, empty }) {
  const tY = 24, bY = 276, tL = 28, tR = 172, bL = 52, bR = 148
  const pts = `${tL},${tY} ${tR},${tY} ${bR},${bY} ${bL},${bY}`
  const wY  = bY - fill * (bY - tY)

  return (
    <svg width="200" height="300" viewBox="0 0 200 300" className={empty ? 'gls-blink' : ''}>
      <defs>
        <clipPath id="gc">
          <polygon points={pts} />
        </clipPath>
        <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#bfdbfe" />
          <stop offset="40%"  stopColor="#60a5fa" stopOpacity=".9" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>

      <g clipPath="url(#gc)">
        {fill > 0 && (
          <>
            <rect x="0" y={wY} width="200" height={bY - wY + 1} fill="url(#wGrad)" />
            <g transform={`translate(0,${wY})`}>
              <g className="wave-a">
                <path d={WA} fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.5" />
              </g>
            </g>
            <g transform={`translate(0,${wY + 7})`}>
              <g className="wave-b">
                <path d={WB} fill="none" stroke="rgba(147,197,253,.45)" strokeWidth="1.5" />
              </g>
            </g>
          </>
        )}
      </g>

      <polygon points={pts} fill="rgba(219,234,254,.12)" />
      <polygon points={pts} fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="41" y1="44" x2="50" y2="262" stroke="rgba(255,255,255,.5)"  strokeWidth="5" strokeLinecap="round" />
      <line x1="54" y1="44" x2="60" y2="200" stroke="rgba(255,255,255,.25)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function App() {
  // Persisted state — loaded once from localStorage
  const [userName,     setUserName]     = useState(() => localStorage.getItem(LS_NAME))
  const [glasses,      setGlasses]      = useState(() => loadData().glasses)
  const [streak,       setStreak]       = useState(() => loadData().streak)
  const [lastGoalDate, setLastGoalDate] = useState(() => loadData().lastGoalDate)

  // UI state
  const [showModal,  setShowModal]  = useState(() => localStorage.getItem(LS_NAME) === null)
  const [nameInput,  setNameInput]  = useState('')
  const [activeMsg,  setActiveMsg]  = useState(null)

  // Timer state
  const [timeLeft,   setTimeLeft]   = useState(TOTAL)
  const [isRunning,  setIsRunning]  = useState(false)

  // Date tracker for midnight reset
  const [currentDate, setCurrentDate] = useState(todayStr)

  // Refs
  const timerRef       = useRef(null)
  const msgTimerRef    = useRef(null)
  const msgIdxRef      = useRef(0)
  const lastGoalDateRef = useRef(lastGoalDate)

  // Keep lastGoalDate ref in sync for use inside interval callbacks
  useEffect(() => { lastGoalDateRef.current = lastGoalDate }, [lastGoalDate])

  // Persist glasses/streak/lastGoalDate to localStorage on every change
  useEffect(() => {
    localStorage.setItem(LS_DATA, JSON.stringify({
      date: todayStr(),
      glasses,
      streak,
      lastGoalDate,
    }))
  }, [glasses, streak, lastGoalDate])

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setIsRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  // Midnight auto-reset: check every 30s
  useEffect(() => {
    const id = setInterval(() => {
      const d = todayStr()
      if (d === currentDate) return
      const yesterday = yesterdayStr()
      setCurrentDate(d)
      setGlasses(0)
      // Keep streak only if user met the goal on the now-yesterday date
      setStreak(s => lastGoalDateRef.current === yesterday ? s : 0)
    }, 30_000)
    return () => clearInterval(id)
  }, [currentDate])

  // Clean up message timeout on unmount
  useEffect(() => () => clearTimeout(msgTimerRef.current), [])

  // ── derived ────────────────────────────────────────────────────────────────
  const fillLevel = timeLeft / TOTAL
  const isEmpty   = timeLeft === 0
  const goalMet   = glasses >= GOAL

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => { setIsRunning(false); setTimeLeft(TOTAL) }

  const showNextMessage = () => {
    clearTimeout(msgTimerRef.current)
    setActiveMsg(MESSAGES[msgIdxRef.current % MESSAGES.length])
    msgIdxRef.current += 1
    msgTimerRef.current = setTimeout(() => setActiveMsg(null), 3000)
  }

  const handleDrank = () => {
    if (goalMet) return
    const next = glasses + 1
    setGlasses(next)
    if (next >= GOAL) {
      const today = todayStr()
      if (lastGoalDate !== today) {
        setStreak(s => s + 1)
        setLastGoalDate(today)
      }
    }
    showNextMessage()
    setTimeLeft(TOTAL)
    setIsRunning(true)
  }

  const handleNameSubmit = e => {
    e.preventDefault()
    const name = nameInput.trim()
    localStorage.setItem(LS_NAME, name)
    setUserName(name)
    setShowModal(false)
  }

  const handleSkip = () => {
    localStorage.setItem(LS_NAME, '')
    setUserName('')
    setShowModal(false)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Name modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs text-center">
            <div className="text-5xl mb-4">💧</div>
            <h2 className="text-xl font-bold text-blue-800 mb-1">Welcome!</h2>
            <p className="text-sm text-blue-400 mb-6">What should we call you?</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Your name"
                autoFocus
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-400 focus:outline-none text-blue-800 placeholder-blue-200 mb-4 text-center font-medium"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors mb-3"
              >
                Let's go! 💪
              </button>
            </form>
            <button
              onClick={handleSkip}
              className="text-sm text-blue-300 hover:text-blue-500 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* ── Main app ──────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">

          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-xl font-bold text-blue-800 tracking-tight leading-snug">
              {userName ? `Hi ${userName}! Time to hydrate 💧` : 'Water Reminder'}
            </h1>
            {streak > 0 && (
              <div className="shrink-0 ml-3 flex items-center gap-1 bg-orange-50 text-orange-500 font-bold text-sm px-2.5 py-1 rounded-xl">
                🔥 {streak}
              </div>
            )}
          </div>
          <p className="text-sm text-blue-400 mb-6">Drink a glass every 30 minutes</p>

          {/* Glass */}
          <div className="flex justify-center mb-3">
            <Glass fill={fillLevel} empty={isEmpty} />
          </div>

          {/* Timer */}
          <div className="text-center mb-5">
            <div className="text-6xl font-mono font-bold text-blue-700 tabular-nums">
              {mm}<span className="text-blue-300">:</span>{ss}
            </div>
            <p className="text-sm text-blue-400 mt-1.5">
              {goalMet
                ? '🎉 Daily goal reached!'
                : isEmpty
                  ? '⏰ Time to drink water!'
                  : 'until next reminder'}
            </p>
          </div>

          {/* Start / Pause + Reset */}
          <div className="flex gap-2 mb-3">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="flex-1 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={isEmpty}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Motivational message — fixed height prevents layout shift */}
          <div className="h-6 flex items-center justify-center mb-2">
            {activeMsg && (
              <span key={msgIdxRef.current} className="text-sm font-medium text-blue-500 msg-pop">
                {activeMsg}
              </span>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleDrank}
            disabled={goalMet}
            className={[
              'w-full py-3.5 mb-6 rounded-xl font-bold text-lg transition-all',
              'bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white',
              'shadow-md shadow-blue-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              isEmpty && !goalMet ? 'ring-4 ring-blue-300' : '',
            ].join(' ')}
          >
            I drank water! 💧
          </button>

          {/* Progress */}
          <div className="border-t border-blue-50 pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-blue-800">Today's progress</span>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <span className="text-xs font-bold text-orange-400">
                    🔥 {streak} day{streak !== 1 ? 's' : ''} in a row
                  </span>
                )}
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
                  {glasses} / {GOAL}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              {Array.from({ length: GOAL }, (_, i) => (
                <Drop key={i} on={i < glasses} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
