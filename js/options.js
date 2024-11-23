// DOM Elements
const intervalInput = document.getElementById('interval');
const mathExercises = document.getElementById('mathExercises');
const vocabExercises = document.getElementById('vocabExercises');
const logicExercises = document.getElementById('logicExercises');
const saveButton = document.getElementById('save');
const statusDisplay = document.getElementById('status');

// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.local.get([
    'interval',
    'exerciseTypes'
  ]);

  // Set interval
  intervalInput.value = settings.interval || 30;

  // Set exercise types
  const types = settings.exerciseTypes || {
    math: true,
    vocab: true,
    logic: true
  };

  mathExercises.checked = types.math;
  vocabExercises.checked = types.vocab;
  logicExercises.checked = types.logic;
});

// Save settings
saveButton.addEventListener('click', async () => {
  const interval = parseInt(intervalInput.value);
  
  // Validate interval
  if (interval < 1 || interval > 180) {
    showStatus('Please enter an interval between 1 and 180 minutes.', 'error');
    return;
  }

  // Save settings
  try {
    await chrome.storage.local.set({
      interval: interval,
      exerciseTypes: {
        math: mathExercises.checked,
        vocab: vocabExercises.checked,
        logic: logicExercises.checked
      }
    });

    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings. Please try again.', 'error');
  }
});

// Helper function to show status messages
function showStatus(message, type) {
  statusDisplay.textContent = message;
  statusDisplay.className = `status ${type}`;
  
  // Clear status after 3 seconds
  setTimeout(() => {
    statusDisplay.className = 'status';
  }, 3000);
}
