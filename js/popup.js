// DOM Elements
const startScreen = document.getElementById('startScreen');
const waitingScreen = document.getElementById('waitingScreen');
const waitingTimer = document.getElementById('waitingTimer');
const nextExerciseTimer = document.getElementById('nextExercise');
const exerciseContainer = document.getElementById('exerciseContainer');
const completionScreen = document.getElementById('completionScreen');
const completionTimer = document.getElementById('completionTimer');
const exerciseCategory = document.getElementById('exerciseCategory');
const exerciseContent = document.getElementById('exerciseContent');
const answerInput = document.getElementById('answerInput');
const submitButton = document.getElementById('submitAnswer');
const skipButton = document.getElementById('skipExercise');
const startButton = document.getElementById('startLearning');
const startNowButton = document.getElementById('startNow');
const keepLearningButton = document.getElementById('keepLearning');
const endSessionButton = document.getElementById('endSession');
const completedToday = document.getElementById('completedToday');
const currentStreak = document.getElementById('currentStreak');
const statusText = document.getElementById('status');
const openOptionsButton = document.getElementById('openOptions');
const showHintButton = document.getElementById('showHint');
const hintText = document.getElementById('hintText');
const romanjiElement = document.getElementById('romanji');

// State management
let isLearningActive = false;
let currentExercise = null;
let timerUpdateInterval = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load learning state
  const state = await chrome.storage.local.get(['isLearningActive', 'nextExerciseTime', 'stats', 'currentExerciseStartTime', 'currentExercise']);
  isLearningActive = state.isLearningActive || false;
  currentExercise = state.currentExercise || null;
  
  // Update stats if available
  if (state.stats) {
    completedToday.textContent = state.stats.completedToday || 0;
    currentStreak.textContent = state.stats.streak || 0;
  }

  // Update UI based on learning state
  if (isLearningActive) {
    startTimerUpdates();
    
    if (state.currentExerciseStartTime) {
      // There's an active exercise - restore it
      if (state.currentExercise) {
        showExercise(state.currentExercise);
      } else {
        // Request new exercise if somehow we lost it
        chrome.runtime.sendMessage({ action: 'requestExercise' });
      }
    } else if (state.nextExerciseTime) {
      const timeLeft = Math.max(0, state.nextExerciseTime - Date.now());
      if (timeLeft <= 0) {
        // Timer expired - request new exercise
        chrome.runtime.sendMessage({ action: 'requestExercise' });
      } else {
        // Still waiting - show waiting screen
        showWaitingScreen();
      }
    }
  } else {
    // Not learning - show start screen
    showStartScreen();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'newExercise' && message.exercise) {
    showExercise(message.exercise);
  } else if (message.action === 'timerUpdated') {
    updateTimer();
  }
});

// Event Listeners
startButton.addEventListener('click', startLearning);
startNowButton.addEventListener('click', requestNewExercise);
keepLearningButton.addEventListener('click', () => {
  requestNewExercise();
});
endSessionButton.addEventListener('click', endSession);
submitButton.addEventListener('click', handleSubmit);
skipButton.addEventListener('click', handleSkip);
showHintButton.addEventListener('click', showHint);
openOptionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Functions
function resetUI() {
  // Reset all screens
  startScreen.classList.remove('hidden');
  waitingScreen.classList.add('hidden');
  exerciseContainer.classList.add('hidden');
  completionScreen.classList.add('hidden');
  
  // Reset exercise elements
  exerciseCategory.textContent = '';
  exerciseContent.textContent = '';
  answerInput.value = '';
  hintText.textContent = '';
  hintText.classList.add('hidden');
  romanjiElement.textContent = '';
  romanjiElement.classList.add('hidden');
  
  // Reset timers
  nextExerciseTimer.textContent = 'Next: --:--';
  waitingTimer.textContent = '--:--';
  completionTimer.textContent = '--:--';
  statusText.textContent = 'Timer: Inactive';
  
  stopTimerUpdates();
}

function showStartScreen() {
  if (isLearningActive) return; // Don't show start screen if learning is active
  startScreen.classList.remove('hidden');
  waitingScreen.classList.add('hidden');
  exerciseContainer.classList.add('hidden');
  completionScreen.classList.add('hidden');
}

function showWaitingScreen() {
  startScreen.classList.add('hidden');
  waitingScreen.classList.remove('hidden');
  exerciseContainer.classList.add('hidden');
  completionScreen.classList.add('hidden');
}

function showExerciseScreen() {
  startScreen.classList.add('hidden');
  waitingScreen.classList.add('hidden');
  exerciseContainer.classList.remove('hidden');
  completionScreen.classList.add('hidden');
}

function showCompletionScreen() {
  startScreen.classList.add('hidden');
  waitingScreen.classList.add('hidden');
  exerciseContainer.classList.add('hidden');
  completionScreen.classList.remove('hidden');
}

function startLearning() {
  isLearningActive = true;
  chrome.runtime.sendMessage({ action: 'startLearning' });
  showWaitingScreen();
  startTimerUpdates();
  statusText.textContent = 'Timer: Active';
}

function endSession() {
  isLearningActive = false;
  chrome.runtime.sendMessage({ action: 'stopLearning' });
  showStartScreen();
}

function requestNewExercise() {
  showExerciseScreen();
  chrome.runtime.sendMessage({ action: 'requestExercise' });
}

function showExercise(exercise) {
  currentExercise = exercise;
  exerciseCategory.textContent = exercise.category;
  exerciseContent.textContent = exercise.question;
  answerInput.value = '';
  hintText.textContent = '';
  hintText.classList.add('hidden');
  romanjiElement.textContent = '';
  romanjiElement.classList.add('hidden');
  showExerciseScreen();
  answerInput.focus();
  
  // Save current exercise state
  chrome.storage.local.set({ currentExercise: exercise });
}

async function updateTimer() {
  chrome.runtime.sendMessage({ action: 'getTimerStatus' }, (response) => {
    if (!response) return;

    if (response.isActive) {
      // If there's an active exercise, don't show timer
      if (response.exerciseStartTime) {
        nextExerciseTimer.textContent = 'Exercise in progress';
        statusText.textContent = 'Timer: Active';
        return;
      }

      // Show countdown to next exercise
      if (response.nextTime) {
        const timeLeft = Math.max(0, response.nextTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          // Time's up - request new exercise
          chrome.runtime.sendMessage({ action: 'requestExercise' });
        } else {
          const timerText = `${timeString}`;
          nextExerciseTimer.textContent = `Next: ${timerText}`;
          completionTimer.textContent = timerText;
          statusText.textContent = 'Timer: Active';
          
          // Keep current screen unless we're between exercises
          if (!currentExercise && completionScreen.classList.contains('hidden')) {
            showWaitingScreen();
          }
        }
      }
    } else {
      nextExerciseTimer.textContent = 'Next: --:--';
      completionTimer.textContent = '--:--';
      statusText.textContent = 'Timer: Inactive';
    }
  });
}

function startTimerUpdates() {
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval);
  }
  updateTimer();
  timerUpdateInterval = setInterval(updateTimer, 1000);
}

function stopTimerUpdates() {
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval);
    timerUpdateInterval = null;
  }
}

function showHint() {
  hintText.classList.remove('hidden');
  if (currentExercise.romanji) {
    romanjiElement.classList.remove('hidden');
  }
}

async function handleSubmit() {
  const answer = answerInput.value.trim().toLowerCase();
  const correctAnswer = currentExercise.answer.toLowerCase();

  if (answer === correctAnswer) {
    // Update stats
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || { completedToday: 0, streak: 0 };
      stats.completedToday++;
      chrome.storage.local.set({ stats });
      
      // Update display
      completedToday.textContent = stats.completedToday;
    });

    // Clear current exercise
    chrome.storage.local.remove(['currentExercise']);
    currentExercise = null;

    // Tell background script exercise is completed
    chrome.runtime.sendMessage({ 
      action: 'exerciseCompleted',
      wasCorrect: true
    });

    // Show completion screen
    showCompletionScreen();
  } else {
    answerInput.classList.add('error');
    setTimeout(() => {
      answerInput.classList.remove('error');
    }, 500);
  }
}

function handleSkip() {
  exerciseContainer.classList.add('hidden');
  completionScreen.classList.remove('hidden');
  chrome.runtime.sendMessage({ action: 'exerciseSkipped' });
  
  // Force immediate timer update
  updateTimer();
}
