const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const visualModulePath = path.join(__dirname, "..", "realtime-visual.js");

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

  contains(token) {
    return this.values.has(token);
  }
}

function createFixture() {
  const listeners = new Map();
  const view = {
    innerHeight: 800,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    requestAnimationFrame(callback) {
      callback();
    },
  };
  const diagram = {
    classList: new FakeClassList(),
    ownerDocument: { defaultView: view },
    rect: { top: 1000, bottom: 1400, height: 400 },
    getBoundingClientRect() {
      return this.rect;
    },
    matches(selector) {
      return selector === "[data-realtime-diagram]";
    },
  };
  const root = {
    querySelector(selector) {
      return selector === "[data-realtime-diagram]" ? diagram : null;
    },
  };

  return { diagram, listeners, root, view };
}

function createObserverHarness() {
  const observers = [];

  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = [];
      this.unobserved = [];
      observers.push(this);
    }

    observe(target) {
      this.observed.push(target);
    }

    unobserve(target) {
      this.unobserved.push(target);
    }

    trigger(target, intersectionRatio, isIntersecting = true) {
      this.callback([{ target, intersectionRatio, isIntersecting }], this);
    }
  }

  return { FakeIntersectionObserver, observers };
}

test("message animation waits until the realtime diagram is visible", () => {
  const { setupRealtimeVisual } = loadVisualModule();
  assert.equal(typeof setupRealtimeVisual, "function");
  const fixture = createFixture();
  const harness = createObserverHarness();

  setupRealtimeVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });

  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);
  assert.equal(harness.observers.length, 1);
  assert.equal(harness.observers[0].options.threshold, 0.3);
  assert.deepEqual(harness.observers[0].observed, [fixture.diagram]);

  harness.observers[0].trigger(fixture.diagram, 0.29);
  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);

  harness.observers[0].trigger(fixture.diagram, 0.3);
  assert.equal(fixture.diagram.classList.contains("is-in-view"), true);
  assert.deepEqual(harness.observers[0].unobserved, [fixture.diagram]);
});

test("scroll fallback starts the message animation only after enough of the diagram is visible", () => {
  const { setupRealtimeVisual } = loadVisualModule();
  assert.equal(typeof setupRealtimeVisual, "function");
  const fixture = createFixture();

  setupRealtimeVisual(fixture.root, { IntersectionObserver: null });

  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);
  assert.equal(fixture.listeners.has("scroll"), true);

  fixture.diagram.rect = { top: 650, bottom: 1050, height: 400 };
  fixture.listeners.get("scroll")();

  assert.equal(fixture.diagram.classList.contains("is-in-view"), true);
  assert.equal(fixture.listeners.has("scroll"), false);
});

test("realtime visual setup is idempotent", () => {
  const { setupRealtimeVisual } = loadVisualModule();
  assert.equal(typeof setupRealtimeVisual, "function");
  const fixture = createFixture();
  const harness = createObserverHarness();

  const first = setupRealtimeVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });
  const second = setupRealtimeVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });

  assert.equal(second, first);
  assert.equal(harness.observers.length, 1);
});

test("browser loading auto-initializes the realtime diagram after DOMContentLoaded", () => {
  const fixture = createFixture();
  const harness = createObserverHarness();
  const documentListeners = new Map();
  const documentRoot = {
    readyState: "loading",
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
    querySelector: fixture.root.querySelector.bind(fixture.root),
  };
  fixture.view.IntersectionObserver = harness.FakeIntersectionObserver;
  const previousDocument = global.document;
  const previousWindow = global.window;
  global.document = documentRoot;
  global.window = fixture.view;

  try {
    const visualModule = loadVisualModule();
    assert.equal(typeof visualModule.setupRealtimeVisual, "function");
    assert.equal(global.window.RealtimeVisual, visualModule);
    assert.equal(harness.observers.length, 0);

    documentListeners.get("DOMContentLoaded")();

    assert.equal(harness.observers.length, 1);
    assert.deepEqual(harness.observers[0].observed, [fixture.diagram]);
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
