// Constants
const DEFAULT_INTERVAL = 1/6; // 10 seconds (1/6 of a minute)
const ALARM_NAME = 'exerciseReminder';

// Import Japanese lessons
import { getRandomExercise } from './js/lessons.js';

// Exercise state
let isLearningActive = false;
let currentExerciseStartTime = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  resetState();
});

// Reset state when extension is loaded
chrome.runtime.onStartup.addListener(() => {
  resetState();
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startLearning':
      startLearning();
      // Show exercise immediately
      showExercise();
      break;
    case 'stopLearning':
      stopLearning();
      break;
    case 'requestExercise':
      showExercise();
      break;
    case 'exerciseCompleted':
      handleExerciseCompleted(message.wasCorrect);
      break;
    case 'exerciseSkipped':
      handleExerciseSkipped();
      break;
    case 'endSession':
      endCurrentSession();
      break;
    case 'getTimerStatus':
      if (sendResponse) {
        getTimerStatus().then(status => sendResponse(status));
        return true; // Will respond asynchronously
      }
      break;
    case 'resetState':
      resetState();
      if (sendResponse) {
        sendResponse({ success: true });
      }
      break;
  }
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME && isLearningActive) {
    showExercise();
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.interval) {
    // Reschedule with new interval if learning is active
    if (isLearningActive) {
      handleExerciseCompleted(false);
    }
  }
});

// Functions
function resetState() {
  isLearningActive = false;
  currentExerciseStartTime = null;
  chrome.storage.local.set({
    interval: DEFAULT_INTERVAL,
    isLearningActive: false,
    currentExerciseStartTime: null,
    activeExercise: null,
    nextExerciseTime: null,
    stats: {
      completedToday: 0,
      streak: 0,
      lastCompletedDate: null
    }
  });
  chrome.alarms.clear(ALARM_NAME);
}

function startLearning() {
  isLearningActive = true;
  chrome.storage.local.set({ 
    isLearningActive: true,
    currentExerciseStartTime: Date.now()
  });
}

function stopLearning() {
  isLearningActive = false;
  currentExerciseStartTime = null;
  chrome.storage.local.set({ 
    isLearningActive: false,
    currentExerciseStartTime: null,
    nextExerciseTime: null,
    activeExercise: null
  });
  chrome.alarms.clear(ALARM_NAME);
}

async function getTimerStatus() {
  const data = await chrome.storage.local.get(['currentExerciseStartTime', 'interval']);
  const alarm = await chrome.alarms.get(ALARM_NAME);
  
  return {
    isActive: isLearningActive,
    nextTime: alarm ? alarm.scheduledTime : null,
    exerciseStartTime: data.currentExerciseStartTime,
    interval: data.interval || DEFAULT_INTERVAL
  };
}

function showExercise() {
  if (!isLearningActive) return;

  const exercise = generateExercise();
  currentExerciseStartTime = Date.now();
  
  chrome.storage.local.set({ 
    activeExercise: exercise,
    currentExerciseStartTime: currentExerciseStartTime
  });

  // Notify all popup windows about the new exercise
  chrome.runtime.sendMessage({ 
    action: 'newExercise', 
    exercise: exercise 
  });
}

function generateExercise() {
  return getRandomExercise();
}

async function handleExerciseCompleted(wasCorrect) {
  // Update stats
  const data = await chrome.storage.local.get(['stats', 'interval']);
  const stats = data.stats || {
    completedToday: 0,
    streak: 0,
    lastCompletedDate: null
  };

  const today = new Date().toDateString();
  const lastCompleted = stats.lastCompletedDate ? new Date(stats.lastCompletedDate).toDateString() : null;

  if (lastCompleted === null || lastCompleted === today) {
    stats.completedToday++;
  } else if (new Date(lastCompleted).getTime() === new Date(today).getTime() - 86400000) {
    stats.streak++;
    stats.completedToday = 1;
  } else {
    stats.streak = 1;
    stats.completedToday = 1;
  }

  stats.lastCompletedDate = today;

  // Schedule next exercise
  const interval = data.interval || DEFAULT_INTERVAL;
  const when = Date.now() + (interval * 60 * 1000);

  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, {
    when: when
  });

  // Update storage with new timer and stats
  await chrome.storage.local.set({ 
    stats,
    currentExerciseStartTime: null,
    nextExerciseTime: when,
    activeExercise: null // Clear current exercise
  });

  // Notify popup about timer update
  chrome.runtime.sendMessage({ 
    action: 'timerUpdated',
    nextTime: when
  });
}

function handleExerciseSkipped() {
  handleExerciseCompleted(false);
}

function endCurrentSession() {
  chrome.storage.local.set({ 
    activeExercise: null,
    currentExerciseStartTime: null
  });
}
