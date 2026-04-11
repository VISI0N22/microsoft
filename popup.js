// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusDiv = document.getElementById("status");
const engineDiv = document.getElementById("engine");

// Always show Bing
document.addEventListener('DOMContentLoaded', () => {
  engineDiv.textContent = "Engine: Bing";
  browserAPI.storage.local.get(["running"], (data) => {
    updateUI(data.running);
  });
});

startBtn.onclick = () => {
  const count = parseInt(document.getElementById("count").value);
  const interval = parseInt(document.getElementById("interval").value);

  if (!count || !interval) {
    alert("Please fill in all fields");
    return;
  }

  const settings = { count, interval };

  browserAPI.storage.local.set({ 
    settings, 
    running: true, 
    stopRequested: false 
  }, () => {
    updateUI(true);
  });
};

stopBtn.onclick = () => {
  browserAPI.storage.local.set({ running: false, stopRequested: true }, () => {
    updateUI(false);
  });
};

function updateUI(isRunning) {
  if (isRunning) {
    statusDiv.textContent = "Running...";
    statusDiv.className = "status running";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusDiv.textContent = "Stopped";
    statusDiv.className = "status stopped";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

browserAPI.storage.onChanged.addListener((changes) => {
  if (changes.running) {
    updateUI(changes.running.newValue);
  }
});