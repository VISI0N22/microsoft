const MAX_HISTORY = 500;

const templates = [
  "how to learn {x}",
  "best {x} for beginners",
  "{x} tutorial step by step",
  "why is {x} important",
  "advanced {x} tips"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getBrainState() {
  return new Promise(resolve => {
    chrome.storage.local.get(["brain"], data => {
      resolve(data.brain || { interests: {}, history: [] });
    });
  });
}

async function saveBrainState(brain) {
  if (brain.history.length > MAX_HISTORY) {
    brain.history = brain.history.slice(-MAX_HISTORY);
  }

  return new Promise(resolve => {
    chrome.storage.local.set({ brain }, resolve);
  });
}

function evolveInterest(brain, topic) {
  brain.interests[topic] = (brain.interests[topic] || 1) + Math.random();
}

async function generateQueryAI() {
  let brain = await getBrainState();
  let attempts = 0;
  let query;

  do {
    let topic = Object.keys(brain.interests)[0] || "technology";
    let template = getRandom(templates);

    query = template.replace("{x}", topic);
    attempts++;
  } while (brain.history.includes(query) && attempts < 50);

  brain.history.push(query);
  evolveInterest(brain, query);

  await saveBrainState(brain);
  return query;
}