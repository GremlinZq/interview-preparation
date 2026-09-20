const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const visualModulePath = path.join(__dirname, "..", "event-loop-visual.js");

function loadVisualModule() {
  if (!existsSync(visualModulePath)) return {};

  delete require.cache[require.resolve(visualModulePath)];
  return require(visualModulePath);
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...tokens) {
    tokens.forEach((token) => this.values.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.values.delete(token));
  }

  contains(token) {
    return this.values.has(token);
  }

  toggle(token, force) {
    const shouldAdd = force === undefined ? !this.contains(token) : force;
    if (shouldAdd) this.add(token);
    else this.remove(token);
    return shouldAdd;
  }
}

class FakeButton {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  click() {
    this.listeners.get("click")?.({ currentTarget: this });
  }
}

function createSvg() {
  return {
    pauseCalls: 0,
    unpauseCalls: 0,
    currentTimes: [],
    pauseAnimations() {
      this.pauseCalls += 1;
    },
    unpauseAnimations() {
      this.unpauseCalls += 1;
    },
    setCurrentTime(value) {
      this.currentTimes.push(value);
    },
  };
}

function createFixture() {
  const diagrams = [createSvg(), createSvg()];
  const pauseButton = new FakeButton();
  const replayButton = new FakeButton();
  const label = { textContent: "" };
  const icon = { textContent: "" };
  const stages = [{}, {}];
  const panel = { hidden: false };
  const comparison = {
    classList: new FakeClassList(),
    matches(selector) {
      return selector === "[data-loop-visual-comparison]";
    },
    closest(selector) {
      return selector === "[data-tab-panel]" ? panel : null;
    },
    querySelector(selector) {
      if (selector === '[data-loop-control="pause"]') return pauseButton;
      if (selector === '[data-loop-control="replay"]') return replayButton;
      if (selector === "[data-loop-control-label]") return label;
      if (selector === "[data-loop-control-icon]") return icon;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "svg[data-loop-diagram-svg]") return diagrams;
      if (selector === "[data-loop-stage]") return stages;
      return [];
    },
  };
  const documentRoot = {
    readyState: "complete",
    listeners: new Map(),
    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    },
    dispatch(type) {
      this.listeners.get(type)?.();
    },
    querySelector(selector) {
      return selector === "[data-loop-visual-comparison]"
        ? comparison
        : null;
    },
  };

  return {
    comparison,
    diagrams,
    documentRoot,
    icon,
    label,
    pauseButton,
    panel,
    replayButton,
    stages,
  };
}

test("pause initializes accessible state and toggles both SVG animations together", () => {
  const { setupLoopVisualComparison } = loadVisualModule();
  assert.equal(typeof setupLoopVisualComparison, "function");
  const fixture = createFixture();

  setupLoopVisualComparison(fixture.comparison);

  assert.equal(fixture.pauseButton.getAttribute("aria-pressed"), "false");
  assert.equal(fixture.label.textContent, "Пауза");
  assert.equal(fixture.icon.textContent, "Ⅱ");

  fixture.pauseButton.click();

  assert.deepEqual(
    fixture.diagrams.map(({ pauseCalls }) => pauseCalls),
    [1, 1],
  );
  assert.equal(fixture.comparison.classList.contains("is-paused"), true);
  assert.equal(fixture.pauseButton.getAttribute("aria-pressed"), "true");
  assert.equal(fixture.label.textContent, "Продолжить");
  assert.equal(fixture.icon.textContent, "▶");

  fixture.pauseButton.click();

  assert.deepEqual(
    fixture.diagrams.map(({ unpauseCalls }) => unpauseCalls),
    [1, 1],
  );
  assert.equal(fixture.comparison.classList.contains("is-paused"), false);
  assert.equal(fixture.pauseButton.getAttribute("aria-pressed"), "false");
  assert.equal(fixture.label.textContent, "Пауза");
  assert.equal(fixture.icon.textContent, "Ⅱ");
});

test("replay resets both timelines and starts them even when they were paused", () => {
  const { setupLoopVisualComparison } = loadVisualModule();
  assert.equal(typeof setupLoopVisualComparison, "function");
  const fixture = createFixture();
  const frames = [];

  setupLoopVisualComparison(fixture.comparison, {
    requestAnimationFrame: (callback) => frames.push(callback),
  });
  fixture.pauseButton.click();
  fixture.replayButton.click();

  assert.deepEqual(
    fixture.diagrams.map(({ currentTimes }) => currentTimes),
    [[0], [0]],
  );
  assert.equal(fixture.comparison.classList.contains("is-replaying"), true);
  assert.equal(fixture.comparison.classList.contains("is-paused"), false);
  assert.equal(fixture.pauseButton.getAttribute("aria-pressed"), "false");
  assert.equal(fixture.label.textContent, "Пауза");
  assert.equal(fixture.icon.textContent, "Ⅱ");
  assert.deepEqual(
    fixture.diagrams.map(({ unpauseCalls }) => unpauseCalls),
    [1, 1],
  );

  frames.shift()();
  assert.equal(fixture.comparison.classList.contains("is-replaying"), true);
  frames.shift()();
  assert.equal(fixture.comparison.classList.contains("is-replaying"), false);
  assert.equal(fixture.comparison.classList.contains("is-paused"), false);
});

test("browser loading auto-initializes the comparison after DOMContentLoaded", () => {
  const fixture = createFixture();
  fixture.documentRoot.readyState = "loading";
  const previousDocument = global.document;
  const previousWindow = global.window;
  global.document = fixture.documentRoot;
  global.window = {};

  try {
    const visualModule = loadVisualModule();
    assert.equal(typeof visualModule.setupLoopVisualComparison, "function");
    assert.equal(global.window.EventLoopVisual, visualModule);
    assert.equal(fixture.pauseButton.listeners.has("click"), false);

    fixture.documentRoot.dispatch("DOMContentLoaded");
    fixture.pauseButton.click();

    assert.deepEqual(
      fixture.diagrams.map(({ pauseCalls }) => pauseCalls),
      [1, 1],
    );
  } finally {
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
    if (previousWindow === undefined) delete global.window;
    else global.window = previousWindow;
    if (existsSync(visualModulePath)) {
      delete require.cache[require.resolve(visualModulePath)];
    }
  }
});

test("setup is idempotent so tab changes cannot duplicate controls", () => {
  const { setupLoopVisualComparison } = loadVisualModule();
  const fixture = createFixture();

  const firstController = setupLoopVisualComparison(fixture.comparison);
  const secondController = setupLoopVisualComparison(fixture.comparison);

  assert.equal(secondController, firstController);
});

test("showing the browser tab restarts hidden SVG and CSS timelines together", () => {
  const { setupLoopVisualComparison } = loadVisualModule();
  const fixture = createFixture();
  const observers = [];
  const frames = [];
  fixture.panel.hidden = true;

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe(target, options) {
      this.target = target;
      this.options = options;
    }
  }

  setupLoopVisualComparison(fixture.comparison, {
    MutationObserver: FakeMutationObserver,
    requestAnimationFrame: (callback) => frames.push(callback),
  });

  assert.equal(observers.length, 1);
  assert.equal(observers[0].target, fixture.panel);
  assert.deepEqual(observers[0].options.attributeFilter, ["hidden"]);
  assert.deepEqual(
    fixture.diagrams.map(({ pauseCalls }) => pauseCalls),
    [1, 1],
  );

  fixture.panel.hidden = false;
  observers[0].callback();

  assert.deepEqual(
    fixture.diagrams.map(({ currentTimes }) => currentTimes),
    [[0], [0]],
  );
  assert.deepEqual(
    fixture.diagrams.map(({ unpauseCalls }) => unpauseCalls),
    [1, 1],
  );
  assert.equal(fixture.comparison.classList.contains("is-paused"), false);
});
