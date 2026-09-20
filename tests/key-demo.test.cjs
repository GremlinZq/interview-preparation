const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const modulePath = path.join(__dirname, "..", "key-demo.js");

function load() {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

test("prepending adds a new todo in front and keeps the rest in order", () => {
  const { createState, prependTodo } = load();

  const first = prependTodo(createState());
  assert.deepEqual(first.todos.map((t) => t.id), ["walk", "buy", "call", "ship"]);
  assert.equal(first.added, 1);

  const second = prependTodo(first);
  assert.deepEqual(second.todos.map((t) => t.id), ["pay", "walk", "buy", "call", "ship"]);
});

test("prepending stays unique after the extra pool is exhausted", () => {
  const { createState, prependTodo } = load();

  let state = createState();
  for (let i = 0; i < 4; i += 1) state = prependTodo(state);

  const ids = state.todos.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, `duplicate keys: ${ids.join(",")}`);
  assert.equal(ids[0], "walk-1");
});

test("index keys keep checked state on the position, id keys move it with the item", () => {
  const { shiftByIndex, shiftById } = load();

  // "Позвонить в банк" was checked at position 1 of 3, then one todo is prepended.
  const before = [false, true, false];

  // Index keys: React reuses node 1, so the checkbox stays on the new position 1.
  assert.deepEqual(shiftByIndex(before, 4), [false, true, false, false]);

  // Id keys: the same todo is now at position 2 and carries its state along.
  assert.deepEqual(shiftById(before, 4), [false, false, true, false]);
});

test("the demo renders both boards and resets to a clean list", () => {
  const { setupKeyDemo, INITIAL_TODOS } = load();
  const { demo, lists, buttons } = createFixture();

  const controller = setupKeyDemo(demo);

  assert.equal(lists.index.children.length, INITIAL_TODOS.length);
  assert.equal(lists.id.children.length, INITIAL_TODOS.length);
  assert.equal(demo.classList.contains("is-touched"), false);

  lists.index.children[1].input.checked = true;
  lists.id.children[1].input.checked = true;
  buttons.prepend.click();

  assert.equal(controller.state.todos.length, INITIAL_TODOS.length + 1);
  assert.equal(demo.classList.contains("is-touched"), true);
  assert.deepEqual(
    lists.index.children.map((li) => li.input.checked),
    [false, true, false, false],
    "index keys leave the checkbox on the position",
  );
  assert.deepEqual(
    lists.id.children.map((li) => li.input.checked),
    [false, false, true, false],
    "id keys carry the checkbox to the same todo",
  );

  buttons.reset.click();
  assert.equal(lists.index.children.length, INITIAL_TODOS.length);
  assert.equal(lists.id.children.every((li) => li.input.checked === false), true);
  assert.equal(demo.classList.contains("is-touched"), false);
});

test("demo setup is idempotent and finds every demo under a root", () => {
  const { setupKeyDemo, setupKeyDemos } = load();
  const first = createFixture();
  const second = createFixture();
  const root = {
    querySelectorAll: (selector) => (selector === "[data-key-demo]" ? [first.demo, second.demo] : []),
  };

  const controllers = setupKeyDemos(root);

  assert.equal(controllers.length, 2);
  assert.equal(setupKeyDemo(first.demo), controllers[0]);
  assert.equal(setupKeyDemos(null).length, 0);
});

function createElement(tag) {
  const node = {
    tagName: tag.toUpperCase(),
    children: [],
    attributes: {},
    textContent: "",
    checked: false,
    type: "",
    input: null,
    append(...nodes) {
      nodes.forEach((child) => {
        this.children.push(child);
        if (child.tagName === "INPUT") this.input = child;
        else if (child.input) this.input = child.input;
      });
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    querySelectorAll(selector) {
      const wanted = selector.toUpperCase();
      const found = [];
      const walk = (element) => {
        element.children.forEach((child) => {
          if (child.tagName === wanted) found.push(child);
          walk(child);
        });
      };
      walk(this);
      return found;
    },
  };
  return node;
}

function createFixture() {
  const lists = { index: createElement("ul"), id: createElement("ul") };
  lists.index.textContent = "";
  lists.id.textContent = "";
  for (const list of Object.values(lists)) {
    Object.defineProperty(list, "textContent", {
      set() {
        this.children.length = 0;
      },
      get() {
        return "";
      },
      configurable: true,
    });
  }

  const makeButton = () => {
    let handler = null;
    return {
      addEventListener(type, fn) {
        if (type === "click") handler = fn;
      },
      click() {
        handler?.();
      },
    };
  };
  const buttons = { prepend: makeButton(), reset: makeButton() };

  const classes = new Set();
  const demo = {
    classList: {
      toggle(token, force) {
        if (force) classes.add(token);
        else classes.delete(token);
      },
      contains: (token) => classes.has(token),
    },
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    ownerDocument: { createElement },
    matches: (selector) => selector === "[data-key-demo]",
    querySelector(selector) {
      if (selector === '[data-key-demo-list="index"]') return lists.index;
      if (selector === '[data-key-demo-list="id"]') return lists.id;
      if (selector === "[data-key-demo-prepend]") return buttons.prepend;
      if (selector === "[data-key-demo-reset]") return buttons.reset;
      return null;
    },
  };

  return { demo, lists, buttons };
}
