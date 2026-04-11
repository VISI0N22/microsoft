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

// ALWAYS USE BING
const BING_ENGINE = {
  name: "bing",
  homepage: "https://www.bing.com"
};

async function runBot(settings) {
  console.log(`🎯 ReFree Pro STARTING with Bing (${BING_ENGINE.homepage})`);
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
        console.log("Stop requested, halting ReFree Pro");
        isRunning = false;
        await new Promise(resolve => {
          browserAPI.storage.local.set({ running: false }, resolve);
        });
        return;
      }

      if (searchCount >= settings.count) {
        console.log(`ReFree Pro completed ${searchCount} searches, stopping`);
        isRunning = false;
        await new Promise(resolve => {
          browserAPI.storage.local.set({ running: false }, resolve);
        });
        return;
      }

      const profile = getTimeOfDayProfile();
      console.log(`Time profile: ${profile.name}, activity: ${profile.activity}`);

      let baseDelay = (settings.interval * 1000) / profile.activity;
      if (profile.name === "night") {
        baseDelay *= 2;
      }
      
      let query = await generateQueryAI();
      searchCount++;
      console.log(`ReFree Pro Search ${searchCount}/${settings.count}: "${query}" on Bing`);

      await new Promise((resolve, reject) => {
        browserAPI.tabs.create({ url: BING_ENGINE.homepage }, (tab) => {
          if (browserAPI.runtime.lastError) {
            console.error("Error creating tab:", browserAPI.runtime.lastError);
            reject(browserAPI.runtime.lastError);
            return;
          }
          
          const tabId = tab.id;
          console.log(`Created tab ${tabId}`);

          const listener = (id, info) => {
            if (id === tabId && info.status === "complete") {
              browserAPI.tabs.onUpdated.removeListener(listener);
              console.log(`Tab ${tabId} loaded, sending search`);

              setTimeout(() => {
                browserAPI.tabs.sendMessage(tabId, {
                  action: "search",
                  query: query,
                  engine: "bing"
                }, (response) => {
                  if (browserAPI.runtime.lastError) {
                    console.error("Message error:", browserAPI.runtime.lastError);
                  }
                });
              }, 1500);

              setTimeout(() => {
                browserAPI.tabs.remove(tabId, () => {
                  if (browserAPI.runtime.lastError) {
                    console.error("Error removing tab:", browserAPI.runtime.lastError);
                  }
                });
              }, 20000 + Math.random() * 20000);
              
              resolve();
            }
          };

          browserAPI.tabs.onUpdated.addListener(listener);
          
          setTimeout(() => {
            browserAPI.tabs.onUpdated.removeListener(listener);
            resolve();
          }, 30000);
        });
      });

      let delay = baseDelay + (Math.random() * 8000);
      console.log(`Waiting ${Math.round(delay/1000)}s before next search`);
      
      currentLoopId = setTimeout(loop, delay);
      
    } catch (error) {
      console.error("ReFree Pro error in loop:", error);
      let delay = (settings.interval * 1000) + (Math.random() * 8000);
      currentLoopId = setTimeout(loop, delay);
    }
  }

  loop();
}

function stopBot() {
  console.log("Stopping ReFree Pro");
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
        if (data.settings) {
          if (!isRunning) {
            runBot(data.settings);
          }
        } else {
          console.error("No settings found");
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
          if (data.settings) {
            runBot(data.settings);
          }
        });
      }
    });
  });
}

console.log("ReFree Pro loaded and ready");