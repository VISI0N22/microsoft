let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  const progressDiv = document.getElementById('progress');
  const unlimitedCheck = document.getElementById('unlimitedCheck');
  const searchCountInput = document.getElementById('searchCount');
  const delayInput = document.getElementById('delay');

  // Toggle unlimited mode
  unlimitedCheck.addEventListener('change', (e) => {
    searchCountInput.disabled = e.target.checked;
    if (e.target.checked) {
      searchCountInput.dataset.previousValue = searchCountInput.value;
      searchCountInput.value = 0;
      progressDiv.textContent = "∞ Unlimited";
      progressDiv.style.color = "#ffd700";
    } else {
      searchCountInput.value = searchCountInput.dataset.previousValue || 30;
      progressDiv.textContent = "Ready";
      progressDiv.style.color = "#00d9ff";
    }
  });

  // Load saved settings
  chrome.storage.local.get(['searchCount', 'delay', 'currentCount', 'totalCount', 'isRunning', 'unlimited'], (result) => {
    if (result.searchCount !== undefined) searchCountInput.value = result.searchCount;
    if (result.delay) delayInput.value = result.delay;
    
    if (result.unlimited) {
      unlimitedCheck.checked = true;
      searchCountInput.disabled = true;
      progressDiv.textContent = result.isRunning ? `${result.currentCount || 0} / ∞` : "∞ Unlimited";
      progressDiv.style.color = "#ffd700";
    }
    
    if (result.isRunning) {
      isRunning = true;
      updateUIState(true);
      if (result.totalCount === 0) {
        progressDiv.textContent = `${result.currentCount || 0} / ∞`;
      } else {
        progressDiv.textContent = `${result.currentCount || 0} / ${result.totalCount}`;
      }
      statusDiv.textContent = "Running...";
    }
  });

  startBtn.addEventListener('click', async () => {
    const unlimited = unlimitedCheck.checked;
    const count = unlimited ? 0 : parseInt(searchCountInput.value);
    const delay = parseInt(delayInput.value);

    if (!unlimited && count < 1) {
      statusDiv.textContent = "Enter a valid number or enable unlimited mode";
      return;
    }
    
    if (delay < 3) {
      statusDiv.textContent = "Delay must be at least 3 seconds for safety";
      return;
    }

    // Save settings
    chrome.storage.local.set({
      searchCount: count,
      delay: delay,
      currentCount: 0,
      totalCount: count,
      isRunning: true,
      unlimited: unlimited
    });

    // Check if on Bing
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    if (!tab?.url?.includes('bing.com')) {
      statusDiv.textContent = "Opening Bing in new tab...";
      chrome.tabs.create({url: 'https://www.bing.com'});
      return;
    }

    isRunning = true;
    updateUIState(true);
    statusDiv.textContent = unlimited ? "AI generating unlimited queries..." : "AI initializing...";

    // Send to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "start",
      count: count,
      delay: delay * 1000,
      unlimited: unlimited
    });
  });

  stopBtn.addEventListener('click', () => {
    stopAutomation();
  });

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "update") {
      if (request.total === 0) {
        progressDiv.textContent = `${request.current} / ∞`;
        progressDiv.style.color = "#ffd700";
      } else {
        progressDiv.textContent = `${request.current} / ${request.total}`;
        progressDiv.style.color = "#00d9ff";
      }
      
      // Truncate long queries for display
      let displayQuery = request.query;
      if (displayQuery.length > 45) {
        displayQuery = displayQuery.substring(0, 42) + "...";
      }
      statusDiv.textContent = `🔍 ${displayQuery}`;
      statusDiv.title = request.query; // Full text on hover
      
    } else if (request.action === "completed") {
      stopAutomation();
      statusDiv.textContent = "✓ Completed successfully";
      progressDiv.textContent = "Done";
      
    } else if (request.action === "error") {
      statusDiv.textContent = `⚠️ ${request.message}`;
      stopAutomation();
    }
  });

  function stopAutomation() {
    isRunning = false;
    chrome.storage.local.get(['unlimited'], (result) => {
      chrome.storage.local.set({isRunning: false});
    });
    
    updateUIState(false);
    
    chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: "stop"});
      }
    });
  }

  function updateUIState(running) {
    startBtn.disabled = running;
    stopBtn.disabled = !running;
    unlimitedCheck.disabled = running;
    delayInput.disabled = running;
    
    if (!running && !unlimitedCheck.checked) {
      searchCountInput.disabled = false;
    }
  }
});
