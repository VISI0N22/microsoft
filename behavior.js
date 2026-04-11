function random(min, max) {
  return Math.random() * (max - min) + min;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

window.realisticTyping = async function(input, text) {
  const profile = getTimeOfDayProfile();

  for (let char of text) {
    input.value += char;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    let delay = random(50, 200) / profile.speed;
    await sleep(delay);
  }
};

window.realisticMouseMove = function(target) {
  const rect = target.getBoundingClientRect();

  let x = random(0, window.innerWidth);
  let y = random(0, window.innerHeight);

  let tx = rect.left + rect.width / 2;
  let ty = rect.top + rect.height / 2;

  let steps = random(20, 50);

  for (let i = 0; i < steps; i++) {
    x += (tx - x) / (steps - i);
    y += (ty - y) / (steps - i);

    document.dispatchEvent(new MouseEvent("mousemove", {
      clientX: x,
      clientY: y
    }));
  }
};

window.humanScroll = async function() {
  for (let i = 0; i < 5; i++) {
    window.scrollBy(0, random(200, 600));
    await sleep(random(500, 1500));
  }
};