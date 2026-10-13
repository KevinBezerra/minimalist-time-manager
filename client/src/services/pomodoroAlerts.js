// Alerts played when a Pomodoro interval ends: a short chime, plus a system
// notification when the tab is in the background.
// Everything here is "best effort": if the browser blocks sound or
// notifications, the timer keeps working and the on-screen banner still shows.

let audioContext = null;

// The sound is generated with the Web Audio API, so no audio file is needed.
// Browsers only allow audio after a user click, so prepareAlerts() must be
// called from a click handler (we call it when the user presses Start).
function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

// Call this from the Start button's click handler.
// 1. Wakes up the audio engine so the chime is allowed to play later.
// 2. Asks (once) for permission to show system notifications.
export function prepareAlerts() {
  try {
    const context = getAudioContext();
    if (context && context.state === "suspended") {
      context.resume();
    }
  } catch (error) {
    console.error("Could not prepare audio:", error);
  }

  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch (error) {
    console.error("Could not request notification permission:", error);
  }
}

// Plays a single soft beep. `startOffset` is in seconds from now.
function playBeep(context, frequency, startOffset, duration) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + startOffset;

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Fade in/out quickly so the beep does not "click".
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// Focus ending = three beeps going up ("great job, take a break").
// Break ending = two lower beeps ("back to work").
export function playChime(finishedMode) {
  try {
    const context = getAudioContext();
    if (!context) return;

    const notes = finishedMode === "focus" ? [660, 880, 1100] : [660, 520];
    notes.forEach((frequency, index) => {
      playBeep(context, frequency, index * 0.22, 0.3);
    });
  } catch (error) {
    console.error("Could not play chime:", error);
  }
}

// System notification, only when the user cannot see the page. If the tab is
// visible, the banner inside the app is enough.
function showSystemNotification(title, body) {
  try {
    if (
      document.hidden &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, { body });
    }
  } catch (error) {
    console.error("Could not show notification:", error);
  }
}

// The one function the timer calls when an interval ends.
export function notifyIntervalFinished(finishedMode) {
  playChime(finishedMode);

  if (finishedMode === "focus") {
    showSystemNotification("Focus session complete", "Time for a break.");
  } else {
    showSystemNotification("Break is over", "Ready for the next focus session?");
  }
}