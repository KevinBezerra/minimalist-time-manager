import { useEffect, useRef, useState } from "react";
import "./Pomodoro.css";

// Labels and colors only; durations always come from the user's settings.
const MODES = {
  focus: { id: "focus", label: "Focus", color: "teal" },
  short: { id: "short", label: "Short Break", color: "orange" },
  long: { id: "long", label: "Long Break", color: "navy" },
};

const SETTINGS_KEY = "pomodoro-settings";
const TIMER_KEY = "pomodoro-timer";
const FOCUS_COUNT_KEY = "pomodoro-focus-count";
const DEFAULT_SETTINGS = { focus: 25, short: 5, long: 15 };

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// The timer is stored as an end timestamp (while running) or the time left
// (while paused), so it keeps counting while this page is not mounted.
function idleTimer(modeId, settings) {
  return { modeId, running: false, endAt: null, remainingMs: settings[modeId] * 60000 };
}

function loadTimer(settings) {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
    if (saved && MODES[saved.modeId]) {
      if (saved.running && Number.isFinite(saved.endAt)) return saved;
      if (Number.isFinite(saved.remainingMs)) return { ...saved, running: false, endAt: null };
    }
  } catch {
    // fall through to a fresh timer
  }
  return idleTimer("focus", settings);
}

function format(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings);
  const [timer, setTimer] = useState(() => loadTimer(loadSettings()));
  const [now, setNow] = useState(() => Date.now());
  const [focusCount, setFocusCount] = useState(
    () => Number(localStorage.getItem(FOCUS_COUNT_KEY)) || 0,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Text being typed in the settings inputs, so a field can be emptied while
  // typing a new value. Only valid numbers are applied to the settings.
  const [drafts, setDrafts] = useState({});
  const handledEndRef = useRef(null);

  const { modeId, running } = timer;
  const currentMode = MODES[modeId];
  const totalSeconds = settings[modeId] * 60;
  const msLeft = Math.max(0, running ? timer.endAt - now : timer.remainingMs);
  const secondsLeft = Math.ceil(msLeft / 1000);
  const progress = Math.min(1, Math.max(0, (totalSeconds - secondsLeft) / totalSeconds));

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  // Fires when a running timer reaches zero and moves on to the next mode.
  useEffect(() => {
    if (!running) return;

    const id = setTimeout(() => {
      if (handledEndRef.current === timer.endAt) return;
      handledEndRef.current = timer.endAt;

      let nextMode = "focus";
      if (modeId === "focus") {
        const nextCount = focusCount + 1;
        setFocusCount(nextCount);
        localStorage.setItem(FOCUS_COUNT_KEY, String(nextCount));
        nextMode = nextCount % 4 === 0 ? "long" : "short";
      }
      setTimer(idleTimer(nextMode, settings));
    }, Math.max(0, timer.endAt - Date.now()));

    return () => clearTimeout(id);
  }, [running, timer.endAt, modeId, focusCount, settings]);

  function handleModeChange(newId) {
    setTimer(idleTimer(newId, settings));
  }

  function handleStartPause() {
    if (running) {
      setTimer({ ...timer, running: false, endAt: null, remainingMs: msLeft });
    } else {
      const start = Date.now();
      setNow(start);
      setTimer({ ...timer, running: true, endAt: start + timer.remainingMs });
    }
  }

  function handleReset() {
    setTimer(idleTimer(modeId, settings));
  }

  function handleSettingChange(key, value) {
    setDrafts((previous) => ({ ...previous, [key]: value }));

    const minutes = Number(value);
    if (value === "" || !Number.isInteger(minutes) || minutes < 1 || minutes > 180) return;

    const nextSettings = { ...settings, [key]: minutes };
    setSettings(nextSettings);

    if (key === modeId) {
      setTimer(idleTimer(modeId, nextSettings));
    }
  }

  function handleSettingBlur(key) {
    setDrafts((previous) => ({ ...previous, [key]: undefined }));
  }

  function handleResetSettings() {
    setDrafts({});
    setSettings(DEFAULT_SETTINGS);
    setTimer(idleTimer("focus", DEFAULT_SETTINGS));
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pomodoro Timer</h1>
          <p className="page-subtitle">Stay focused and get things done.</p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setIsSettingsOpen((open) => !open)}
        >
          <svg
            className="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </header>

      {isSettingsOpen && (
        <div className="pomodoro-settings">
          {Object.entries(MODES).map(([key, mode]) => (
            <label key={key} className="setting-row">
              <span>{mode.label} (min)</span>
              <input
                type="number"
                min="1"
                max="180"
                value={drafts[key] ?? settings[key]}
                onChange={(event) => handleSettingChange(key, event.target.value)}
                onBlur={() => handleSettingBlur(key)}
              />
            </label>
          ))}

          <button
            type="button"
            className="btn-ghost"
            onClick={handleResetSettings}
          >
            Reset to defaults
          </button>
        </div>
      )}

      <div className="pomodoro">
        <div className="pomodoro-timer">
          <svg className="timer-ring" viewBox="0 0 260 260" aria-hidden="true">
            <circle
              className="timer-ring-track"
              cx="130"
              cy="130"
              r={RADIUS}
              fill="none"
              stroke="#e8ecf1"
              strokeWidth="14"
            />
            <circle
              className={`timer-ring-progress ${currentMode.color}`}
              cx="130"
              cy="130"
              r={RADIUS}
              fill="none"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              transform="rotate(-90 130 130)"
            />
          </svg>

          <div className="timer-inner">
            <p className="timer-mode-label">{currentMode.label}</p>
            <p className="timer-value">{format(secondsLeft)}</p>

            <div className="timer-buttons">
              <button
                type="button"
                className="btn-primary btn-start"
                onClick={handleStartPause}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {running ? (
                    <>
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </>
                  ) : (
                    <path d="M7 4.5v15l13-7.5z" />
                  )}
                </svg>
                {running ? "Pause" : "Start"}
              </button>
              <button type="button" className="btn-outline" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <ul className="mode-list">
          {Object.values(MODES).map((mode) => {
            const isActive = mode.id === modeId;

            return (
              <li key={mode.id}>
                <button
                  type="button"
                  className={`mode-card ${isActive ? "active" : ""}`}
                  onClick={() => handleModeChange(mode.id)}
                  aria-pressed={isActive}
                >
                  <span className={`mode-radio ${mode.color}`}>
                    {isActive && <span className="mode-dot" />}
                  </span>
                  <span className="mode-text">
                    <strong>{mode.label}</strong>
                    <small>{settings[mode.id]} min</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="pomodoro-stats">
        Completed focus sessions: <strong>{focusCount}</strong>
      </p>
    </div>
  );
}
