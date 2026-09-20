/*
 * Scene 03 of the React tab: a step-by-step walkthrough of one render cycle.
 * The SVG is static markup; this script repaints it for every step (texts,
 * visibility, highlights) and moves the token between named ports.
 */
const WalkVisual = (() => {
  const figureSelector = "[data-walk-visual]";
  const svgSelector = "svg[data-walk-svg]";
  const STEP_DELAY = 4200;
  const HOP_DELAY = 650;

  const PORTS = {
    Q: [466, 224],
    ENG: [466, 44],
    CMP: [466, 262],
    ROOT: [716, 62],
    APP: [716, 96],
    S1: [716, 114],
    S2: [716, 131],
    BTN: [716, 200],
    CODE1: [242, 41],
    CODE3: [242, 69],
    CODE4: [242, 83],
    CODE5: [242, 97],
    CODE6: [242, 111],
    REACT: [242, 179],
    DESC: [242, 236],
    DOM: [880, 80],
    SCR: [880, 134],
  };

  const RECTS = ["code-r", "react-r", "desc-r", "eng-r", "q-r", "cmp-r", "root-r", "app-r", "btn-r", "dom-r", "scr-r"];
  const WIP_RECTS = ["root-r", "app-r", "btn-r"];
  const GROUPS = ["desc", "cmp", "root", "app", "btn", "dbtn", "scr", "ring"];
  const CODE_TOP = 20;
  const CODE_LINE = 14;

  function initialState() {
    return {
      code: 0,
      now: "—",
      mode: "—",
      doing: "жду задание",
      n1: "",
      n2: "",
      q: "пусто",
      desc: false,
      d2: "props: {onClick, 0}",
      cmp: false,
      cold: "было: —",
      cnew: "стало: —",
      cres: "итог: —",
      tree: "дерево: пусто",
      root: false,
      app: false,
      wip: false,
      s1: "слот 1: —",
      s2: "слот 2: —",
      af: "флаги: —",
      ak: "дети: —",
      btn: false,
      bp: "button · {n: 0}",
      bf: "флаги: —",
      bd: "DOM-узел: —",
      dbtn: false,
      dtxt: "└ button: 0",
      scr: false,
      stxt: "0",
      ring: false,
    };
  }

  const STEPS = [
    {
      phase: 0,
      hi: ["q-r", "root-r"],
      tok: ["Q"],
      apply(s) { s.q = "отрендерить App"; s.root = true; s.tree = "дерево: только корень"; },
      cap: "Старт. Ты вызвал root.render(<App/>): React завёл корень памяти и положил в очередь задание «отрендерить App». Больше пока ничего не произошло.",
      term: "createRoot → FiberRoot + HostRoot fiber · scheduleUpdateOnFiber → Scheduler",
    },
    {
      phase: 1,
      hi: ["eng-r", "root-r"],
      tok: ["Q", "ENG", "ROOT"],
      apply(s) { s.q = "пусто"; s.now = "HostRoot"; s.doing = "обход дерева"; s.tree = "черновик (workInProgress)"; s.wip = true; },
      cap: "Render начался. Движок взял задание и пошёл по дереву с корня. Правит он не то дерево, что на экране, а черновик — копию.",
      term: "performConcurrentWorkOnRoot → renderRoot · workInProgress = createWorkInProgress(current) · fiber.alternate",
    },
    {
      phase: 1,
      hi: ["app-r"],
      tok: ["ROOT", "APP"],
      apply(s) { s.app = true; s.doing = "карточка для App"; },
      cap: "У корня ребёнок — <App/>, а карточки для него нет. Значит, первый рендер: движок заводит карточку App. Карточка и есть fiber — память про один компонент.",
      term: "beginWork(HostRoot) → reconcileChildren → createFiberFromElement(App) · mount",
    },
    {
      phase: 1,
      hi: ["eng-r", "code-r"],
      tok: ["ENG", "CODE1"],
      apply(s) { s.code = 1; s.now = "App"; s.mode = "режим mount"; s.doing = "вызов App(props)"; },
      cap: "Движок вызывает твою функцию и держит в руках её карточку: «сейчас рендерится App, хуки — в режиме первого запуска». Сама функция между вызовами ничего не помнит.",
      term: "renderWithHooks(null, wip, App, props) · currentlyRenderingFiber = wip · dispatcher = HooksDispatcherOnMount",
    },
    {
      phase: 1,
      hi: ["react-r", "app-r"],
      tok: ["CODE3", "REACT", "ENG", "S1"],
      apply(s) { s.code = 3; s.doing = "пишу слот 1"; s.s1 = "1: useState → 0"; },
      cap: "Вот откуда хуки. Ты зовёшь useState(0) — это дверь из пакета react в движок. Движок пишет 0 в слот №1 карточки App и отдаёт тебе [0, setN]. setN привязан к этой карточке.",
      term: "useState → ReactCurrentDispatcher.useState → mountState · hook {memoizedState: 0, queue} → fiber.memoizedState · dispatch = dispatchSetState.bind(fiber, queue)",
    },
    {
      phase: 1,
      hi: ["react-r", "app-r"],
      tok: ["CODE4", "REACT", "ENG", "S2"],
      apply(s) { s.code = 4; s.doing = "пишу слот 2"; s.s2 = "2: useEffect → fx"; s.af = "флаги: есть эффект"; },
      cap: "Второй хук — слот №2 и пометка на карточке «после отрисовки запустить эффект». Слоты нумеруются по порядку вызова, поэтому хук нельзя ставить под if: номера съедут.",
      term: "mountEffect → pushEffect · fiber.flags |= PassiveEffect · хуки = связный список, next по порядку вызова",
    },
    {
      phase: 1,
      hi: ["code-r", "desc-r"],
      tok: ["CODE5", "DESC"],
      apply(s) { s.code = [5, 7]; s.now = "—"; s.mode = "—"; s.doing = "беру описание"; s.desc = true; },
      cap: "App вернул описание: обычные объекты «хочу кнопку с текстом 0». Это и есть Virtual DOM — не настоящие элементы, а лёгкое описание того, что должно быть на экране.",
      term: "JSX → jsx() / createElement → ReactElement {type, props, key} · Virtual DOM = дерево элементов",
    },
    {
      phase: 1,
      hi: ["cmp-r", "btn-r"],
      tok: ["DESC", "CMP", "BTN"],
      apply(s) { s.doing = "сравниваю детей"; s.cmp = true; s.cold = "было: детей нет"; s.cnew = "стало: button"; s.cres = "итог: создать новую"; s.btn = true; s.bf = "флаги: вставить"; s.ak = "дети: button"; },
      cap: "Реконсиляция — вот она. Движок сравнивает описание с детьми карточки App. Детей ещё нет → заводит карточку button с пометкой «вставить». DOM пока не трогает.",
      term: "reconcileChildren → reconcileChildFibers(current.child, newChildren) · placeChild → flags |= Placement",
    },
    {
      phase: 1,
      hi: ["btn-r", "app-r"],
      tok: ["BTN", "APP", "ROOT"],
      apply(s) { s.now = "button"; s.doing = "вверх по дереву"; s.n1 = "между карточками"; s.n2 = "можно прерваться"; s.bd = "DOM-узел: в памяти"; },
      cap: "Движок дошёл до листа: создал DOM-узел кнопки, но пока держит его в памяти. Потом идёт вверх, собирая пометки. Между карточками он может остановиться и отдать браузеру время — ради этого React и перешёл на fiber вместо рекурсии.",
      term: "completeWork → createInstance → fiber.stateNode · return-указатель вверх, subtreeFlags · workLoopConcurrent: while (wip !== null && !shouldYield())",
    },
    {
      phase: 2,
      hi: ["dom-r"],
      tok: ["ENG", "BTN", "DOM"],
      apply(s) { s.now = "—"; s.doing = "commit в DOM"; s.n1 = "прерывать нельзя"; s.n2 = "правки разом"; s.dbtn = true; s.bd = "DOM-узел: на странице"; s.bf = "флаги: —"; },
      cap: "Commit. Движок проходит по пометкам и вставляет кнопку в настоящий DOM. Делает это разом, без пауз — иначе страница показала бы полусобранный экран.",
      term: "commitRoot → commitBeforeMutationEffects → commitMutationEffects (Placement → appendChild) — синхронно",
    },
    {
      phase: 2,
      hi: ["root-r", "scr-r"],
      tok: ["ROOT", "SCR"],
      apply(s) { s.doing = "смена указателя"; s.n1 = ""; s.n2 = ""; s.tree = "текущее (root.current)"; s.wip = false; s.scr = true; },
      cap: "Указатель корня перекидывается на черновик: теперь это текущее дерево. Старое станет заготовкой для следующего черновика. Браузер рисует кнопку.",
      term: "root.current = finishedWork · double buffering через fiber.alternate · затем paint браузера",
    },
    {
      phase: 3,
      hi: ["app-r"],
      tok: ["ENG", "S2"],
      apply(s) { s.doing = "запуск эффектов"; s.s2 = "2: useEffect → fx ✓"; s.af = "флаги: —"; },
      cap: "Кадр нарисован. Теперь React берёт из слота №2 эффект и запускает его. useLayoutEffect сработал бы раньше — до отрисовки, поэтому он может задержать кадр.",
      term: "flushPassiveEffects → commitPassiveMountEffects (после paint) · useLayoutEffect → commitLayoutEffects (до paint)",
    },
    {
      phase: 4,
      hi: ["scr-r", "app-r", "q-r"],
      tok: ["SCR", "CODE6", "S1", "Q"],
      apply(s) { s.ring = true; s.code = 6; s.s1 = "1: useState 0, ждёт 1"; s.q = "обновить App"; s.doing = "жду задание"; },
      cap: "Клик. setN(1) ничего не меняет сразу: кладёт «стать 1» в очередь слота №1 той самой карточки и просит движок перерендерить App.",
      term: "dispatchSetState(fiber, queue, 1) → enqueueConcurrentHookUpdate · scheduleUpdateOnFiber(root, lane) · Scheduler",
    },
    {
      phase: 1,
      hi: ["eng-r", "app-r"],
      tok: ["Q", "ENG", "CODE3", "S1"],
      apply(s) { s.ring = false; s.q = "пусто"; s.tree = "черновик (workInProgress)"; s.wip = true; s.now = "App"; s.mode = "режим update"; s.doing = "вызов App(props)"; s.code = 3; s.s1 = "1: useState → 1"; s.s2 = "2: useEffect → fx"; s.d2 = "props: {onClick, 1}"; s.desc = false; s.cmp = false; },
      cap: "Render №2. Движок снова вызывает App, теперь в режиме «повторный». useState — та же дверь, но слот №1 уже есть: движок применяет очередь и отдаёт 1. Номер слота = порядок вызова.",
      term: "renderWithHooks(current, wip) · HooksDispatcherOnUpdate → updateState → processUpdateQueue · bailout, если props и state те же (Object.is)",
    },
    {
      phase: 1,
      hi: ["cmp-r", "btn-r"],
      tok: ["CODE5", "DESC", "CMP", "BTN"],
      apply(s) { s.code = [5, 7]; s.now = "—"; s.mode = "—"; s.doing = "сравниваю детей"; s.desc = true; s.cmp = true; s.cold = "было: button"; s.cnew = "стало: button"; s.cres = "итог: обновить"; s.bp = "button · {n: 1}"; s.bf = "флаги: обновить"; },
      cap: "Реконсиляция №2. Старый ребёнок — button, новый — тоже button, ключ тот же → карточку оставляем, обновляем пропсы, ставим пометку «обновить». Сменился бы тип — старую удалили, новую создали.",
      term: "reconcileChildFibers: type и key совпали → useFiber(current, props) · flags |= Update · иначе deleteChild + createFiber",
    },
    {
      phase: 2,
      hi: ["dom-r", "scr-r"],
      tok: ["ENG", "BTN", "DOM", "SCR"],
      apply(s) { s.doing = "commit в DOM"; s.dtxt = "└ button: 1"; s.stxt = "1"; s.bf = "флаги: —"; s.tree = "текущее (root.current)"; s.wip = false; s.code = 0; },
      cap: "Commit №2. В DOM меняется только текст кнопки. Указатель снова переключается на новое дерево. Потом эффект (зависимость [n] изменилась) и ожидание следующего клика.",
      term: "commitMutationEffects → commitUpdate (textContent) · root.current = finishedWork · flushPassiveEffects",
    },
    {
      phase: 4,
      hi: ["app-r", "cmp-r", "eng-r"],
      tok: ["ROOT"],
      apply(s) { s.doing = "жду задание"; s.n1 = ""; s.n2 = ""; s.s2 = "2: useEffect → fx ✓"; },
      cap: "Итого, причём тут fiber: карточки хранят состояние между вызовами функции, хранят старых детей для сравнения и режут работу на кусочки, которые можно прервать. Хуки — слоты в карточке, реконсиляция — сравнение описания с детьми.",
      term: "fiber = unit of work + память компонента · current / workInProgress · lanes (приоритеты) · hooks list · reconcileChildren",
    },
  ];

  function stateAt(index) {
    const state = initialState();
    for (let i = 0; i <= index && i < STEPS.length; i += 1) STEPS[i].apply(state);
    return state;
  }

  function codeRange(code) {
    if (!code) return null;
    return Array.isArray(code) ? code : [code, code];
  }

  function findFigure(root) {
    if (!root) return null;
    if (root.matches?.(figureSelector)) return root;
    return root.querySelector?.(figureSelector) ?? null;
  }

  const controllers = new WeakMap();

  function setupWalkVisual(root = typeof document === "undefined" ? null : document, options = {}) {
    const figure = findFigure(root);
    if (!figure) return null;
    const existing = controllers.get(figure);
    if (existing) return existing;

    const svg = figure.querySelector?.(svgSelector) ?? null;
    const fields = new Map();
    const field = (name) => {
      if (!fields.has(name)) fields.set(name, svg?.querySelector?.(`[data-wk="${name}"]`) ?? null);
      return fields.get(name);
    };
    const control = (name) => figure.querySelector?.(`[data-walk-control="${name}"]`) ?? null;
    const playButton = control("play");
    const playLabel = figure.querySelector?.("[data-walk-control-label]") ?? null;
    const playIcon = figure.querySelector?.("[data-walk-control-icon]") ?? null;
    const capEl = figure.querySelector?.("[data-walk-cap]") ?? null;
    const termEl = figure.querySelector?.("[data-walk-term]") ?? null;
    const countEl = figure.querySelector?.("[data-walk-count]") ?? null;
    const phaseButtons = Array.from(figure.querySelectorAll?.("[data-walk-phase]") ?? []);

    const setTimer = options.setTimeout ?? ((fn, ms) => setTimeout(fn, ms));
    const clearTimer = options.clearTimeout ?? ((id) => clearTimeout(id));
    const isHidden = options.isHidden ?? (() => typeof document !== "undefined" && document.hidden === true);
    const reducedMotion = options.reducedMotion ?? (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

    let index = 0;
    let playing = !reducedMotion;
    let timer = null;
    let hops = [];

    function setText(name, value) {
      const el = field(name);
      if (el) el.textContent = value;
    }

    function setVisible(name, visible) {
      field(name)?.classList?.toggle?.("is-off", !visible);
    }

    function moveToken(names) {
      hops.forEach((id) => clearTimer(id));
      hops = [];
      const token = field("tok");
      if (!token) return;
      names.forEach((name, n) => {
        const place = () => {
          const port = PORTS[name];
          if (port) token.setAttribute?.("transform", `translate(${port[0]},${port[1]})`);
        };
        if (n === 0 || reducedMotion) place();
        else hops.push(setTimer(place, n * HOP_DELAY));
      });
    }

    function paint(k) {
      const state = stateAt(k);
      const step = STEPS[k];

      phaseButtons.forEach((button) => {
        const active = Number(button.getAttribute?.("data-walk-phase")) === step.phase;
        button.setAttribute?.("aria-pressed", String(active));
      });

      const range = codeRange(state.code);
      const hl = field("hl");
      if (hl) {
        if (range) {
          hl.setAttribute?.("y", String(CODE_TOP + CODE_LINE * range[0]));
          hl.setAttribute?.("height", String(CODE_LINE * (range[1] - range[0] + 1)));
        }
        hl.classList?.toggle?.("is-off", !range);
      }

      setText("e-now", `Сейчас: ${state.now}`);
      setText("e-mode", `Хуки: ${state.mode}`);
      setText("e-do", `→ ${state.doing}`);
      setText("e-n1", state.n1);
      setText("e-n2", state.n2);
      setText("q", state.q);
      setText("d2", state.d2);
      setText("c-old", state.cold);
      setText("c-new", state.cnew);
      setText("c-res", state.cres);
      setText("tree", state.tree);
      setText("s1", state.s1);
      setText("s2", state.s2);
      setText("af", state.af);
      setText("ak", state.ak);
      setText("bp", state.bp);
      setText("bf", state.bf);
      setText("bd", state.bd);
      setText("dbtn", state.dtxt);
      setText("stxt", state.stxt);

      GROUPS.forEach((name) => setVisible(name, state[name]));
      WIP_RECTS.forEach((name) => field(name)?.classList?.toggle?.("is-wip", state.wip));
      RECTS.forEach((name) => field(name)?.classList?.toggle?.("is-on", step.hi.includes(name)));
      moveToken(step.tok);

      if (capEl) capEl.textContent = step.cap;
      if (termEl) termEl.textContent = step.term;
      if (countEl) countEl.textContent = `шаг ${k + 1} / ${STEPS.length}`;
    }

    function renderControls() {
      figure.classList?.toggle?.("is-paused", !playing);
      playButton?.setAttribute?.("aria-pressed", String(!playing));
      if (playLabel) playLabel.textContent = playing ? "Пауза" : "Играть";
      if (playIcon) playIcon.textContent = playing ? "Ⅱ" : "▶";
    }

    function arm() {
      if (timer !== null) clearTimer(timer);
      timer = null;
      if (!playing) return;
      timer = setTimer(() => {
        timer = null;
        if (isHidden()) {
          arm();
          return;
        }
        go(index + 1);
      }, STEP_DELAY);
    }

    function go(k) {
      index = ((k % STEPS.length) + STEPS.length) % STEPS.length;
      paint(index);
      arm();
    }

    function setPlaying(value) {
      playing = Boolean(value);
      renderControls();
      arm();
    }

    const controller = {
      get index() { return index; },
      get playing() { return playing; },
      get paused() { return !playing; },
      go,
      next() { go(index + 1); },
      prev() { go(index - 1); },
      replay() { setPlaying(true); go(0); },
      togglePlay() { setPlaying(!playing); },
      setPlaying,
      stateAt,
    };
    controllers.set(figure, controller);

    playButton?.addEventListener?.("click", controller.togglePlay);
    control("prev")?.addEventListener?.("click", controller.prev);
    control("next")?.addEventListener?.("click", controller.next);
    control("replay")?.addEventListener?.("click", controller.replay);
    phaseButtons.forEach((button) => {
      button.addEventListener?.("click", () => {
        const phase = Number(button.getAttribute?.("data-walk-phase"));
        const target = STEPS.findIndex((step) => step.phase === phase);
        if (target < 0) return;
        setPlaying(false);
        go(target);
      });
    });

    renderControls();
    go(0);
    return controller;
  }

  return { STEPS, PORTS, RECTS, initialState, stateAt, setupWalkVisual };
})();

if (typeof window !== "undefined") {
  window.WalkVisual = WalkVisual;
}

if (typeof document !== "undefined") {
  const autoInitialize = () => {
    WalkVisual.setupWalkVisual(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialize, { once: true });
  } else {
    autoInitialize();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WalkVisual;
}
