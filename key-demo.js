const KeyDemo = (() => {
  const demoSelector = "[data-key-demo]";
  const controllers = new WeakMap();

  const INITIAL_TODOS = [
    { id: "buy", title: "Купить хлеб" },
    { id: "call", title: "Позвонить в банк" },
    { id: "ship", title: "Отправить отчёт" },
  ];

  const EXTRA_TODOS = [
    { id: "walk", title: "Выгулять собаку" },
    { id: "pay", title: "Оплатить счёт" },
    { id: "read", title: "Дочитать статью" },
  ];

  function createState(todos = INITIAL_TODOS) {
    return { todos: todos.map((todo) => ({ ...todo })), added: 0 };
  }

  function prependTodo(state) {
    const next = EXTRA_TODOS[state.added % EXTRA_TODOS.length];
    const suffix = Math.floor(state.added / EXTRA_TODOS.length);
    const id = suffix > 0 ? `${next.id}-${suffix}` : next.id;
    return {
      todos: [{ id, title: next.title }, ...state.todos],
      added: state.added + 1,
    };
  }

  function readChecked(list) {
    return Array.from(list?.querySelectorAll?.("input") ?? []).map((input) => Boolean(input.checked));
  }

  function shiftByIndex(checked, total) {
    const next = new Array(total).fill(false);
    for (let i = 0; i < checked.length && i < total; i += 1) next[i] = checked[i];
    return next;
  }

  function shiftById(checked, total) {
    const next = new Array(total).fill(false);
    for (let i = 0; i < checked.length; i += 1) next[i + (total - checked.length)] = checked[i];
    return next;
  }

  function setupKeyDemo(demo) {
    if (!demo) return null;
    const existing = controllers.get(demo);
    if (existing) return existing;

    const doc = demo.ownerDocument ?? (typeof document === "undefined" ? null : document);
    const lists = {
      index: demo.querySelector?.('[data-key-demo-list="index"]'),
      id: demo.querySelector?.('[data-key-demo-list="id"]'),
    };
    const prependButton = demo.querySelector?.("[data-key-demo-prepend]");
    const resetButton = demo.querySelector?.("[data-key-demo-reset]");
    let state = createState();

    function renderList(mode, checked) {
      const list = lists[mode];
      if (!list || !doc) return;
      list.textContent = "";
      state.todos.forEach((todo, index) => {
        const item = doc.createElement("li");
        item.setAttribute("data-key-demo-item", mode === "index" ? String(index) : todo.id);
        const label = doc.createElement("label");
        const input = doc.createElement("input");
        input.type = "checkbox";
        input.checked = Boolean(checked[index]);
        const key = doc.createElement("code");
        key.textContent = mode === "index" ? `key={${index}}` : `key="${todo.id}"`;
        const title = doc.createElement("span");
        title.textContent = todo.title;
        label.append(input, title);
        item.append(label, key);
        list.append(item);
      });
    }

    function render(checkedByMode) {
      renderList("index", checkedByMode.index);
      renderList("id", checkedByMode.id);
      demo.setAttribute("data-key-demo-added", String(state.added));
      demo.classList.toggle("is-touched", state.added > 0);
    }

    function prepend() {
      const before = { index: readChecked(lists.index), id: readChecked(lists.id) };
      state = prependTodo(state);
      const total = state.todos.length;
      render({
        index: shiftByIndex(before.index, total),
        id: shiftById(before.id, total),
      });
    }

    function reset() {
      state = createState();
      const empty = new Array(state.todos.length).fill(false);
      render({ index: empty, id: [...empty] });
    }

    const controller = {
      get state() {
        return state;
      },
      prepend,
      reset,
      render,
    };
    controllers.set(demo, controller);

    prependButton?.addEventListener?.("click", prepend);
    resetButton?.addEventListener?.("click", reset);
    reset();
    return controller;
  }

  function setupKeyDemos(root = typeof document === "undefined" ? null : document) {
    if (!root) return [];
    const demos = root.matches?.(demoSelector)
      ? [root]
      : Array.from(root.querySelectorAll?.(demoSelector) ?? []);
    return demos.map(setupKeyDemo);
  }

  return { INITIAL_TODOS, createState, prependTodo, shiftByIndex, shiftById, setupKeyDemo, setupKeyDemos };
})();

if (typeof window !== "undefined") {
  window.KeyDemo = KeyDemo;
}

if (typeof document !== "undefined") {
  const autoInitialize = () => {
    KeyDemo.setupKeyDemos(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialize, { once: true });
  } else {
    autoInitialize();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = KeyDemo;
}
