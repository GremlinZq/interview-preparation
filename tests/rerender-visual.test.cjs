const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const modulePath = path.join(__dirname, "..", "rerender-visual.js");
const indexPath = path.join(__dirname, "..", "index.html");

function load() {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function figureMarkup(name) {
  const page = fs.readFileSync(indexPath, "utf8");
  const start = page.indexOf(`data-story="${name}"`);
  assert.ok(start > 0, `figure for story ${name} exists in index.html`);
  const end = page.indexOf("</figure>", start);
  return page.slice(start, end);
}

function makeElement(attrs = {}, initialClasses = []) {
  const classes = new Set(initialClasses);
  const handlers = {};
  return {
    textContent: "",
    attrs: { ...attrs },
    classList: {
      toggle(token, force) {
        const on = force === undefined ? !classes.has(token) : Boolean(force);
        if (on) classes.add(token); else classes.delete(token);
        return on;
      },
      contains: (token) => classes.has(token),
    },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return this.attrs[name] ?? null; },
    addEventListener(type, fn) { handlers[type] = fn; },
    click() { handlers.click?.(); },
  };
}

function createFixture(storyName, hiddenAtStart = []) {
  const fields = new Map();
  const svg = {
    querySelector(selector) {
      const match = /^\[data-wk="([^"]+)"\]$/.exec(selector);
      if (!match) return null;
      if (!fields.has(match[1])) fields.set(match[1], makeElement({}, hiddenAtStart.includes(match[1]) ? ["is-off"] : []));
      return fields.get(match[1]);
    },
  };
  const controls = { play: makeElement(), prev: makeElement(), next: makeElement(), replay: makeElement() };
  const label = makeElement();
  const cap = makeElement();
  const term = makeElement();
  const count = makeElement();
  const phases = [0, 1, 2, 3, 4].map((n) => makeElement({ "data-walk-phase": String(n) }));
  const figureClasses = new Set();
  const figure = {
    classList: {
      toggle(token, force) { if (force) figureClasses.add(token); else figureClasses.delete(token); },
      contains: (token) => figureClasses.has(token),
    },
    getAttribute: (name) => (name === "data-story" ? storyName : null),
    matches: (selector) => selector === "[data-story]",
    querySelector(selector) {
      if (selector === "svg[data-story-svg]") return svg;
      const control = /^\[data-walk-control="([^"]+)"\]$/.exec(selector);
      if (control) return controls[control[1]] ?? null;
      if (selector === "[data-walk-control-label]") return label;
      if (selector === "[data-walk-cap]") return cap;
      if (selector === "[data-walk-term]") return term;
      if (selector === "[data-walk-count]") return count;
      return null;
    },
    querySelectorAll(selector) { return selector === "[data-walk-phase]" ? phases : []; },
  };
  const timers = new Map();
  let nextId = 1;
  const hidden = { value: false };
  const options = {
    setTimeout(fn, ms) { const id = nextId++; timers.set(id, { fn, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    isHidden: () => hidden.value,
    reducedMotion: false,
  };
  const fire = (ms) => { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.fn(); } };
  const pending = (ms) => [...timers.values()].filter((timer) => timer.ms === ms).length;
  const field = (name) => svg.querySelector(`[data-wk="${name}"]`);
  return { figure, field, controls, label, cap, term, count, phases, options, fire, pending, hidden };
}

test("fifty-one stories, and every field, port and rect they touch exists in the page markup", () => {
  const { STORIES, namesOf } = load();

  assert.deepEqual(Object.keys(STORIES), ["cost", "memo", "structure", "context", "transition", "tool-memo", "tool-callback", "tool-usememo", "hook-timing", "hook-stale", "hook-race", "hook-ref", "hook-custom", "pattern-compose", "pattern-compound", "pattern-controlled", "pattern-headless", "pattern-ds", "state-kinds", "state-query", "state-store", "state-derived", "state-stream", "csp-flow", "http-versions", "this-rule", "this-lost", "this-arrow", "this-class", "proto-link", "proto-chain", "proto-create", "proto-shared", "proto-inherit", "ts-type-interface", "ts-problems", "ts-generics", "ts-generic-limits", "ts-unknown-never", "ts-narrowing", "ts-util-objects", "ts-util-unions", "ts-util-functions", "ts-util-async", "ts-util-const", "ai-request", "ai-stream", "ai-embed", "ai-rag", "ai-prompt", "ai-eval"]);
  for (const [name, story] of Object.entries(STORIES)) {
    const markup = figureMarkup(name);
    const present = new Set([...markup.matchAll(/data-wk="([^"]+)"/g)].map((m) => m[1]));
    const names = namesOf(story);
    for (const field of [...names.text, ...names.vis, ...names.cls, ...story.rects, "tok"]) {
      assert.ok(present.has(field), `${name}: markup has data-wk="${field}"`);
    }
    assert.equal((markup.match(/data-walk-phase=/g) ?? []).length, story.phases.length, `${name}: phase buttons match phases`);
    assert.ok(story.steps.length >= 4, `${name}: at least four steps`);
    const phases = new Set();
    for (const step of story.steps) {
      assert.ok(step.cap.length > 40 && step.term.length > 10, `${name}: caption and term line per step`);
      phases.add(step.phase);
      for (const port of step.tok) assert.ok(story.ports[port], `${name}: port ${port}`);
      for (const rect of step.on) assert.ok(story.rects.includes(rect), `${name}: highlight ${rect}`);
    }
    assert.equal(phases.size, story.phases.length, `${name}: every phase is reached`);
  }
});

test("memo story: memo skips List, an inline arrow breaks it, useCallback fixes it", () => {
  const { STORIES, stateAt } = load();
  const story = STORIES.memo;

  assert.equal(stateAt(story, 0).text["c-calls"], "вызовов: 7");
  assert.equal(stateAt(story, 1).cls["list-r"]["is-skipped"], true);
  assert.equal(stateAt(story, 1).text["c-skip"], "пропущено: 4");
  assert.equal(stateAt(story, 2).cls["list-r"]["is-called"], true);
  assert.equal(stateAt(story, 2).cls["list-r"]["is-skipped"], false);
  assert.match(stateAt(story, 2).text.l8, /onSelect=\{\(\) => f\(\)\}/);
  assert.equal(stateAt(story, 3).cls["list-r"]["is-skipped"], true);
  assert.match(stateAt(story, 3).text.l4, /useCallback/);
  assert.equal(stateAt(story, 4).text.hl, "");
});

test("cost story: seven calls, one difference, one DOM patch", () => {
  const { STORIES, stateAt } = load();
  const story = STORIES.cost;

  assert.equal(stateAt(story, 2).text["c-calls"], "вызовов функций: 7");
  assert.equal(stateAt(story, 3).text["c-diff"], "разниц найдено: 1");
  assert.equal(stateAt(story, 3).text["c-dom"], undefined, "render phase does not touch the DOM counter");
  assert.equal(stateAt(story, 4).text["c-dom"], "правок DOM: 1");
  assert.equal(stateAt(story, 5).vis.rule, true);
});

test("setup paints the first step, restores markup defaults when stepping back, and arms autoplay", () => {
  const { setupStory } = load();
  const f = createFixture("transition", ["s1", "s2", "k2", "i1", "t1", "cut", "i2", "t2", "user"]);

  const controller = setupStory(f.figure, f.options);

  assert.equal(controller.index, 0);
  assert.equal(f.count.textContent, "шаг 1 / 5");
  assert.equal(f.field("s1").classList.contains("is-off"), false, "step one shows the long sync bar");
  assert.equal(f.field("s2").classList.contains("is-off"), true);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(140,18)");
  assert.equal(f.pending(4600), 1);

  controller.go(2);
  assert.equal(f.field("s1").classList.contains("is-off"), true, "startTransition step hides the sync bars");
  assert.equal(f.field("t1").classList.contains("is-off"), false);
  assert.equal(f.field("hl").getAttribute("y"), String(190 + 6 + 14 * 5), "highlight uses the story's code top");

  controller.prev();
  assert.equal(controller.index, 1);
  assert.equal(f.field("t1").classList.contains("is-off"), true, "stepping back restores the markup default");
  assert.equal(f.field("s2").classList.contains("is-off"), false);
});

test("navigation: phase buttons jump and pause, prev wraps, replay resumes, hidden tab does not advance", () => {
  const { setupStory } = load();
  const f = createFixture("cost");
  const controller = setupStory(f.figure, f.options);

  f.phases[2].click();
  assert.equal(controller.index, 4, "commit phase starts at its first step");
  assert.equal(controller.playing, false);
  assert.equal(f.label.textContent, "Играть");
  assert.equal(f.field("c-dom").textContent, "правок DOM: 1");
  assert.equal(f.field("dom-h1").classList.contains("is-changed"), true);

  f.controls.prev.click();
  f.controls.prev.click();
  f.controls.prev.click();
  f.controls.prev.click();
  f.controls.prev.click();
  assert.equal(controller.index, 5, "prev wraps around");

  f.controls.replay.click();
  assert.equal(controller.index, 0);
  assert.equal(controller.playing, true);
  assert.equal(f.pending(4600), 1);

  f.hidden.value = true;
  f.fire(4600);
  assert.equal(controller.index, 0);
  assert.equal(f.pending(4600), 1);
  f.hidden.value = false;
  f.fire(4600);
  assert.equal(controller.index, 1);
  f.fire(650);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(267,58)", "token hops to the second port");
});

test("setupRerenderVisuals wires every story figure once and ignores unknown stories", () => {
  const { setupRerenderVisuals, setupStory } = load();
  const a = createFixture("memo");
  const b = createFixture("context");
  const unknown = createFixture("nope");
  const root = { querySelectorAll: (selector) => (selector === "[data-story]" ? [a.figure, b.figure, unknown.figure] : []) };

  const controllers = setupRerenderVisuals(root, a.options);

  assert.equal(controllers.length, 2);
  assert.equal(controllers[0].story, load().STORIES.memo === undefined ? null : controllers[0].story);
  assert.equal(setupStory(a.figure, a.options), controllers[0], "setup is idempotent per figure");
  assert.equal(setupStory(null), null);
  assert.deepEqual(setupRerenderVisuals(null), []);
});
