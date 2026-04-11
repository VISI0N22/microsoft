function extractSearchResults() {
  const results = [];

  document.querySelectorAll("div.g").forEach((el) => {
    const titleEl = el.querySelector("h3");
    const linkEl = el.querySelector("a");

    if (titleEl && linkEl) {
      results.push({
        title: titleEl.innerText,
        element: linkEl
      });
    }
  });

  return results;
}

async function chooseBestResult(query) {
  const results = extractSearchResults();
  if (results.length === 0) return null;

  return results[Math.floor(Math.random() * results.length)];
}

function learnFromClick(title) {
  chrome.storage.local.get(["brain"], (data) => {
    let brain = data.brain || { interests: {}, history: [] };

    brain.interests[title] = (brain.interests[title] || 1) + 0.5;

    chrome.storage.local.set({ brain });
  });
}