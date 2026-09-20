const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const modulePath = path.join(__dirname, "..", "walk-visual.js");

function load() {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function makeElement(attrs = {}) {
  const classes = new Set();
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

function createFixture() {
  const fields = new Map();
  const svg = {
    querySelector(selector) {
      const match = /^\[data-wk="([^"]+)"\]$/.exec(selector);
      if (!match) return null;
      if (!fields.has(match[1])) fields.set(match[1], makeElement());
      return fields.get(match[1]);
    },
  };
  const controls = { play: makeElement(), prev: makeElement(), next: makeElement(), replay: makeElement() };
  const label = makeElement();
  const icon = makeElement();
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
    matches: (selector) => selector === "[data-walk-visual]",
    querySelector(selector) {
      if (selector === "svg[data-walk-svg]") return svg;
      const control = /^\[data-walk-control="([^"]+)"\]$/.exec(selector);
      if (control) return controls[control[1]] ?? null;
      if (selector === "[data-walk-control-label]") return label;
      if (selector === "[data-walk-control-icon]") return icon;
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
  function fire(ms) {
    for (const [id, timer] of [...timers]) {
      if (timer.ms === ms) { timers.delete(id); timer.fn(); }
    }
  }
  const pending = (ms) => [...timers.values()].filter((timer) => timer.ms === ms).length;
  const field = (name) => svg.querySelector(`[data-wk="${name}"]`);
  return { figure, field, controls, label, icon, cap, term, count, phases, timers, options, fire, pending, hidden };
}

test("the story is 17 steps whose ports, highlights and phases all exist", () => {
  const { STEPS, PORTS, RECTS } = load();

  assert.equal(STEPS.length, 17);
  const phases = new Set();
  for (const step of STEPS) {
    assert.ok(step.cap.length > 40 && step.term.length > 10, "every step has a plain-words caption and a term line");
    assert.ok(step.phase >= 0 && step.phase <= 4);
    phases.add(step.phase);
    for (const port of step.tok) assert.ok(PORTS[port], `unknown token port ${port}`);
    for (const box of step.hi) assert.ok(RECTS.includes(box), `unknown highlight ${box}`);
  }
  assert.deepEqual([...phases].sort(), [0, 1, 2, 3, 4]);
});

test("state accumulates: hooks land in slots, reconciliation flags the button, commit reaches the DOM", () => {
  const { stateAt } = load();

  assert.equal(stateAt(3).s1, "слот 1: —");
  assert.equal(stateAt(4).s1, "1: useState → 0");
  assert.equal(stateAt(5).s2, "2: useEffect → fx");
  assert.equal(stateAt(5).af, "флаги: есть эффект");
  assert.equal(stateAt(6).desc, true);
  assert.equal(stateAt(7).btn, true);
  assert.equal(stateAt(7).bf, "флаги: вставить");
  assert.equal(stateAt(7).ak, "дети: button");
  assert.equal(stateAt(8).bd, "DOM-узел: в памяти");
  assert.equal(stateAt(8).dbtn, false, "render phase never touches the DOM");
  assert.equal(stateAt(9).dbtn, true);
  assert.equal(stateAt(9).bd, "DOM-узел: на странице");
  assert.equal(stateAt(10).wip, false);
  assert.equal(stateAt(10).scr, true);
  assert.equal(stateAt(12).s1, "1: useState 0, ждёт 1");
  assert.equal(stateAt(12).q, "обновить App");
  assert.equal(stateAt(13).s1, "1: useState → 1");
  assert.equal(stateAt(13).mode, "режим update");
  assert.equal(stateAt(14).bf, "флаги: обновить");
  assert.equal(stateAt(15).stxt, "1");
  assert.equal(stateAt(15).dtxt, "└ button: 1");
});

test("setup paints step one, parks the token on the queue and arms autoplay", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();

  const controller = setupWalkVisual(f.figure, f.options);

  assert.equal(controller.index, 0);
  assert.equal(controller.playing, true);
  assert.equal(f.count.textContent, "шаг 1 / 17");
  assert.match(f.cap.textContent, /^Старт\./);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(466,224)");
  assert.equal(f.field("q").textContent, "отрендерить App");
  assert.equal(f.field("root").classList.contains("is-off"), false);
  assert.equal(f.field("app").classList.contains("is-off"), true);
  assert.equal(f.field("q-r").classList.contains("is-on"), true);
  assert.equal(f.field("hl").classList.contains("is-off"), true);
  assert.equal(f.phases[0].getAttribute("aria-pressed"), "true");
  assert.equal(f.phases[1].getAttribute("aria-pressed"), "false");
  assert.equal(f.pending(4200), 1);
});

test("next, prev and phase buttons navigate; a phase jump pauses autoplay", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();
  const controller = setupWalkVisual(f.figure, f.options);

  f.controls.next.click();
  assert.equal(controller.index, 1);
  assert.equal(f.count.textContent, "шаг 2 / 17");
  assert.equal(f.field("e-now").textContent, "Сейчас: HostRoot");
  assert.equal(f.field("root-r").classList.contains("is-wip"), true);
  assert.equal(f.phases[1].getAttribute("aria-pressed"), "true");

  f.controls.prev.click();
  assert.equal(controller.index, 0);
  f.controls.prev.click();
  assert.equal(controller.index, 16, "prev wraps around to the recap");

  f.phases[2].click();
  assert.equal(controller.index, 9, "commit phase starts at its first step");
  assert.equal(controller.playing, false);
  assert.equal(f.figure.classList.contains("is-paused"), true);
  assert.equal(f.controls.play.getAttribute("aria-pressed"), "true");
  assert.equal(f.label.textContent, "Играть");
  assert.equal(f.pending(4200), 0);
  assert.equal(f.field("dbtn").classList.contains("is-off"), false);
  assert.equal(f.field("dom-r").classList.contains("is-on"), true);
});

test("autoplay advances on the timer, the token hops through its ports, replay rewinds", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();
  const controller = setupWalkVisual(f.figure, f.options);

  f.fire(4200);
  assert.equal(controller.index, 1);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(466,224)");
  f.fire(650);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(466,44)");
  f.fire(1300);
  assert.equal(f.field("tok").getAttribute("transform"), "translate(716,62)");

  f.controls.play.click();
  assert.equal(controller.playing, false);
  assert.equal(f.pending(4200), 0);
  f.controls.play.click();
  assert.equal(controller.playing, true);
  assert.equal(f.label.textContent, "Пауза");
  assert.equal(f.pending(4200), 1);

  f.controls.next.click();
  f.controls.replay.click();
  assert.equal(controller.index, 0);
  assert.equal(controller.playing, true);
  assert.equal(f.pending(4200), 1);
});

test("a hidden document re-arms the timer without advancing", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();
  const controller = setupWalkVisual(f.figure, f.options);

  f.hidden.value = true;
  f.fire(4200);
  assert.equal(controller.index, 0);
  assert.equal(f.pending(4200), 1);

  f.hidden.value = false;
  f.fire(4200);
  assert.equal(controller.index, 1);
});

test("reduced motion starts paused and moves the token without hops", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();
  const controller = setupWalkVisual(f.figure, { ...f.options, reducedMotion: true });

  assert.equal(controller.playing, false);
  assert.equal(f.pending(4200), 0);
  controller.next();
  assert.equal(f.field("tok").getAttribute("transform"), "translate(716,62)");
  assert.equal(f.pending(650), 0);
});

test("setup is idempotent and tolerates a missing figure", () => {
  const { setupWalkVisual } = load();
  const f = createFixture();

  const first = setupWalkVisual(f.figure, f.options);
  const second = setupWalkVisual(f.figure, f.options);

  assert.equal(second, first);
  assert.equal(setupWalkVisual({ querySelector: () => null }), null);
  assert.equal(setupWalkVisual(null), null);
});
