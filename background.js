// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Import helper scripts
try {
  importScripts("brain.js", "timeBehavior.js");
} catch (e) {
  console.error("Failed to import scripts:", e);
}

let currentLoopId = null;
let isRunning = false;
let searchCount = 0;

// Bing URL format - uses direct search URL instead of form filling
const BING_FORMAT = "https://www.bing.com/search?q=";
const BING_FORMAT_END = "&qs=n&form=QBLH&sp=-1&pq=";

async function runBot(settings) {
  console.log(`🎯 ReFree STARTING`);
  console.log(`Settings: count=${settings.count}, interval=${settings.interval}`);
  
  searchCount = 0;
  
  await new Promise(resolve => {
    browserAPI.storage.local.set({ 
      stopRequested: false,
      currentEngine: "bing"
    }, resolve);
  });
  
  isRunning = true;

  async function loop() {
    try {
      const data = await new Promise(resolve => {
        browserAPI.storage.local.get(["stopRequested"], result => resolve(result));
      });
      
      if (data.stopRequested || !isRunning) {
        console.log("Stop requested, halting ReFree");
        isRunning = false;
        await new Promise(resolve => {
          browserAPI.storage.local.set({ running: false }, resolve);
        });
        return;
      }

      if (searchCount >= settings.count) {
        console.log(`ReFree completed ${searchCount} searches`);
        isRunning = false;
        await new Promise(resolve => {
          browserAPI.storage.local.set({ running: false }, resolve);
        });
        return;
      }

      const profile = getTimeOfDayProfile();
      let baseDelay = (settings.interval * 1000) / profile.activity;
      if (profile.name === "night") baseDelay *= 2;
      
      let query = await generateQueryAI();
      searchCount++;
      console.log(`Search ${searchCount}/${settings.count}: "${query}"`);

      // Create search URL and open/close tab (background method)
      const searchUrl = BING_FORMAT + encodeURIComponent(query) + BING_FORMAT_END + encodeURIComponent(query);
      openAndCloseTab(searchUrl);

      let delay = baseDelay + (Math.random() * 8000);
      console.log(`Waiting ${Math.round(delay/1000)}s before next search`);
      currentLoopId = setTimeout(loop, delay);
      
    } catch (error) {
      console.error("ReFree error:", error);
      currentLoopId = setTimeout(loop, 5000);
    }
  }

  loop();
}

function openAndCloseTab(url) {
  browserAPI.tabs.create({
    url: url, 
    active: false  // Keep in background
  }, function(tab) {
    if (browserAPI.runtime.lastError) {
      console.error("Error creating tab:", browserAPI.runtime.lastError);
      return;
    }
    
    let tabId = tab.id;
    console.log(`Created background tab ${tabId}`);

    // Wait for tab to finish loading, then close it
    browserAPI.tabs.onUpdated.addListener(function listener(id, info) {
      if (id === tabId && info.status === "complete") {
        browserAPI.tabs.onUpdated.removeListener(listener);
        
        // Close after short delay (500ms like your working code)
        setTimeout(function() {
          browserAPI.tabs.get(tabId, function(existingTab) {
            if (!browserAPI.runtime.lastError && existingTab) {
              browserAPI.tabs.remove(tabId);
              console.log(`Closed tab ${tabId}`);
            }
          });
        }, 500);
      }
    });
    
    // Fallback: force close after 10 seconds if never completes
    setTimeout(function() {
      browserAPI.tabs.remove(tabId).catch(() => {});
    }, 10000);
  });
}

function stopBot() {
  console.log("Stopping ReFree");
  isRunning = false;
  searchCount = 0;
  if (currentLoopId) {
    clearTimeout(currentLoopId);
    currentLoopId = null;
  }
}

browserAPI.storage.onChanged.addListener((changes) => {
  if (changes.running) {
    if (changes.running.newValue === true) {
      browserAPI.storage.local.get(["settings"], (data) => {
        if (data.settings && !isRunning) {
          runBot(data.settings);
        } else {
          console.error("No settings found or already running");
        }
      });
    } else if (changes.running.newValue === false) {
      stopBot();
    }
  }
});

if (browserAPI.runtime.onStartup) {
  browserAPI.runtime.onStartup.addListener(() => {
    browserAPI.storage.local.get(["running"], (data) => {
      if (data.running) {
        browserAPI.storage.local.get(["settings"], (data) => {
          if (data.settings) runBot(data.settings);
        });
      }
    });
  });
}

console.log("ReFree loaded and ready (Background Tab Mode)");
