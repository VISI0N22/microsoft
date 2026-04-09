let isRunning = false;
let currentCount = 0;
let totalCount = 0;
let delay = 8000;
let timeoutId = null;
let unlimitedMode = false;
let consecutiveErrors = 0;
let searchHistory = [];

// AI Search Generator Configuration
const AI_CONFIG = {
  subjects: {
    tech: ["smartphone", "laptop", "AI assistant", "mobile app", "software update", "gadget review", "battery life", "screen protector", "processor speed", "camera quality", "drone photography", "VR headset", "smart watch", "electric car charging", "robot vacuum"],
    health: ["vitamin D benefits", "morning exercise routine", "mediterranean diet plan", "sleep hygiene tips", "meditation techniques", "yoga poses for back pain", "running form", "protein sources", "anxiety management", "migraine triggers", "lower back stretches", "immune system boosters", "metabolism increase"],
    food: ["sourdough bread recipe", "italian restaurants nearby", "cold brew coffee method", "neapolitan pizza dough", "sushi rolling guide", "green smoothie recipes", "meal prep sunday", "grilled salmon marinade", "chocolate chip cookies chewy", "korean BBQ at home", "vegan protein meals", "fast food healthy options"],
    science: ["james webb telescope images", "climate change arctic ice", "ocean acidification effects", "quantum computing explained", "DNA testing ancestry", "human evolution timeline", "solar panel efficiency 2024", "Mars colonization challenges", "volcano eruption warning signs", "earthquake prediction methods", "hurricane formation", "northern lights forecast"],
    culture: ["best movies 2024", "spotify playlist ideas", "book recommendations thriller", "true crime podcasts", "netflix series trending", "video game releases", "concert tickets", "museum exhibits virtual", "instagram photo ideas", "tiktok recipes viral", "celebrity news today", "oscar predictions"],
    finance: ["stocks to watch", "crypto market analysis", "mortgage rates today", "credit card points", "high yield savings", "budget spreadsheet template", "index fund investing", "retirement planning 30s", "tax deductions 2024", "inflation impact", "recession proof careers", "side hustle ideas"],
    home: ["minimalist furniture", "paint color trends", "indoor garden setup", "DIY floating shelves", "cleaning hack tiktok", "closet organization", "LED lighting bedroom", "smart thermostat setup", "clogged drain fix", "bohemian decor", "small space storage", "home office ergonomic"]
  },
  
  questionStarters: [
    "how to", "what is", "why does", "when should", "where to buy", 
    "best way to", "is it safe to", "how much does", "can you", 
    "difference between", "how long does", "what causes", "should i"
  ],
  
  contexts: [
    "beginners", "experts", "at home", "without equipment", 
    "2024", "fast", "cheap", "premium", "for small spaces", 
    "winter", "summer", "while traveling", "with kids", "for seniors",
    "in apartment", "outdoor", "indoor", "step by step"
  ],
  
  trending: [
    "artificial intelligence tools", "sustainable living", "remote work tips", 
    "mental health awareness", "inflation economy", "olympics 2024", 
    "renewable energy", "streaming wars", "creator economy", 
    "cryptocurrency regulation", "wellness trends", "minimalism lifestyle"
  ],
  
  locations: ["New York", "Los Angeles", "Chicago", "Miami", "Seattle", "Denver", "Austin", "Boston", "Portland", "Nashville", "San Francisco", "Washington DC"],
  brands: ["Apple", "Samsung", "Sony", "Nike", "Adidas", "Amazon", "Tesla", "Google", "Microsoft", "Disney", "Netflix", "Spotify"],
  
  timeModifiers: ["today", "this week", "2024", "right now", "tonight", "this morning"]
};

class SearchAI {
  constructor() {
    this.recentTopics = [];
    this.usedQueries = new Set();
    this.season = this.getSeason();
  }

  getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  }

  generateQuery() {
    let attempts = 0;
    let query = "";
    
    // Try to generate unique query
    do {
      const strategy = Math.floor(Math.random() * 10);
      switch(strategy) {
        case 0: query = this.generateQuestion(); break;
        case 1: query = this.generateComparison(); break;
        case 2: query = this.generateTrending(); break;
        case 3: query = this.generateLocal(); break;
        case 4: query = this.generateHowTo(); break;
        case 5: query = this.generateReview(); break;
        case 6: query = this.generateDefinition(); break;
        case 7: query = this.generateConversational(); break;
        case 8: query = this.generateResearch(); break;
        case 9: query = this.generateShopping(); break;
      }
      query = query.toLowerCase().trim();
      attempts++;
    } while ((this.usedQueries.has(query) || this.isTooSimilar(query)) && attempts < 15);
    
    this.usedQueries.add(query);
    if (this.usedQueries.size > 50) this.usedQueries.clear(); // Prevent memory bloat
    
    this.updateHistory(query);
    return query;
  }

  getSubject(category) {
    if (!category || !AI_CONFIG.subjects[category]) {
      const cats = Object.keys(AI_CONFIG.subjects);
      category = cats[Math.floor(Math.random() * cats.length)];
    }
    const items = AI_CONFIG.subjects[category];
    return items[Math.floor(Math.random() * items.length)];
  }

  getContext() {
    return AI_CONFIG.contexts[Math.floor(Math.random() * AI_CONFIG.contexts.length)];
  }

  isTooSimilar(newQuery) {
    const recent = Array.from(this.recentTopics).slice(-5);
    const newWords = newQuery.split(' ');
    
    for (let old of recent) {
      const oldWords = old.split(' ');
      const common = newWords.filter(w => oldWords.includes(w) && w.length > 3).length;
      if (common >= 2) return true; // If 2+ significant words match
    }
    return false;
  }

  updateHistory(query) {
    this.recentTopics.push(query);
    if (this.recentTopics.length > 10) this.recentTopics.shift();
    searchHistory.push({
      query: query,
      time: new Date().toISOString(),
      count: currentCount
    });
  }

  generateQuestion() {
    const starter = AI_CONFIG.questionStarters[Math.floor(Math.random() * AI_CONFIG.questionStarters.length)];
    const subject = this.getSubject();
    const ctx = Math.random() > 0.6 ? this.getContext() : "";
    
    if (starter.includes("difference between")) {
      const s2 = this.getSubject();
      return `${starter} ${subject} and ${s2}`;
    }
    return `${starter} ${subject} ${ctx}`.trim();
  }

  generateComparison() {
    const s1 = this.getSubject();
    const s2 = this.getSubject(Math.random() > 0.5 ? "tech" : null);
    const brand = AI_CONFIG.brands[Math.floor(Math.random() * AI_CONFIG.brands.length)];
    const formats = [
      `${s1} vs ${s2}`,
      `${brand} ${s1} review ${AI_CONFIG.timeModifiers[Math.floor(Math.random() * AI_CONFIG.timeModifiers.length)]}`,
      `${s1} or ${s2} for ${this.getContext()}`,
      `is ${s1} better than ${s2}`,
      `${s1} alternatives ${this.getContext()}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateTrending() {
    const trend = AI_CONFIG.trending[Math.floor(Math.random() * AI_CONFIG.trending.length)];
    const formats = [
      `why is ${trend} trending`,
      `${trend} explained simple`,
      `how does ${trend} affect me`,
      `${trend} news ${AI_CONFIG.timeModifiers[Math.floor(Math.random() * AI_CONFIG.timeModifiers.length)]}`,
      `latest ${trend} updates`,
      `impact of ${trend} on ${this.getSubject()}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateLocal() {
    const loc = AI_CONFIG.locations[Math.floor(Math.random() * AI_CONFIG.locations.length)];
    const subject = Math.random() > 0.5 ? this.getSubject("food") : this.getSubject();
    const formats = [
      `${subject} in ${loc}`,
      `best ${subject} near ${loc}`,
      `${subject} open now ${loc}`,
      `${subject} delivery ${loc}`,
      `${subject} deals ${loc} ${this.season}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateHowTo() {
    const subject = this.getSubject();
    const specific = ["fast", "properly", "step by step", "without mistakes", "for cheap", "safely", "at home"];
    const detail = specific[Math.floor(Math.random() * specific.length)];
    const formats = [
      `how to ${detail} ${subject}`,
      `step by step guide ${subject}`,
      `tutorial ${subject} ${detail}`,
      `learn ${subject} ${this.getContext()}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateReview() {
    const subject = this.getSubject();
    const year = new Date().getFullYear();
    const formats = [
      `${subject} review ${year}`,
      `is ${subject} worth it reddit`,
      `${subject} honest review`,
      `${subject} problems issues`,
      `best ${subject} ${this.getContext()}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateDefinition() {
    const topics = ["quantum physics", "blockchain technology", "photosynthesis process", "climate change effects", "machine learning basics", "inflation economics", "democracy vs republic", "artificial neural networks", "greenhouse gases", "biodiversity importance"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const formats = [
      `what is ${topic}`,
      `${topic} simple explanation`,
      `${topic} for beginners`,
      `why does ${topic} matter`,
      `${topic} examples in real life`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateConversational() {
    const phrases = [
      `i'm looking for ${this.getSubject()} recommendations`,
      `need help choosing ${this.getSubject()}`,
      `what's the best ${this.getSubject()} for ${this.getContext()}`,
      `can someone explain ${this.getSubject()}`,
      `tips for ${this.getContext()} with ${this.getSubject()}`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  generateResearch() {
    const topic = this.getSubject("science") || this.getSubject();
    const formats = [
      `research ${topic} statistics`,
      `${topic} data analysis`,
      `studies about ${topic} effects`,
      `${topic} scientific consensus`,
      `history of ${topic} development`,
      `future of ${topic} predictions 2024`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  generateShopping() {
    const item = this.getSubject();
    const brand = AI_CONFIG.brands[Math.floor(Math.random() * AI_CONFIG.brands.length)];
    const price = ["under $50", "under $100", "under $500", "cheap", "premium quality", "refurbished"];
    const modifier = price[Math.floor(Math.random() * price.length)];
    const formats = [
      `buy ${item} ${modifier}`,
      `${brand} ${item} price compare`,
      `where to buy ${item} online`,
      `${item} discount code ${AI_CONFIG.timeModifiers[Math.floor(Math.random() * AI_CONFIG.timeModifiers.length)]}`,
      `best ${item} ${modifier}`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }
}

const searchAI = new SearchAI();

function performSearch() {
  if (!isRunning) return;

  // Check completion (skip if unlimited)
  if (!unlimitedMode && currentCount >= totalCount) {
    finish();
    return;
  }

  // Generate unique query
  const query = searchAI.generateQuery();
  currentCount++;

  // Update popup
  chrome.runtime.sendMessage({
    action: "update",
    current: currentCount,
    total: unlimitedMode ? 0 : totalCount,
    query: query
  });

  // Navigate with error handling
  try {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    window.location.href = searchUrl;
    consecutiveErrors = 0;
  } catch (e) {
    consecutiveErrors++;
    console.error("Search error:", e);
    if (consecutiveErrors > 3) {
      chrome.runtime.sendMessage({
        action: "error",
        message: "Navigation failed repeatedly"
      });
      stop();
      return;
    }
  }

  // Schedule next with random variance (0.7x to 1.3x)
  const variance = 0.7 + (Math.random() * 0.6);
  const actualDelay = Math.floor(delay * variance);
  
  timeoutId = setTimeout(() => {
    if (isRunning) performSearch();
  }, actualDelay);
}

function finish() {
  isRunning = false;
  chrome.storage.local.set({ isRunning: false });
  chrome.runtime.sendMessage({ action: "completed" });
}

function stop() {
  isRunning = false;
  if (timeoutId) clearTimeout(timeoutId);
  chrome.storage.local.set({ isRunning: false });
}

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    totalCount = request.count || 0;
    unlimitedMode = request.unlimited || request.count === 0;
    delay = request.delay || 8000;
    currentCount = 0;
    consecutiveErrors = 0;
    isRunning = true;
    
    chrome.storage.local.set({
      currentCount: 0,
      totalCount: totalCount,
      isRunning: true,
      unlimited: unlimitedMode
    });

    // Random initial delay (1.5-3s)
    setTimeout(() => performSearch(), 1500 + Math.random() * 1500);
    
  } else if (request.action === "stop") {
    stop();
  }
});

// Resume on page load
chrome.storage.local.get(['isRunning', 'currentCount', 'totalCount', 'delay', 'unlimited'], (result) => {
  if (result.isRunning) {
    currentCount = result.currentCount || 0;
    totalCount = result.totalCount || 0;
    delay = result.delay || 8000;
    unlimitedMode = result.unlimited || false;
    isRunning = true;
    
    // Random resume delay
    setTimeout(() => {
      if (isRunning) performSearch();
    }, 2000 + Math.random() * 2000);
  }
});

// Auto-pause if tab hidden too long (optional safety)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isRunning) {
    setTimeout(() => {
      if (document.hidden && isRunning) {
        console.log("Auto-paused: Tab inactive");
        // Uncomment to enable auto-stop on tab hide:
        // stop();
      }
    }, 60000); // 1 minute grace period
  }
});
