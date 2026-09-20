const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const visualModulePath = path.join(__dirname, "..", "declarations-visual.js");

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
      return selector === "[data-variable-diagram]";
    },
  };
  const root = {
    querySelector(selector) {
      return selector === "[data-variable-diagram]" ? diagram : null;
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

test("scope animation waits until the diagram is visible before starting", () => {
  const { setupDeclarationsVisual } = loadVisualModule();
  assert.equal(typeof setupDeclarationsVisual, "function");
  const fixture = createFixture();
  const harness = createObserverHarness();

  setupDeclarationsVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });

  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);
  assert.equal(harness.observers.length, 1);
  assert.equal(harness.observers[0].options.threshold, 0.3);
  assert.deepEqual(harness.observers[0].observed, [fixture.diagram]);

  harness.observers[0].trigger(fixture.diagram, 0.2);
  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);

  harness.observers[0].trigger(fixture.diagram, 0.3);
  assert.equal(fixture.diagram.classList.contains("is-in-view"), true);
  assert.deepEqual(harness.observers[0].unobserved, [fixture.diagram]);
});

test("scroll fallback also waits until the diagram is visible", () => {
  const { setupDeclarationsVisual } = loadVisualModule();
  assert.equal(typeof setupDeclarationsVisual, "function");
  const fixture = createFixture();

  setupDeclarationsVisual(fixture.root, { IntersectionObserver: null });

  assert.equal(fixture.diagram.classList.contains("is-in-view"), false);
  assert.equal(fixture.listeners.has("scroll"), true);

  fixture.diagram.rect = { top: 600, bottom: 1000, height: 400 };
  fixture.listeners.get("scroll")();

  assert.equal(fixture.diagram.classList.contains("is-in-view"), true);
  assert.equal(fixture.listeners.has("scroll"), false);
});

test("scope visual setup is idempotent", () => {
  const { setupDeclarationsVisual } = loadVisualModule();
  assert.equal(typeof setupDeclarationsVisual, "function");
  const fixture = createFixture();
  const harness = createObserverHarness();

  const first = setupDeclarationsVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });
  const second = setupDeclarationsVisual(fixture.root, {
    IntersectionObserver: harness.FakeIntersectionObserver,
  });

  assert.equal(second, first);
  assert.equal(harness.observers.length, 1);
});
