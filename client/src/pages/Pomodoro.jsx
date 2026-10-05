import { useCallback, useEffect, useRef, useState } from "react";
import "./Pomodoro.css";

const MODES = {
  focus: { id: "focus", label: "Focus", minutes: 25, color: "teal" },
  short: { id: "short", label: "Short Break", minutes: 5, color: "orange" },
  long: { id: "long", label: "Long Break", minutes: 15, color: "navy" },
};

const SETTINGS_KEY = "pomodoro-settings";
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

function format(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings);
  const [modeId, setModeId] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(
    DEFAULT_SETTINGS.focus * 60,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState(
    () => Number(localStorage.getItem(FOCUS_COUNT_KEY)) || 0,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const modeRef = useRef(modeId);
  const settingsRef = useRef(settings);

  useEffect(() => {
    modeRef.current = modeId;
  }, [modeId]);

  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const currentMode = MODES[modeId];
  const totalSeconds = currentMode.minutes * 60;
  const progress = totalSeconds === 0 ? 0 : (totalSeconds - secondsLeft) / totalSeconds;

  const handleModeChange = useCallback((newId) => {
    setModeId(newId);
    setSecondsLeft(MODES[newId].minutes * 60);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    if (modeRef.current === "focus") {
      const nextCount = focusCount + 1;
      setFocusCount(nextCount);
      localStorage.setItem(FOCUS_COUNT_KEY, String(nextCount));

      const nextMode = nextCount % 4 === 0 ? "long" : "short";
      setModeId(nextMode);
      setSecondsLeft(MODES[nextMode].minutes * 60);
    } else {
      setModeId("focus");
      setSecondsLeft(settingsRef.current.focus * 60);
    }

    setIsRunning(false);
  }, [secondsLeft, focusCount]);

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(currentMode.minutes * 60);
  }

  function handleSettingChange(key, value) {
    const minutes = Number(value);
    if (Number.isNaN(minutes) || minutes < 1) return;

    setSettings((previous) => ({ ...previous, [key]: minutes }));

    if (key === modeId) {
      setSecondsLeft(minutes * 60);
      setIsRunning(false);
    }
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
                value={settings[key]}
                onChange={(event) => handleSettingChange(key, event.target.value)}
              />
            </label>
          ))}

          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              setIsRunning(false);
              setSecondsLeft(DEFAULT_SETTINGS.focus * 60);
            }}
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
                onClick={() => setIsRunning((running) => !running)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isRunning ? (
                    <>
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </>
                  ) : (
                    <path d="M7 4.5v15l13-7.5z" />
                  )}
                </svg>
                {isRunning ? "Pause" : "Start"}
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
