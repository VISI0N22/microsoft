chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "search") return;

  const input = findSearchBox();

  if (!input) {
    console.log("❌ No search box found on this page");
    return;
  }

  input.focus();

  realisticMouseMove(input);
  await realisticTyping(input, msg.query);

  await sleep(500);

  submitSearch(input);

  setTimeout(async () => {
    await humanScroll();
  }, 2000);
});

function findSearchBox() {
  // Bing-specific selectors first
  const bingSelectors = [
    "input[name='q']",
    "textarea[name='q']",
    "#sb_form_q",
    ".b_searchbox"
  ];

  for (let sel of bingSelectors) {
    let el = document.querySelector(sel);
    if (el && el.offsetParent !== null) return el;
  }

  // Fallback to generic selectors
  const genericSelectors = [
    "input[type='search']",
    "input[name='q']",
    "textarea",
    "input[type='text']"
  ];

  for (let sel of genericSelectors) {
    let el = document.querySelector(sel);
    if (el && el.offsetParent !== null) return el;
  }

  return null;
}

function submitSearch(input) {
  // Try form submit first
  if (input.form) {
    input.form.submit();
    return;
  }

  // Enter key for Bing
  input.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    bubbles: true
  }));
}