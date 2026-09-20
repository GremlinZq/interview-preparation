/*
 * React tab «Ререндер»: five step-by-step stories on one runner.
 * Each <figure data-story="…"> owns a static SVG; the runner repaints it per
 * step: texts by data-wk, visibility (is-off), extra classes, highlights
 * (is-on) and the token moving between named ports.
 */
const RerenderVisual = (() => {
  const figureSelector = "[data-story]";
  const svgSelector = "svg[data-story-svg]";
  const STEP_DELAY = 4600;
  const HOP_DELAY = 650;
  const CODE_TOP = 28;
  const CODE_LINE = 14;

  const TREE_PORTS = { APP: [267, 58], HEADER: [132, 134], LIST: [267, 134], FOOTER: [339, 168], I1: [109, 244], I2: [204, 244], I3: [299, 244] };
  const codePort = (line) => [884, CODE_TOP - 1 + CODE_LINE * line];
  const calledAll = (names, status) => Object.fromEntries(names.map((name) => [`st-${name}`, status]));

  const STORIES = {
    cost: {
      phases: ["Клик", "Render", "Commit", "Итог"],
      ports: { ...TREE_PORTS, ENG: [612, 52], RULE: [612, 180], DOM: [884, 52] },
      rects: ["app-r", "header-r", "list-r", "footer-r", "i1-r", "i2-r", "i3-r", "eng-r", "rule-r", "dom-r"],
      steps: [
        {
          phase: 0, on: ["app-r"], tok: ["APP"],
          show: ["trig"], set: { "st-app": "в очереди +1" },
          cap: "Клик. В App вызван setCount(1): обновление ложится в очередь карточки App, движок планирует рендер. Пока ничего не вызвано.",
          term: "dispatchSetState → enqueueUpdate · scheduleUpdateOnFiber(root, lane) · Scheduler",
        },
        {
          phase: 1, on: ["app-r", "eng-r"], tok: ["ENG", "APP"],
          set: { "st-app": "вызван", "c-calls": "вызовов функций: 1" }, cls: { "app-r": { "is-called": true } },
          cap: "App вызван. Он вернул описание для всех детей — новые объекты элементов, даже если внутри всё то же самое.",
          term: "beginWork(App) → renderWithHooks · JSX → новые ReactElement для каждого ребёнка",
        },
        {
          phase: 1, on: ["header-r", "list-r", "footer-r", "i1-r", "i2-r", "i3-r"], tok: ["HEADER", "LIST", "I1", "I2", "I3", "FOOTER"],
          set: { ...calledAll(["header", "list", "footer", "i1", "i2", "i3"], "вызван"), "c-calls": "вызовов функций: 7" },
          cls: { "header-r": { "is-called": true }, "list-r": { "is-called": true }, "footer-r": { "is-called": true }, "i1-r": { "is-called": true }, "i2-r": { "is-called": true }, "i3-r": { "is-called": true } },
          cap: "Дети вызываются по умолчанию: Header, List, Item×3, Footer. Пропсы — новые объекты, а что вернёт функция, React узнаёт только вызвав её.",
          term: "reconcileChildren → beginWork(child) для каждого · без memo bailout невозможен: oldProps !== newProps",
        },
        {
          phase: 1, on: ["eng-r", "header-r"], tok: ["ENG", "HEADER"],
          set: { "c-cmp": "сравнений: 7", "c-diff": "разниц найдено: 1", "st-header": "разница 0→1", ...calledAll(["list", "footer", "i1", "i2", "i3"], "то же самое") },
          cls: { "header-r": { "is-changed": true } },
          cap: "Сравнение. Результат каждого вызова сверяется с детьми карточки: тип, ключ, пропсы. Разница нашлась только в Header — текст «1» вместо «0».",
          term: "reconcileChildFibers: type и key совпали → useFiber · updateHostComponent: props изменились → flags |= Update",
        },
        {
          phase: 2, on: ["dom-r"], tok: ["ENG", "DOM"],
          set: { "c-dom": "правок DOM: 1", "dom-h1": "h1: «1»" }, cls: { "dom-h1": { "is-changed": true } },
          cap: "Commit. В DOM одна правка — текст h1. Остальные шесть вызовов не изменили на странице ничего: это и есть цена ререндера — работа в памяти.",
          term: "commitMutationEffects → commitUpdate(textContent) · fiber без флагов — DOM не тронут",
        },
        {
          phase: 3, on: ["rule-r"], tok: ["RULE"],
          show: ["rule"],
          cap: "Ререндер — не обновление DOM. Это вызов функции плюс сравнение. Дёшево, но не бесплатно: тысячи компонентов или тяжёлые вычисления в теле функции превращают это в тормоза. Оптимизируем не «ререндеры вообще», а лишние вызовы там, где они дорогие.",
          term: "render cost = вызовы + diff · React DevTools Profiler: «why did this render?» · измерь, потом оптимизируй",
        },
      ],
    },

    memo: {
      phases: ["Без memo", "React.memo", "Ловушка", "Лечение", "Итог"],
      ports: { ...TREE_PORTS, PROPS: [612, 52], CODE1: codePort(1), CODE4: codePort(4), CODE7: codePort(7), CODE8: codePort(8) },
      rects: ["app-r", "header-r", "list-r", "footer-r", "i1-r", "i2-r", "i3-r", "props-r", "count-r", "code-r"],
      steps: [
        {
          phase: 0, on: ["app-r", "list-r"], tok: ["CODE7", "APP", "LIST", "I1"],
          set: { ...calledAll(["app", "header", "list", "footer", "i1", "i2", "i3"], "вызван"), "c-calls": "вызовов: 7", "c-skip": "пропущено: 0", hl: "7" },
          cls: { "list-r": { "is-called": true }, "i1-r": { "is-called": true }, "i2-r": { "is-called": true }, "i3-r": { "is-called": true } },
          cap: "Как в прошлой сцене: клик в App — и все семь функций вызваны, хотя List и Item от count не зависят.",
          term: "props — новые объекты каждый рендер · без memo движок не может пропустить ребёнка",
        },
        {
          phase: 1, on: ["props-r", "list-r"], tok: ["CODE1", "APP", "PROPS", "LIST"],
          set: { l1: "const List = memo(List)", "p-old": "старые: items#1", "p-new": "новые: items#1", "p-is": "Object.is: ✓ все", "p-res": "итог: пропустить", "st-list": "пропущен", ...calledAll(["i1", "i2", "i3"], "не вызван"), "c-calls": "вызовов: 3", "c-skip": "пропущено: 4", hl: "1" },
          cls: { "list-r": { "is-called": false, "is-skipped": true }, "i1-r": { "is-called": false, "is-skipped": true }, "i2-r": { "is-called": false, "is-skipped": true }, "i3-r": { "is-called": false, "is-skipped": true } },
          cap: "Оборачиваем List в memo. Перед вызовом движок сравнивает новые пропсы со старыми по ссылке. items — тот же массив → всё совпало → List пропущен, а вместе с ним и Item.",
          term: "React.memo → shallowEqual(prevProps, nextProps): Object.is по каждому ключу · bailoutOnAlreadyFinishedWork",
        },
        {
          phase: 2, on: ["props-r", "list-r"], tok: ["CODE8", "APP", "PROPS", "LIST", "I1"],
          set: { l7: "    <List items={items}", l8: "      onSelect={() => f()} />", "p-old": "старые: onSelect fn#1", "p-new": "новые: onSelect fn#2", "p-is": "Object.is: ✗ onSelect", "p-res": "итог: вызвать", "st-list": "вызван", ...calledAll(["i1", "i2", "i3"], "вызван"), "c-calls": "вызовов: 7", "c-skip": "пропущено: 0", hl: "8" },
          cls: { "list-r": { "is-called": true, "is-skipped": false }, "i1-r": { "is-called": true, "is-skipped": false }, "i2-r": { "is-called": true, "is-skipped": false }, "i3-r": { "is-called": true, "is-skipped": false } },
          cap: "Ловушка. Добавили onSelect={() => f()}. Стрелка создаётся заново при каждом вызове App: та же логика, другая ссылка. Для memo это «другие пропсы» → List и Item снова вызваны. memo сравнивает ссылки, а не смысл.",
          term: "новая функция !== старая · shallowEqual = false → beginWork вызывает компонент · то же для {} и [] в JSX",
        },
        {
          phase: 3, on: ["props-r", "list-r"], tok: ["CODE4", "APP", "PROPS", "LIST"],
          set: { l4: "  const cb = useCallback(f, [])", l8: "      onSelect={cb} />", "p-old": "старые: onSelect fn#1", "p-new": "новые: onSelect fn#1", "p-is": "Object.is: ✓ все", "p-res": "итог: пропустить", "st-list": "пропущен", ...calledAll(["i1", "i2", "i3"], "не вызван"), "c-calls": "вызовов: 3", "c-skip": "пропущено: 4", hl: "4" },
          cls: { "list-r": { "is-called": false, "is-skipped": true }, "i1-r": { "is-called": false, "is-skipped": true }, "i2-r": { "is-called": false, "is-skipped": true }, "i3-r": { "is-called": false, "is-skipped": true } },
          cap: "Лечение: useCallback отдаёт одну и ту же функцию, пока не изменились зависимости. Для объектов и массивов — useMemo. Ссылка та же → memo снова пропускает List.",
          term: "useCallback(fn, deps) ≡ useMemo(() => fn, deps) · referential equality · deps сравниваются через Object.is",
        },
        {
          phase: 4, on: ["list-r"], tok: ["LIST"],
          set: { hl: "" },
          cap: "Итог. memo работает только вместе со стабильными пропсами: примитивы, useCallback, useMemo, никаких объектов прямо в JSX. Сама проверка пропсов тоже стоит времени, поэтому memo — для дорогих поддеревьев, а не для всего подряд. React Compiler расставляет такие memo сам.",
          term: "memo + stable props · arePropsEqual для точечного сравнения · React Compiler: auto-memoization",
        },
      ],
    },

    structure: {
      phases: ["State наверху", "State вниз", "Контент вверх", "Итог"],
      ports: { A_APP: [208, 78], A_LIST: [288, 154], B_APP: [508, 78], B_COUNTER: [428, 154], B_LIST: [588, 154], C_APP: [808, 78], C_LAYOUT: [808, 154], C_LIST: [808, 230] },
      rects: ["a-app-r", "a-header-r", "a-list-r", "b-app-r", "b-counter-r", "b-list-r", "c-app-r", "c-layout-r", "c-list-r"],
      steps: [
        {
          phase: 0, on: ["a-app-r", "a-list-r"], tok: ["A_APP", "A_LIST"],
          set: { "st-a-app": "вызван", "st-a-header": "вызван", "st-a-list": "вызван · дорого", "note-a": "клик → 3 вызова" },
          cls: { "a-app-r": { "is-called": true }, "a-header-r": { "is-called": true }, "a-list-r": { "is-called": true } },
          cap: "Счётчик n живёт в App. Каждый клик вызывает App, а за ним Header и тяжёлый HeavyList, которому n вообще не нужен.",
          term: "state colocation · чем выше живёт state, тем шире поддерево ререндера",
        },
        {
          phase: 1, on: ["b-counter-r"], tok: ["B_COUNTER"],
          set: { "st-b-counter": "вызван", "st-b-app": "не вызван", "st-b-list": "не вызван", "note-b": "клик → 1 вызов" },
          cls: { "b-counter-r": { "is-called": true } },
          cap: "Опускаем state вниз: n и кнопка переезжают в Counter. Клик вызывает только Counter. App не рендерился, значит HeavyList даже не получил новых пропсов.",
          term: "move state down · родитель не вызван → его дети не пересоздаются · ни memo, ни useCallback не нужны",
        },
        {
          phase: 2, on: ["c-layout-r", "c-list-r"], tok: ["C_APP", "C_LAYOUT", "C_LIST"],
          set: { "st-c-app": "не вызван", "st-c-layout": "вызван", "st-c-list": "пропущен", "note-c": "клик → 1 вызов, List пропущен" },
          cls: { "c-layout-r": { "is-called": true }, "c-list-r": { "is-skipped": true } },
          cap: "А если state нужен обёртке вокруг списка? Поднимаем контент вверх: App создаёт <HeavyList/> и передаёт его в Layout как children. Layout при клике вызван, но children — тот же объект элемента, что и в прошлый раз → HeavyList пропущен без всякого memo.",
          term: "lift content up · children — тот же ReactElement → bailout: oldProps === newProps && !hasContextChanged",
        },
        {
          phase: 3, on: ["b-counter-r", "c-layout-r"], tok: ["B_COUNTER", "C_LAYOUT"],
          cap: "Итог: сначала структура, потом memo. Опусти state туда, где он нужен, и подними тяжёлый контент выше через children. memo остаётся для мест, где структура не помогает.",
          term: "composition > memo · React docs: «Before you memo» · memo только для горячих поддеревьев",
        },
      ],
    },

    context: {
      phases: ["Provider", "Клик", "useMemo", "Разделить", "Сторы"],
      ports: { APP: [267, 58], SIDEBAR: [132, 134], CONTENT: [267, 134], USER: [132, 210], THEME: [267, 210], VAL: [612, 52], CODE3: codePort(3), CODE5: codePort(5) },
      rects: ["app-r", "sidebar-r", "content-r", "footer-r", "user-r", "theme-r", "val-r", "code-r"],
      steps: [
        {
          phase: 0, on: ["app-r", "val-r"], tok: ["CODE3", "VAL"],
          set: { hl: "3", "v-ref": "ссылка: #1" },
          cap: "App держит контекст. value = { user, theme } создаётся в теле функции — новый объект при каждом вызове App. UserBadge и ThemeSwitch читают его через useContext, а их родители обёрнуты в memo.",
          term: "createContext · <Ctx.Provider value> · объект в теле функции = новая ссылка на каждый рендер",
        },
        {
          phase: 1, on: ["val-r", "user-r", "theme-r"], tok: ["APP", "VAL", "USER", "THEME"],
          set: { "st-app": "вызван", "v-ref": "ссылка: #2 (новая)", "st-sidebar": "memo: пропущен", "st-content": "memo: пропущен", "st-user": "вызван · ctx", "st-theme": "вызван · ctx", "st-footer": "не вызван" },
          cls: { "app-r": { "is-called": true }, "user-r": { "is-called": true }, "theme-r": { "is-called": true }, "sidebar-r": { "is-skipped": true }, "content-r": { "is-skipped": true } },
          cap: "Клик меняет count в App. App вызван → новый объект value → движок будит всех подписчиков контекста: UserBadge и ThemeSwitch вызваны, хотя user и theme те же. memo на их родителях не помог: подписка на контекст обходит memo.",
          term: "propagateContextChange → scheduleContextWorkOnParentPath · подписчики помечены lanes · bailout не срабатывает при hasContextChanged",
        },
        {
          phase: 2, on: ["val-r"], tok: ["CODE3", "APP", "VAL"],
          set: { l3: "  const value = useMemo(mk, deps)", hl: "3", "v-ref": "ссылка: #1 (та же)", "st-user": "не вызван", "st-theme": "не вызван" },
          cls: { "user-r": { "is-called": false }, "theme-r": { "is-called": false } },
          cap: "Лечение 1: useMemo для value. Пока user и theme не менялись — та же ссылка. Клик в App больше не будит подписчиков.",
          term: "useMemo(() => ({ user, theme }), [user, theme]) · Object.is(oldValue, newValue) → подписчики не планируются",
        },
        {
          phase: 3, on: ["theme-r"], tok: ["CODE5", "VAL", "THEME"],
          set: { l5: "    <UserCtx value={user}>", l6: "     <ThemeCtx value={theme}>", l7: "      <Sidebar /><Content />", l8: "     </ThemeCtx></UserCtx>", hl: "5", "v-ref": "user: #1, theme: #2", "v-subs": "ThemeCtx: ThemeSwitch", "st-theme": "вызван · ctx", "st-user": "не вызван" },
          cls: { "theme-r": { "is-called": true } },
          cap: "Лечение 2: разделить контексты. Сменилась тема → вызван только подписчик ThemeCtx, UserBadge спит. Чем уже контекст, тем меньше лишних вызовов.",
          term: "split contexts · один контекст = один повод для ререндера · в React 19 <Ctx value> вместо <Ctx.Provider>",
        },
        {
          phase: 4, on: ["user-r"], tok: ["CODE3", "USER"],
          set: { l3: "  const user = useStore(sel)", hl: "3", "st-user": "вызван по срезу", "v-subs": "селектор: s => s.user" },
          cls: { "user-r": { "is-called": true }, "theme-r": { "is-called": false } },
          cap: "Внешние сторы (Redux, Zustand) идут через useSyncExternalStore и селекторы: компонент вызывается, только если выбранный кусок стора изменился. Тот же принцип — подписка на узкий срез.",
          term: "useSyncExternalStore(subscribe, getSnapshot) · useSelector + shallowEqual · re-render только при изменении среза",
        },
      ],
    },

    transition: {
      phases: ["Без транзишна", "startTransition", "Прерывание", "Итог"],
      codeTop: 190,
      ports: { K1: [140, 18], K2: [244, 18], S1: [460, 60], S2: [772, 60], I1: [161, 60], T1: [202, 100], I2: [265, 60], T2: [510, 130], USER: [884, 206], CODE: [428, 250] },
      rects: ["axis-r", "code-r", "user-r"],
      steps: [
        {
          phase: 0, on: ["axis-r"], tok: ["K1", "S1"],
          show: ["s1"],
          cap: "Пользователь печатает «a». setQuery запускает один рендер: поле ввода и тяжёлый список строятся в одной задаче — 120 мс. Всё это время браузер не может показать букву в поле.",
          term: "setState → SyncLane · render без прерываний · long task 120 ms блокирует ввод и кадры",
        },
        {
          phase: 0, on: ["axis-r"], tok: ["K2", "S2"],
          show: ["s2", "k2"],
          cap: "Второй символ «b» пришёл через 40 мс, но рендер не прерываемый — ждёт конца предыдущего. Поле «залипает» ещё на 80 мс, потом всё появляется разом.",
          term: "в SyncLane нет time slicing · событие ввода обработается только после commit",
        },
        {
          phase: 1, on: ["code-r"], tok: ["CODE", "K1", "I1", "T1"],
          hide: ["s1", "s2", "k2"], show: ["i1", "t1"], set: { hl: "6" },
          cap: "startTransition: обновление поля — срочное, идёт сразу (5 мс). Обновление списка помечено как транзишн: движок строит его по кусочкам между кадрами, отдавая браузеру время на ввод и отрисовку.",
          term: "startTransition → TransitionLane · workLoopConcurrent: shouldYield() каждые ~5 мс · поле и список — два обновления",
        },
        {
          phase: 2, on: ["axis-r"], tok: ["K2", "I2", "T2"],
          show: ["k2", "cut", "i2", "t2"],
          cap: "Пришёл «b», а список для «a» ещё не достроен. Черновик выбрасывается, транзишн начинается заново с «ab». Так работает прерывание: дерево fiber в памяти можно бросить без последствий для экрана.",
          term: "обновление с более высоким приоритетом → prepareFreshStack · workInProgress отброшен · экран не менялся",
        },
        {
          phase: 3, on: ["user-r"], tok: ["USER"],
          show: ["user"],
          cap: "Итог: транзишн не ускоряет работу — меняет приоритет. Поле отвечает мгновенно, список показывает старое (isPending → спиннер), потом появляется новое. useDeferredValue делает то же для значения без явного setState.",
          term: "useTransition → [isPending, startTransition] · useDeferredValue(value) · Suspense + transitions",
        },
      ],
    },

    "tool-memo": {
      phases: ["Без memo", "memo", "Пропс изменился", "Цена"],
      codeTop: 28,
      ports: { PARENT: [188, 58], CHILD: [188, 172], CMP: [552, 52], CODE1: [884, 41], CODE4: [884, 83] },
      rects: ["parent-r", "child-r", "cmp-r", "code-r"],
      steps: [
        {
          phase: 0, on: ["parent-r", "child-r"], tok: ["PARENT", "CHILD"],
          set: { "st-parent": "вызван (n+1)", "st-child": "вызван зря", "p-title": "title: «A» → «A»", "p-count": "count: 3 → 3", "p-res": "итог: memo нет → вызвать", hl: "4-5" },
          cls: { "parent-r": { "is-called": true }, "child-r": { "is-called": true } },
          cap: "Проблема. Parent меняет свой счётчик и вызывается заново. Child получает те же title и count, но без memo движок вызывает и его — результат будет тем же, работа сделана зря.",
          term: "родитель вызван → дети вызваны по умолчанию · props — новый объект на каждый рендер",
        },
        {
          phase: 1, on: ["cmp-r", "child-r"], tok: ["CODE1", "PARENT", "CMP", "CHILD"],
          set: { l1: "const Child = memo(Child)", "p-title": "title: «A» → «A» ✓", "p-count": "count: 3 → 3 ✓", "p-res": "итог: пропустить", "st-child": "пропущен", "p-cost": "цена: 2 сравнения", hl: "1" },
          cls: { "child-r": { "is-called": false, "is-skipped": true } },
          cap: "memo(Child). Теперь перед вызовом движок сравнивает каждый пропс со старым по ссылке (Object.is). Всё совпало → Child пропущен, его прошлый результат и DOM остаются как есть.",
          term: "React.memo(Component, arePropsEqual?) · shallowEqual по ключам props · bailout: cloneChildFibers, DOM не тронут",
        },
        {
          phase: 2, on: ["cmp-r", "child-r"], tok: ["CODE4", "CMP", "CHILD"],
          set: { l5: "               count={4} />", "p-count": "count: 3 → 4 ✗", "p-res": "итог: вызвать", "st-child": "вызван (нужно)", hl: "5" },
          cls: { "child-r": { "is-called": true, "is-skipped": false } },
          cap: "count стал 4. Сравнение нашло разницу → Child вызван, как и должен. memo не «замораживает» компонент, а пропускает вызов только при тех же пропсах.",
          term: "Object.is(3, 4) === false → beginWork вызывает компонент · сравнение поверхностное: вложенные объекты не обходятся",
        },
        {
          phase: 3, on: ["cmp-r"], tok: ["CMP"],
          set: { "p-cost": "цена: сравнение на каждый рендер" },
          cap: "Цена: сравнение пропсов на каждый рендер родителя и хранение старых пропсов. Не нужен для дешёвых компонентов и там, где пропсы всё равно новые: стрелки, объекты, children-элементы. Ставится по результатам Profiler, React Compiler делает это сам.",
          term: "memo — не бесплатно: сравнение + память · React DevTools Profiler → «why did this render» · React Compiler: auto-memo",
        },
      ],
    },

    "tool-callback": {
      phases: ["Без useCallback", "useCallback", "deps изменились", "Факты"],
      codeTop: 28,
      ports: { PARENT: [188, 58], CHILD: [69, 208], EFFECT: [191, 208], SLOT: [552, 52], CODE2: [884, 55] },
      rects: ["parent-r", "child-r", "effect-r", "slot-r", "code-r"],
      steps: [
        {
          phase: 0, on: ["parent-r", "child-r", "effect-r"], tok: ["CODE2", "PARENT", "CHILD", "EFFECT"],
          set: { "c-r1": "рендер #1: fn#1", "c-r2": "рендер #2: fn#2 (новая)", "c-deps": "deps: —", "c-res": "итог: другая ссылка", "st-parent": "вызван", "st-child": "вызван · memo ✗", "st-effect": "перезапущен", hl: "2" },
          cls: { "parent-r": { "is-called": true }, "child-r": { "is-called": true }, "effect-r": { "is-called": true } },
          cap: "Проблема. onSave объявлена в теле Parent: на каждый рендер это новая функция. Для memo-ребёнка это «другой пропс» — вызван зря. Для useEffect с onSave в deps — «зависимость изменилась» — перезапущен зря.",
          term: "функция в теле компонента = новое замыкание на каждый вызов · Object.is(fn1, fn2) === false",
        },
        {
          phase: 1, on: ["slot-r", "child-r", "effect-r"], tok: ["CODE2", "SLOT", "CHILD", "EFFECT"],
          set: { l2: "  const onSave = useCallback(", l3: "    () => save(id), [id])", "c-r2": "рендер #2: fn#1 из слота", "c-deps": "deps: [id] те же", "c-res": "итог: та же ссылка", "st-child": "пропущен", "st-effect": "не перезапущен", hl: "2-3" },
          cls: { "child-r": { "is-called": false, "is-skipped": true }, "effect-r": { "is-called": false, "is-skipped": true } },
          cap: "useCallback(fn, [id]). Функция кладётся в слот хука вместе с deps. На следующем рендере deps те же → из слота возвращается прошлая функция. Ссылка стабильна → memo пропускает Child, эффект не перезапускается.",
          term: "useCallback(fn, deps) ≡ useMemo(() => fn, deps) · hook.memoizedState = [fn, deps] · areHookInputsEqual → Object.is по каждой deps",
        },
        {
          phase: 2, on: ["slot-r", "child-r"], tok: ["SLOT", "CHILD", "EFFECT"],
          set: { "c-deps": "deps: [id] 1 → 2", "c-r2": "рендер #3: fn#2 (новая)", "c-res": "итог: новая, и это верно", "st-child": "вызван 1 раз", "st-effect": "перезапущен" },
          cls: { "child-r": { "is-called": true, "is-skipped": false }, "effect-r": { "is-called": true, "is-skipped": false } },
          cap: "id изменился. deps другие → новая функция с новым id внутри, и это правильно: старая замкнула бы устаревшее значение. Child и эффект отработали один раз, по делу.",
          term: "deps — защита от stale closure · exhaustive-deps: всё, что читает функция, должно быть в deps",
        },
        {
          phase: 3, on: ["slot-r"], tok: ["SLOT"],
          cap: "Факты. useCallback не ускоряет функцию и не экономит её создание: замыкание создаётся каждый рендер, хук лишь решает, какую ссылку вернуть. Нужен только когда ссылку кто-то сравнивает: memo-ребёнок, deps эффекта, подписка. Без такого потребителя это чистый расход.",
          term: "стабильная ссылка ≠ быстрее · потребители: memo-child, useEffect deps, addEventListener · иначе — лишнее сравнение deps",
        },
      ],
    },

    "tool-usememo": {
      phases: ["Без useMemo", "useMemo", "deps изменились", "Факты"],
      codeTop: 28,
      ports: { TABLE: [188, 58], CHILD: [188, 172], SLOT: [552, 52], CODE3: [884, 69], CODE5: [884, 97] },
      rects: ["table-r", "child-r", "slot-r", "code-r"],
      steps: [
        {
          phase: 0, on: ["table-r", "child-r"], tok: ["CODE3", "TABLE", "CHILD"],
          set: { "st-table": "вызван (hover)", "m-val": "sorted: пересчитан", "m-deps": "deps: —", "m-time": "время: 40 мс", "m-opts": "opts: новый объект", "st-child": "вызван · memo ✗", hl: "3" },
          cls: { "table-r": { "is-called": true }, "child-r": { "is-called": true } },
          cap: "Проблема, две сразу. Навели мышь на строку → hover изменился → Table вызвана заново. sortBig(items) сортирует тысячи строк ещё раз (40 мс), хотя items те же. А opts — новый объект → memo-ребёнок вызван.",
          term: "вычисление в теле функции выполняется при каждом вызове · объект в теле = новая ссылка",
        },
        {
          phase: 1, on: ["slot-r", "child-r"], tok: ["CODE3", "SLOT", "CHILD"],
          set: { l3: "  const sorted = useMemo(", l4: "    () => sortBig(items), [items])", l5: "  const opts = useMemo(mk, [page])", "m-val": "sorted: из слота", "m-deps": "deps [items]: те же", "m-time": "время: 0 мс", "m-opts": "opts: та же ссылка", "st-child": "пропущен", hl: "3-5" },
          cls: { "child-r": { "is-called": false, "is-skipped": true } },
          cap: "useMemo(() => sortBig(items), [items]). Результат лежит в слоте хука вместе с deps. Снова hover → items те же → значение из слота, 0 мс. opts тоже через useMemo → та же ссылка → Child пропущен.",
          term: "useMemo(factory, deps) · hook.memoizedState = [value, deps] · areHookInputsEqual → Object.is по каждой deps",
        },
        {
          phase: 2, on: ["slot-r", "child-r"], tok: ["SLOT", "TABLE", "CHILD"],
          set: { "st-table": "вызван (items)", "m-val": "sorted: пересчитан 1 раз", "m-deps": "deps [items]: новые", "m-time": "время: 40 мс", "m-opts": "opts: та же ссылка", "st-child": "вызван · rows" },
          cls: { "child-r": { "is-called": true, "is-skipped": false } },
          cap: "Пришли новые items. deps другие → фабрика выполнена один раз, новое значение в слот. Child вызван по делу: rows действительно новые. opts не менялся — ссылка та же.",
          term: "пересчёт только при смене deps · новые deps → новое значение → потребители ниже обновятся",
        },
        {
          phase: 3, on: ["slot-r"], tok: ["SLOT"],
          cap: "Факты. useMemo — подсказка, не гарантия: React может сбросить кеш. Не для дешёвых вычислений: сравнение deps и память дороже самой работы. Сначала Profiler, потом useMemo на реально тяжёлое или на объекты, которые кто-то сравнивает по ссылке. React Compiler расставляет это сам.",
          term: "«performance optimization, not a semantic guarantee» · Profiler → hot path · React Compiler: auto-memo",
        },
      ],
    },

    "hook-timing": {
      phases: ["Render", "Commit", "Layout", "Paint", "Passive"],
      codeTop: 134,
      ports: { RENDER: [190, 90], COMMIT: [325, 90], LAYOUT: [455, 90], PAINT: [590, 90], PASSIVE: [770, 90], CODE: [428, 160], SEE: [884, 150] },
      rects: ["axis-r", "seg-render-r", "seg-commit-r", "seg-layout-r", "seg-paint-r", "seg-passive-r", "code-r", "see-r"],
      steps: [
        {
          phase: 0, on: ["seg-render-r"], tok: ["RENDER"],
          set: { scr: "экран: прошлый кадр", hl: "" }, cls: { "seg-render-r": { "is-called": true } },
          cap: "Render: компонент вызван, новое дерево построено в памяти. На экране всё ещё прошлый кадр, DOM не тронут.",
          term: "render phase · workInProgress в памяти · можно прервать",
        },
        {
          phase: 1, on: ["seg-commit-r"], tok: ["COMMIT"],
          set: { scr: "экран: прошлый кадр, DOM уже новый", see1: "tooltip: в DOM с top = 0" }, cls: { "seg-commit-r": { "is-called": true } },
          cap: "Commit: правки ушли в DOM, но браузер ещё не нарисовал кадр. Тултип уже вставлен, пока с top = 0 — измерить его можно только сейчас.",
          term: "commitMutationEffects · DOM изменён, paint ещё не было",
        },
        {
          phase: 2, on: ["seg-layout-r", "code-r"], tok: ["CODE", "LAYOUT"],
          set: { hl: "1-4", see1: "tooltip: измерен, top исправлен до кадра", scr: "экран: всё ещё прошлый кадр (ждёт)" }, cls: { "seg-layout-r": { "is-called": true } },
          cap: "useLayoutEffect: синхронно после правок DOM и до кадра. Измерили, вызвали setTop — React тут же перерендерил. Пользователь не увидит прыжка. Цена: кадр задерживается на время эффекта.",
          term: "commitLayoutEffects · синхронный re-render до paint · блокирует кадр",
        },
        {
          phase: 3, on: ["seg-paint-r", "see-r"], tok: ["PAINT", "SEE"],
          set: { scr: "экран: новый кадр", see2: "кадр: один, без мигания" }, cls: { "seg-paint-r": { "is-called": true } },
          cap: "Paint: браузер нарисовал кадр. Стояло бы измерение в useEffect — кадр показал бы тултип в нуле, а потом прыжок: мигание.",
          term: "browser paint · при позднем измерении — flash of wrong layout",
        },
        {
          phase: 4, on: ["seg-passive-r", "code-r"], tok: ["CODE", "PASSIVE"],
          set: { hl: "5-7", see3: "аналитика, запросы, подписки — после кадра" }, cls: { "seg-passive-r": { "is-called": true } },
          cap: "useEffect: после кадра, отдельной задачей. Сюда — запросы, подписки, аналитика: всё, что не влияет на первый кадр. Правило: по умолчанию useEffect, useLayoutEffect только для измерений и позиционирования.",
          term: "flushPassiveEffects · scheduler (MessageChannel) · useLayoutEffect на SSR даёт warning",
        },
      ],
    },

    "hook-stale": {
      phases: ["Рендер #1", "Тик 1", "Тик 2", "Лечение", "Варианты"],
      codeTop: 28,
      ports: { CODE: [412, 90], CL: [656, 44], ST: [884, 44], SCR: [884, 186] },
      rects: ["code-r", "cl-r", "st-r", "scr-r"],
      steps: [
        {
          phase: 0, on: ["code-r", "cl-r"], tok: ["CODE", "CL"],
          set: { hl: "2-7", "cl-count": "count внутри: 0", "cl-tick": "тик: ещё нет", "cl-set": "setCount: —", "st-val": "count: 0", "st-render": "рендер: #1", scr: "экран: 0" },
          cap: "Рендер #1: count = 0. Эффект с пустыми deps запустился один раз и создал таймер. Функция внутри таймера замкнула count из этого рендера — ноль.",
          term: "замыкание держит переменные своего рендера · deps [] → эффект и таймер живут один раз",
        },
        {
          phase: 1, on: ["cl-r", "st-r"], tok: ["CL", "ST", "SCR"],
          set: { "cl-tick": "тик 1", "cl-set": "setCount(0 + 1)", "st-val": "count: 1", "st-render": "рендер: #2", scr: "экран: 1" },
          cap: "Тик 1: таймер вызвал setCount(0 + 1) → 1. Рендер #2 создал новое замыкание с count = 1, но таймер по-прежнему держит старое, из рендера #1.",
          term: "рендер #2 → новая функция компонента, новые замыкания · таймер ссылается на старую",
        },
        {
          phase: 2, on: ["cl-r", "st-r"], tok: ["CL", "ST", "SCR"],
          set: { "cl-tick": "тик 2", "cl-set": "setCount(0 + 1) снова", "st-val": "count: 1 (застрял)", "st-note": "то же значение → bailout", scr: "экран: 1" },
          cls: { "st-r": { "is-changed": true } },
          cap: "Тик 2: старая функция снова считает 0 + 1. setCount(1) — значение то же, React даже не рендерит. Счётчик застрял на единице. Это и есть stale closure.",
          term: "stale closure · setState с тем же значением → bailout (Object.is)",
        },
        {
          phase: 3, on: ["code-r", "st-r"], tok: ["CODE", "CL", "ST", "SCR"],
          set: { hl: "4", l4: "    setCount(c => c + 1)   // берёт актуальный c", "cl-set": "setCount(c => c + 1)", "cl-count": "count внутри: не нужен", "st-val": "count: 2, 3, 4…", "st-note": "очередь даёт свежее c", scr: "экран: 2, 3, 4…" },
          cls: { "st-r": { "is-changed": false } },
          cap: "Лечение: функциональное обновление. setCount(c => c + 1) не читает count из замыкания — React сам передаёт актуальное значение из очереди. Таймер можно не пересоздавать.",
          term: "updater function · processUpdateQueue применяет функции по очереди",
        },
        {
          phase: 4, on: ["code-r"], tok: ["CODE"],
          set: { hl: "7", l7: "}, [count])                // честные deps", "cl-count": "count внутри: свежий", "st-note": "эффект пересоздаётся" },
          cap: "Другие варианты: честные deps [count] — эффект и таймер пересоздаются на каждый тик, просто, но дороже. useRef с последним значением. useEffectEvent — читать свежее, не подписываясь. Линтер exhaustive-deps ловит это.",
          term: "eslint-plugin-react-hooks: exhaustive-deps · useRef latest · useEffectEvent (React 19.2)",
        },
      ],
    },

    "hook-race": {
      phases: ["id = 1", "id = 2", "Ответы", "Гонка", "Cleanup"],
      codeTop: 28,
      ports: { CODE: [412, 90], REQ1: [462, 60], REQ2: [462, 96], RESP2: [700, 116], RESP1: [836, 60], SCR: [884, 134], NOTE: [884, 190] },
      rects: ["code-r", "tl-r", "note-r"],
      steps: [
        {
          phase: 0, on: ["code-r", "tl-r"], tok: ["CODE", "REQ1"],
          show: ["req1"], set: { hl: "1-5", scr: "экран: загрузка 1…" },
          cap: "id = 1: эффект запустил запрос. Он медленный — 900 мс.",
          term: "useEffect(…, [id]) · fetch без отмены",
        },
        {
          phase: 1, on: ["tl-r"], tok: ["REQ1", "REQ2"],
          show: ["req2"], set: { scr: "экран: загрузка 2…" },
          cap: "Пользователь переключился на id = 2. Эффект перезапущен, ушёл второй запрос, быстрый — 300 мс. Первый всё ещё летит.",
          term: "смена deps → cleanup прошлого эффекта (пока пустой) → новый эффект",
        },
        {
          phase: 2, on: ["tl-r"], tok: ["RESP2", "SCR"],
          show: ["resp2"], set: { scr: "экран: пользователь 2 ✓" },
          cap: "Ответ 2 пришёл первым — показали пользователя 2. Пока всё правильно.",
          term: "setUser(user2) → рендер",
        },
        {
          phase: 3, on: ["tl-r", "note-r"], tok: ["RESP1", "SCR", "NOTE"],
          show: ["resp1"], set: { scr: "экран: пользователь 1 ✗", note1: "без cleanup: поздний ответ перезаписал свежие данные", "resp1-l": "ответ 1 → setUser(1)" },
          cap: "Ответ 1 пришёл позже и вызвал setUser(1). На экране чужие данные — гонка. Эффект не знал, что он уже устарел.",
          term: "race condition · промис нельзя отменить, но можно проигнорировать · порядок ответов не гарантирован",
        },
        {
          phase: 4, on: ["code-r", "note-r"], tok: ["CODE", "RESP1", "SCR"],
          set: { hl: "2-6", l2: "  let ignore = false", l3: "  fetchUser(id).then(user => {", l4: "    if (!ignore) setUser(user)", l5: "  })", l6: "  return () => { ignore = true }", l7: "}, [id])", "resp1-l": "ответ 1 → отброшен", scr: "экран: пользователь 2 ✓", note1: "cleanup при смене id: ignore = true → поздний ответ отброшен", note2: "или AbortController: signal в fetch — запрос отменён; React Query делает это сам" },
          cap: "Cleanup: перед перезапуском эффекта React вызывает функцию из return прошлого эффекта. Ставим ignore = true — поздний ответ отброшен. AbortController идёт дальше: отменяет сам запрос. React Query делает это за тебя.",
          term: "cleanup: перед следующим эффектом и при размонтировании · AbortController.signal → fetch · TanStack Query: queryKey [id]",
        },
      ],
    },

    "hook-ref": {
      phases: ["Слоты", "setState", "ref.current", "DOM-узел", "Правило"],
      codeTop: 28,
      ports: { CODE: [412, 90], CARD: [656, 44], OUT: [884, 44], RULE: [884, 170] },
      rects: ["code-r", "card-r", "out-r", "rule-r"],
      steps: [
        {
          phase: 0, on: ["code-r", "card-r"], tok: ["CODE", "CARD"],
          set: { hl: "1-3" },
          cap: "useState и useRef — оба слоты в карточке компонента. state хранит значение и умеет запускать рендер. ref хранит объект { current } — один и тот же объект на каждом рендере.",
          term: "useRef → hook.memoizedState = { current } · тот же объект между рендерами",
        },
        {
          phase: 1, on: ["card-r", "out-r"], tok: ["CARD", "OUT"],
          set: { s1: "слот 1 · state: 1", o1: "ререндер: да (setN)", o2: "экран: обновлён" },
          cls: { "card-r": { "is-called": true } },
          cap: "setN(1): значение в слот, обновление в очередь, компонент вызван заново, экран обновлён.",
          term: "dispatchSetState → scheduleUpdateOnFiber · render → commit",
        },
        {
          phase: 2, on: ["code-r", "card-r"], tok: ["CODE", "CARD", "OUT"],
          set: { hl: "4", s2: "слот 2 · ref {current: 42}", o1: "ререндер: нет", o2: "экран: не тронут" },
          cls: { "card-r": { "is-called": false } },
          cap: "timerId.current = 42: записали в объект — и всё. Никакого рендера, экран не тронут. Так хранят id таймера, предыдущее значение, «последний колбэк».",
          term: "запись в ref.current не планирует обновление · ref не читают в JSX для вывода",
        },
        {
          phase: 3, on: ["code-r", "card-r"], tok: ["CODE", "CARD", "OUT"],
          set: { hl: "5-6", s3: "слот 3 · ref {current: input}", o1: "ререндер: нет", o2: "DOM-узел в current", o3: "focus(), измерить" },
          cap: "ref={inputRef}: после commit React кладёт DOM-узел в current. В эффекте или обработчике можно вызвать focus(), измерить, проскроллить. До commit там null.",
          term: "commitAttachRef в layout phase · null при размонтировании · в React 19 ref — обычный проп",
        },
        {
          phase: 4, on: ["rule-r"], tok: ["RULE"],
          show: ["rule"],
          cap: "Правило: влияет на картинку — state. Нужно помнить между рендерами, но не показывать — ref. Ref в JSX не читают: React не узнает об изменении.",
          term: "state → render · ref → память · useImperativeHandle для API компонента",
        },
      ],
    },

    "hook-custom": {
      phases: ["Что это", "Свои слоты", "Логика, не state", "Правила"],
      codeTop: 28,
      ports: { CODE: [412, 90], MODAL: [656, 58], MENU: [656, 116], RULES: [884, 44], NOTE: [884, 176] },
      rects: ["code-r", "modal-r", "menu-r", "rules-r", "note-r"],
      steps: [
        {
          phase: 0, on: ["code-r"], tok: ["CODE"],
          set: { hl: "1-5" },
          cap: "Кастомный хук — обычная функция, внутри которой вызываются хуки. Имя с use — соглашение, по которому линтер проверяет правила хуков.",
          term: "custom hook = функция с хуками внутри · use* naming · eslint rules-of-hooks",
        },
        {
          phase: 1, on: ["modal-r", "menu-r"], tok: ["CODE", "MODAL", "MENU"],
          set: { hl: "6-7", "st-modal": "слоты: state, callback", "st-menu": "слоты: state, callback", note1: "Modal и Menu — разные карточки → разные слоты, два независимых состояния" },
          cls: { "modal-r": { "is-called": true }, "menu-r": { "is-called": true } },
          cap: "Modal и Menu вызвали useToggle. У каждого свои слоты в своей карточке: два независимых состояния. Хук не знает, кто его вызвал.",
          term: "хуки внутри хука пишут в карточку текущего компонента (currentlyRenderingFiber)",
        },
        {
          phase: 2, on: ["note-r"], tok: ["NOTE"],
          set: { note1: "переиспользуется логика: подписка, форма, запрос, debounce", note2: "состояние не общее — для общего берут context или стор" },
          cap: "Кастомный хук делит логику, а не состояние. Нужно общее состояние — контекст или стор. Типичные хуки: useDebounce, useLocalStorage, useMediaQuery, useFetch.",
          term: "share logic, not state · context / external store для общего состояния",
        },
        {
          phase: 3, on: ["rules-r", "code-r"], tok: ["CODE", "RULES"],
          show: ["rules"], set: { hl: "2-3" },
          cap: "Правила хуков объясняются слотами: вызовы нумеруются по порядку, поэтому хук нельзя ставить под if, в цикл или после return. Только на верхнем уровне компонента или другого хука.",
          term: "hooks list = порядок вызовов · условие ломает нумерацию · use() в React 19 — исключение для промисов и контекста",
        },
      ],
    },

    "pattern-compose": {
      phases: ["Пропсы", "children", "Слоты", "Правило"],
      codeTop: 28,
      ports: { CFG: [280, 44], CARD: [470, 58], ICON: [330, 178], ACTIONS: [501, 178], CODE: [884, 90], RULE: [884, 200] },
      rects: ["cfg-r", "card-r", "icon-r", "title-r", "actions-r", "code-r", "rule-r"],
      steps: [
        { phase: 0, on: ["cfg-r", "code-r"], tok: ["CODE", "CFG"], set: { hl: "1-3" },
          cap: "Флаги: каждый новый случай — новый проп и новый if внутри.", term: "boolean props explosion" },
        { phase: 1, on: ["card-r", "code-r"], tok: ["CODE", "CARD", "ICON"],
          set: { hl: "5-8", "st-card": "рамка + поведение", "st-icon": "снаружи", "st-title": "снаружи", "st-actions": "снаружи" }, cls: { "card-r": { "is-called": true } },
          cap: "children: Card задаёт рамку и поведение, содержимое приносит родитель.", term: "children: ReactNode" },
        { phase: 2, on: ["actions-r", "code-r"], tok: ["CODE", "ACTIONS"], set: { hl: "7", "st-actions": "слот actions" }, cls: { "actions-r": { "is-called": true } },
          cap: "Слоты: несколько мест — отдельные пропсы-элементы или Card.Actions.", term: "header={<…/>} · Card.Actions" },
        { phase: 3, on: ["rule-r"], tok: ["RULE"], show: ["rule"],
          cap: "Правило: пропсы — для поведения, children и слоты — для содержимого.", term: "composition > configuration" },
      ],
    },

    "pattern-compound": {
      phases: ["Монолит", "Части", "Контекст", "Цена"],
      codeTop: 28,
      ports: { TABS: [228, 58], LIST: [80, 172], PANEL: [240, 172], TABA: [46, 246], TABB: [138, 246], CTX: [552, 44], CODE: [884, 90], NOTE: [884, 278] },
      rects: ["tabs-r", "list-r", "panel-r", "taba-r", "tabb-r", "ctx-r", "code-r", "note-r"],
      steps: [
        { phase: 0, on: ["tabs-r"], tok: ["TABS"], set: { hl: "", "st-tabs": "items=[…] внутри" }, cls: { "tabs-r": { "is-called": true } },
          cap: "Монолит с items=[…]: разметку не поменять без нового пропа.", term: "config-driven component" },
        { phase: 1, on: ["taba-r", "tabb-r", "panel-r", "code-r"], tok: ["CODE", "TABS", "TABA", "PANEL"],
          set: { hl: "1-7", "st-tabs": "state: active", "st-list": "разметка", "st-taba": "value a", "st-tabb": "value b", "st-panel": "value a" },
          cls: { "tabs-r": { "is-called": false }, "taba-r": { "is-called": true }, "tabb-r": { "is-called": true }, "panel-r": { "is-called": true } },
          cap: "Части: Tabs, Tab, Panel — собираешь сам, как select и option в HTML.", term: "Tabs.Tab / Tabs.Panel" },
        { phase: 2, on: ["ctx-r", "taba-r", "tabb-r", "panel-r"], tok: ["TABS", "CTX", "TABA", "TABB", "PANEL"], show: ["ctx"], set: { hl: "8", c1: "active: a", c3: "подписчики: Tab ×2, Panel" },
          cap: "Общее состояние — в контексте Tabs; Tab и Panel читают его через useContext.", term: "Provider + useContext" },
        { phase: 3, on: ["note-r"], tok: ["NOTE"], set: { note1: "Provider + подкомпоненты через контекст", note2: "цена: Tab вне Tabs → понятная ошибка из хука" },
          cap: "Цена: неявная связь — Tab вне Tabs должен падать с понятной ошибкой.", term: "useTabsContext() → throw" },
      ],
    },

    "pattern-controlled": {
      phases: ["Uncontrolled", "Controlled", "Гибрид", "Правило"],
      codeTop: 28,
      ports: { FORM: [228, 58], INPUT: [228, 172], OWN: [552, 44], CODE: [884, 90], NOTE: [884, 244] },
      rects: ["form-r", "input-r", "own-r", "code-r", "note-r"],
      steps: [
        { phase: 0, on: ["input-r", "code-r"], tok: ["CODE", "INPUT", "FORM"],
          set: { hl: "1-3", "st-input": "state в DOM", "st-form": "читает при submit", o1: "uncontrolled: state в input" }, cls: { "input-r": { "is-called": true } },
          cap: "Uncontrolled: значение в DOM, читаешь через ref или FormData при submit.", term: "defaultValue · ref.current.value" },
        { phase: 1, on: ["form-r", "code-r"], tok: ["CODE", "FORM", "INPUT"], show: ["flow"],
          set: { hl: "4-6", "st-form": "state: v", "st-input": "показывает v", o2: "controlled: state у родителя" }, cls: { "input-r": { "is-called": false }, "form-r": { "is-called": true } },
          cap: "Controlled: значение у родителя — value вниз, onChange вверх.", term: "single source of truth" },
        { phase: 2, on: ["own-r", "code-r"], tok: ["CODE", "OWN"], set: { hl: "7-8", o3: "гибрид: value ?? internal" },
          cap: "Гибрид: value передан — controlled, не передан — внутренний state.", term: "useControllableState (Radix)" },
        { phase: 3, on: ["note-r"], tok: ["NOTE"], set: { note1: "режим не переключают в рантайме: warning и потеря значения", note2: "владеет значением тот, кто на него реагирует" },
          cap: "Правило: владеет значением тот, кто на него реагирует; режим в рантайме не меняют.", term: "uncontrolled → controlled warning" },
      ],
    },

    "pattern-headless": {
      phases: ["HOC", "Render prop", "Хук", "Headless"],
      codeTop: 28,
      ports: { HOC: [280, 44], RP: [582, 44], HOOK: [884, 44], HD: [884, 172] },
      rects: ["hoc-r", "rp-r", "hook-r", "hd-r"],
      steps: [
        { phase: 0, on: ["hoc-r"], tok: ["HOC"], cap: "HOC: обёртка на обёртке, коллизии пропсов — сегодня легаси.", term: "withX(Component) · wrapper hell" },
        { phase: 1, on: ["rp-r"], tok: ["RP"], cap: "Render prop: гибко, но глубокая вложенность в JSX.", term: "children as function" },
        { phase: 2, on: ["hook-r"], tok: ["HOOK"], cap: "Хук: та же логика без обёрток — стандарт сегодня.", term: "custom hook" },
        { phase: 3, on: ["hd-r"], tok: ["HD"], show: ["hd"], cap: "Headless: поведение и aria из библиотеки, разметка и стили свои.", term: "Radix, Headless UI, Downshift" },
      ],
    },

    "pattern-ds": {
      phases: ["Варианты", "Полиморфизм", "Stories", "Тесты"],
      codeTop: 28,
      ports: { BTN: [280, 44], CODE: [582, 90], SB: [884, 44], NOTE: [884, 198] },
      rects: ["btn-r", "code-r", "sb-r", "note-r"],
      steps: [
        { phase: 0, on: ["btn-r", "code-r"], tok: ["CODE", "BTN"], set: { hl: "1" },
          cap: "Варианты: variant и size вместо стилей снаружи; цвета и отступы — из токенов.", term: "variant props · design tokens" },
        { phase: 1, on: ["btn-r", "code-r"], tok: ["CODE", "BTN"], set: { hl: "2", b3: "as: button | a | Link ← полиморфизм" },
          cap: "as / asChild: тот же Button рендерится как <a> или Link.", term: "polymorphic as · asChild (Radix)" },
        { phase: 2, on: ["sb-r", "code-r"], tok: ["CODE", "SB"], set: { hl: "3-5" }, cls: { "sb-r": { "is-called": true } },
          cap: "Story — одно состояние компонента: документация и песочница.", term: "CSF3: args + controls" },
        { phase: 3, on: ["note-r", "code-r"], tok: ["CODE", "SB", "NOTE"],
          set: { hl: "6-8", s3: "Loading — play: клик → ждём спиннер ✓", note1: "play — interaction test; Chromatic — визуальная регрессия; a11y addon", note2: "story = контракт компонента" },
          cap: "Story как тест: play проверяет поведение, Chromatic — вид, a11y-аддон — доступность.", term: "@storybook/test · Chromatic" },
      ],
    },

    "state-kinds": {
      phases: ["UI", "Клиентское", "Серверное", "URL"],
      codeTop: 28,
      ports: { UI: [206, 52], CLIENT: [432, 52], SERVER: [658, 52], URL: [884, 52], NOTE: [884, 180] },
      rects: ["ui-r", "client-r", "server-r", "url-r", "note-r"],
      steps: [
        { phase: 0, on: ["ui-r"], tok: ["UI"], set: { note1: "локальное — рядом с компонентом, не поднимать без нужды" },
          cap: "UI-состояние: открыт ли модал, hover, ввод — useState рядом с компонентом.", term: "useState · state colocation" },
        { phase: 1, on: ["client-r"], tok: ["CLIENT"], set: { note1: "общее клиентское — контекст, если меняется редко; стор, если часто" },
          cap: "Общее клиентское: тема, корзина, черновик — контекст или стор.", term: "context · Zustand · Redux Toolkit" },
        { phase: 2, on: ["server-r"], tok: ["SERVER"], set: { note1: "серверные данные — не state, а кеш: у них есть свежесть и владелец на сервере" },
          cap: "Серверные данные — не state, а кеш с ключом: React Query или SWR.", term: "server state · cache by queryKey" },
        { phase: 3, on: ["url-r"], tok: ["URL"], set: { note1: "фильтры, страница, сортировка — в URL: ссылка воспроизводит экран", note2: "правило: у каждого значения один источник истины" },
          cap: "Фильтры, страница, сортировка — в URL, чтобы ссылка воспроизводила экран.", term: "URL state · searchParams · router" },
      ],
    },

    "state-query": {
      phases: ["useQuery", "Кеш", "Фон", "Мутация"],
      codeTop: 28,
      ports: { PROFILE: [142, 58], HEADER: [142, 132], CACHE: [462, 44], NET: [884, 44], NOTE: [884, 196] },
      rects: ["profile-r", "header-r", "cache-r", "net-r", "note-r"],
      steps: [
        { phase: 0, on: ["profile-r", "cache-r", "net-r"], tok: ["PROFILE", "CACHE", "NET"],
          set: { "q-key": "['user', 7]", "q-status": "status: pending → success", "q-data": "data: { name: 'Даниил' }", "n-count": "запросов: 1" }, cls: { "profile-r": { "is-called": true } },
          cap: "useQuery(['user', id]): загрузка, ошибка и данные — из коробки, по ключу.", term: "queryKey · status: pending | error | success" },
        { phase: 1, on: ["header-r", "cache-r"], tok: ["HEADER", "CACHE"],
          set: { "n-note1": "тот же ключ → из кеша, запрос один", "n-count": "запросов: 1" }, cls: { "header-r": { "is-called": true } },
          cap: "Второй компонент с тем же ключом берёт из кеша: запрос всё ещё один.", term: "dedupe · structural sharing" },
        { phase: 2, on: ["cache-r", "net-r"], tok: ["CACHE", "NET"],
          set: { "q-meta": "stale: да → refetch в фоне", "n-count": "запросов: 2 (фоновый)" },
          cap: "Показывает кеш сразу, а после staleTime обновляет в фоне.", term: "stale-while-revalidate · staleTime · refetchOnWindowFocus" },
        { phase: 3, on: ["net-r", "note-r"], tok: ["NET", "CACHE", "NOTE"],
          set: { "n-note2": "PATCH /user → invalidateQueries(['user'])", "q-status": "invalidated → refetch", note1: "мутация → инвалидация ключа → перезапрос; отмена — через signal в queryFn", note2: "React Query = кеш + статусы + дедупликация + инвалидация" },
          cap: "После мутации инвалидирую ключ — данные перезапрашиваются; отмена через signal.", term: "useMutation · invalidateQueries · AbortSignal" },
      ],
    },

    "state-store": {
      phases: ["Контекст", "Селекторы", "Redux / Zustand", "Правило"],
      codeTop: 28,
      ports: { APP: [228, 58], HEADER: [64, 170], CART: [174, 170], FOOTER: [284, 170], CTX: [566, 44], STORE: [884, 44], NOTE: [884, 180] },
      rects: ["app-r", "header-r", "cart-r", "footer-r", "ctx-r", "store-r", "note-r"],
      steps: [
        { phase: 0, on: ["ctx-r", "header-r", "cart-r", "footer-r"], tok: ["APP", "CTX", "HEADER", "CART", "FOOTER"],
          set: { "st-header": "вызван", "st-cart": "вызван", "st-footer": "вызван", c3: "рендер: все подписчики" },
          cls: { "header-r": { "is-called": true }, "cart-r": { "is-called": true }, "footer-r": { "is-called": true } },
          cap: "Контекст: добавили товар — вызваны все подписчики, даже Header и Footer.", term: "useContext · нет селекторов" },
        { phase: 1, on: ["store-r", "cart-r"], tok: ["APP", "STORE", "CART"],
          set: { "st-header": "не вызван", "st-cart": "вызван", "st-footer": "не вызван", s2: "рендер: только Cart" },
          cls: { "header-r": { "is-called": false, "is-skipped": true }, "footer-r": { "is-called": false, "is-skipped": true } },
          cap: "Стор с селектором: рендерится только тот, чей срез изменился.", term: "useStore(s => s.items) · useSyncExternalStore" },
        { phase: 2, on: ["store-r"], tok: ["STORE"], set: { s3: "Zustand — минимум кода; RTK — строгий поток" },
          cap: "Zustand — по умолчанию; Redux Toolkit — когда нужен строгий поток и devtools.", term: "Zustand · Redux Toolkit · RTK Query" },
        { phase: 3, on: ["note-r"], tok: ["NOTE"], set: { note1: "контекст — редкие изменения и DI: тема, пользователь, сервисы", note2: "стор — частые обновления и много потребителей; серверные данные — не в стор, а в React Query" },
          cap: "Правило: контекст — для редких изменений и DI, стор — для частых и многих потребителей.", term: "colocation → context → store" },
      ],
    },

    "state-derived": {
      phases: ["Антипаттерн", "В рендере", "useMemo", "Нормализация"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-3", r1: "рендеров на изменение: 2", r2: "рассинхрон: возможен", r3: "источников истины: 2" }, cls: { "out-r": { "is-changed": true } },
          cap: "Копия в useState через useEffect: лишний рендер и два источника истины.", term: "derived state anti-pattern" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-5", r1: "рендеров на изменение: 1", r2: "рассинхрон: невозможен", r3: "источник истины: 1" }, cls: { "out-r": { "is-changed": false } },
          cap: "Производное считается прямо в рендере — всегда свежее, без setState.", term: "compute during render" },
        { phase: 2, on: ["code-r"], tok: ["CODE"], set: { hl: "6-7" },
          cap: "Тяжёлое вычисление — useMemo с deps; дешёвое — просто в рендере.", term: "useMemo(() => …, [items, f])" },
        { phase: 3, on: ["note-r"], tok: ["NOTE"], set: { note1: "state минимальный и нормализованный: ids + byId, без копий одного объекта в разных местах", note2: "если значение можно вычислить — его не хранят" },
          cap: "State минимальный и нормализованный: ids + byId, без дублей объектов.", term: "normalized state · single source of truth" },
      ],
    },

    "state-stream": {
      phases: ["Поток", "Буфер", "Стоп", "Статусы"],
      codeTop: 100,
      ports: { API: [79, 92], STREAM: [259, 92], BUF: [439, 92], STATE: [594, 92], SCREEN: [784, 92], CODE: [428, 150], STATUS: [884, 116] },
      rects: ["api-r", "stream-r", "buf-r", "state-r", "screen-r", "code-r", "status-r"],
      steps: [
        { phase: 0, on: ["api-r", "stream-r", "code-r"], tok: ["CODE", "API", "STREAM"],
          set: { hl: "1-3", "st-api": "генерирует", "st-stream": "чанк 1, 2, 3…", s1: "status: streaming" }, cls: { "api-r": { "is-called": true }, "stream-r": { "is-called": true } },
          cap: "Ответ читаю потоком: fetch + ReadableStream или SSE, чанк за чанком.", term: "res.body.getReader() · EventSource" },
        { phase: 1, on: ["buf-r", "state-r", "screen-r", "code-r"], tok: ["CODE", "BUF", "STATE", "SCREEN"],
          set: { hl: "4", "st-buf": "копит до кадра", "st-state": "+= буфер", "st-screen": "печатается…" }, cls: { "buf-r": { "is-called": true }, "state-r": { "is-called": true }, "screen-r": { "is-called": true } },
          cap: "Чанки копятся в буфер, в state уходят раз в кадр — не рендер на каждый токен.", term: "requestAnimationFrame · batching" },
        { phase: 2, on: ["code-r", "status-r"], tok: ["CODE", "STATUS"], set: { hl: "5", s2: "стоп: controller.abort() → done" },
          cap: "Кнопка «Стоп» — AbortController: signal в fetch, поток закрывается.", term: "AbortController.abort() · signal" },
        { phase: 3, on: ["status-r"], tok: ["STATUS"], set: { hl: "6", s3: "ошибка: показать текст и «повторить»", s1: "status: idle → streaming → done | error" },
          cap: "Статусы idle → streaming → done | error; на ошибке — сообщение и «повторить».", term: "state machine · retry" },
      ],
    },

    "csp-flow": {
      phases: ["Заголовок", "Свой код", "XSS", "Чужой хост", "Фрейм", "Раскатка"],
      codeTop: 28,
      ports: { CODE: [412, 90], PAGE: [712, 44], BROWSER: [884, 44], NOTE: [884, 196] },
      rects: ["code-r", "page-r", "browser-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r"], tok: ["CODE"], set: { hl: "1-8", b1: "режим: enforce" },
          cap: "Сервер отдаёт страницу с заголовком CSP: откуда можно грузить и что выполнять.", term: "Content-Security-Policy · allowlist" },
        { phase: 1, on: ["code-r", "page-r"], tok: ["CODE", "PAGE"], set: { hl: "3", r1: "/app.js (свой origin) — ✓ 'self'" },
          cap: "Свой бандл с того же origin — разрешён через script-src 'self'.", term: "'self' · nonce для инлайна" },
        { phase: 2, on: ["page-r", "browser-r"], tok: ["PAGE", "BROWSER"], set: { hl: "3", r2: "<script> инъекция (XSS) — ✗ блок", b2: "отчётов: 1", b3: "заблокировано: 1" }, cls: { "page-r": { "is-changed": true } },
          cap: "Инъекция инлайн-скрипта попала в HTML, но без nonce браузер её не выполнит и пришлёт отчёт.", term: "без 'unsafe-inline' · nonce / hash · report-to" },
        { phase: 3, on: ["code-r", "page-r"], tok: ["CODE", "PAGE", "BROWSER"], set: { hl: "4", r3: "fetch evil.com — ✗ блок", b2: "отчётов: 2", b3: "заблокировано: 2" },
          cap: "Утечка данных на чужой хост заблокирована: connect-src разрешает только свои API.", term: "connect-src · exfiltration" },
        { phase: 4, on: ["code-r", "page-r"], tok: ["CODE", "PAGE", "BROWSER"], set: { hl: "6", r4: "img cdn.site.com — ✓ allowlist", r5: "iframe на evil.com — ✗ блок", b3: "заблокировано: 3" }, cls: { "page-r": { "is-changed": false } },
          cap: "Чужой сайт не встроит нас во фрейм: frame-ancestors 'none' вместо X-Frame-Options.", term: "frame-ancestors · clickjacking" },
        { phase: 5, on: ["note-r", "browser-r"], tok: ["CODE", "BROWSER", "NOTE"], set: { hl: "8", b1: "Report-Only → enforce", note1: "раскатка: Content-Security-Policy-Report-Only → смотрим отчёты → enforce", note2: "strict CSP: script-src 'nonce-…' 'strict-dynamic'; object-src 'none'; base-uri 'none'" },
          cap: "Раскатка: сначала Report-Only и отчёты, потом enforce; для скриптов — nonce и strict-dynamic.", term: "Report-Only · report-to · 'strict-dynamic'" },
      ],
    },

    "http-versions": {
      phases: ["Файлы", "HTTP/1.1", "HTTP/2", "HTTP/3", "Формат", "Потеря", "Итог"],
      codeTop: 28,
      ports: { TOP: [430, 20], ROW1: [192, 68], ROW2: [192, 148], ROW3: [192, 228], FMT1: [328, 68], FMT2: [328, 148], FMT3: [328, 228], LOSS: [430, 20], RES: [884, 20] },
      rects: ["row1-r", "row2-r", "row3-r", "fmt1-r", "fmt2-r", "fmt3-r", "res1-r", "res2-r", "res3-r"],
      steps: [
        { phase: 0, on: [], tok: ["TOP"],
          cap: "Браузеру нужны три файла: страница, оформление и картинка. Смотрим, как они передаются.", term: "HTML · CSS · IMG" },
        { phase: 1, on: ["row1-r"], tok: ["ROW1"],
          cap: "HTTP/1.1: одно соединение везёт один файл за раз, поэтому браузер открывает несколько соединений.", term: "до 6 соединений на хост · keep-alive" },
        { phase: 2, on: ["row2-r"], tok: ["ROW2"],
          cap: "HTTP/2: одно соединение, файлы порезаны на кадры и передаются вперемешку.", term: "мультиплексирование · один TCP · HPACK" },
        { phase: 3, on: ["row3-r"], tok: ["ROW3"],
          cap: "HTTP/3: одно соединение, но у каждого файла свой поток — потоки не мешают друг другу.", term: "QUIC поверх UDP · независимые потоки" },
        { phase: 4, on: ["fmt1-r", "fmt2-r", "fmt3-r"], tok: ["FMT1", "FMT2", "FMT3"],
          cap: "HTTP/1.1 — текст, заголовки читаются глазами. HTTP/2 и HTTP/3 — бинарные кадры, в браузере всегда поверх TLS.", term: "text protocol · binary framing · h2 только с TLS · TLS 1.3 встроен в QUIC" },
        { phase: 5, on: ["res1-r", "res2-r", "res3-r"], tok: ["LOSS", "RES"], show: ["loss1", "loss2", "loss3"],
          set: { res1: "ждёт только картинка", res2: "ждут все три файла", res3: "ждёт только картинка" }, cls: { "res2-r": { "is-changed": true } },
          cap: "Потерялся пакет картинки: в 1.1 ждёт её соединение, в 2 ждут все, в 3 — только её поток.", term: "head-of-line blocking · TCP отдаёт байты по порядку" },
        { phase: 6, on: ["row3-r", "res3-r"], tok: ["ROW3", "RES"],
          cap: "Итог: HTTP/3 не заставляет ждать остальных, быстрее стартует и переживает смену сети.", term: "1-RTT / 0-RTT · TLS 1.3 встроен · миграция соединения" },
      ],
    },

    "this-rule": {
      phases: ["Через точку", "Просто вызов", "call / bind", "new"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "вызов: user.greet()", r2: "this = user", r3: "почему: объект перед точкой" },
          cap: "Вызов через точку: this — объект перед точкой, здесь user.", term: "method call · receiver" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4", r1: "вызов: greet()", r2: "this = undefined (strict)", r3: "почему: перед точкой никого нет" },
          cap: "Просто вызов: this = undefined в strict mode, window в старом режиме.", term: "'use strict' · ES-модули всегда strict" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "5", r1: "вызов: greet.call({ name: 'Bot' })", r2: "this = { name: 'Bot' }", r3: "почему: передали явно" },
          cap: "call и apply задают this явно на один вызов; bind возвращает функцию с закреплённым this.", term: "call(this, a, b) · apply(this, [a]) · bind(this)" },
        { phase: 3, on: ["code-r", "out-r", "note-r"], tok: ["CODE", "OUT", "NOTE"], set: { hl: "6", r1: "вызов: new Greet()", r2: "this = новый объект", r3: "почему: new создал и привязал", note1: "порядок проверки: new → call/apply/bind → точка → просто вызов; стрелка — отдельное правило", note2: "обработчик DOM с обычной функцией: this = элемент" },
          cap: "new: создаётся новый объект, this указывает на него, функция его настраивает.", term: "new → {} → [[Prototype]] → this → return" },
      ],
    },

    "this-lost": {
      phases: ["Передали метод", "bind", "Стрелка", "Поле класса"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2-3", r1: "вызов: f() и setTimeout(cb)", r2: "this = undefined", r3: "лечение: —" }, cls: { "out-r": { "is-changed": true } },
          cap: "Метод передали как обычную функцию: точки нет, this потерян.", term: "callback теряет receiver" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4", r2: "this = user", r3: "лечение: bind закрепил user" }, cls: { "out-r": { "is-changed": false } },
          cap: "bind возвращает копию функции с закреплённым this — навсегда.", term: "fn.bind(obj) · bound function" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "5", r3: "лечение: стрелка вызывает через точку" },
          cap: "Стрелочная обёртка: внутри снова вызов через точку, this = user.", term: "() => user.greet()" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "6", note1: "стрелка в поле класса: своя копия на экземпляр, this из него", note2: "старый способ — this.save = this.save.bind(this) в конструкторе" },
          cap: "В классе метод-стрелка в поле: this из экземпляра, в onClick можно передавать напрямую.", term: "class fields · React class components" },
      ],
    },

    "this-arrow": {
      phases: ["Внутри метода", "Как метод", "bind не действует", "Правило"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "5", r1: "стрелка внутри wait()", r2: "this = user", r3: "откуда: из окружающего wait()" },
          cap: "У стрелки нет своего this: она берёт его из места, где объявлена — здесь из метода wait.", term: "lexical this · как замыкание" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "стрелка как метод hi", r2: "this = undefined / window", r3: "откуда: снаружи объекта — модуль" }, cls: { "out-r": { "is-changed": true } },
          cap: "Стрелка как метод объекта — ловушка: this берётся снаружи объекта, а не из user.", term: "методы объекта — обычные функции" },
        { phase: 2, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "3", r1: "user.hi.call(user)", r2: "this = всё ещё снаружи", r3: "call, apply, bind игнорируются", note1: "у стрелки нет своего this, arguments, prototype; new её не создаст", note2: "правило: стрелки — для колбэков и внутри методов, не для методов" },
          cap: "call, apply и bind на стрелку не действуют, new тоже нельзя.", term: "no own this · no prototype · not constructible" },
        { phase: 3, on: ["note-r"], tok: ["NOTE"], set: { note1: "стрелки — для колбэков и внутри методов: this и arguments берутся снаружи", note2: "обычные функции — для методов объекта, конструкторов и обработчиков, где this = элемент" },
          cap: "Правило: стрелки — для колбэков и внутри методов, обычные функции — для методов и конструкторов.", term: "arrow for callbacks · function for methods" },
      ],
    },

    "this-class": {
      phases: ["Метод на прототипе", "Потеря в onClick", "Стрелка-поле", "Функции"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2", r1: "save на Form.prototype", r2: "один метод на все экземпляры", r3: "this — при вызове через точку" },
          cap: "Методы класса лежат на прототипе: один на все экземпляры, this решается при вызове.", term: "class → prototype methods" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "onClick={this.save}", r2: "this = undefined при клике", r3: "React вызывает без точки" }, cls: { "out-r": { "is-changed": true } },
          cap: "onClick={this.save}: React вызовет функцию без объекта — this потерян, setState упадёт.", term: "Cannot read properties of undefined" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4", r1: "saveArrow = () => …", r2: "this = экземпляр", r3: "стрелка в поле класса" }, cls: { "out-r": { "is-changed": false } },
          cap: "Стрелка в поле класса: своя копия на экземпляр с this из него — передаём напрямую.", term: "class fields · bind в конструкторе — старый способ" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "6", note1: "в функциональных компонентах this нет: данные из замыкания и хуков", note2: "поэтому вопрос про this в React — почти всегда про классы и обработчики" },
          cap: "В функциональных компонентах this нет: всё берётся из замыкания и хуков.", term: "hooks · closures вместо this" },
      ],
    },

    "proto-link": {
      phases: ["Цепочка", "__proto__", "prototype", "Меняем prototype", "Меняем __proto__", "Правило"],
      codeTop: 262,
      ports: { REX: [192, 55], TOM: [192, 145], FN: [508, 20], PROTO: [508, 80], OBJ: [760, 80], NULL: [884, 80], OTHER: [508, 200], CODE: [428, 300], OUT: [884, 300] },
      rects: ["rex-r", "tom-r", "fn-r", "proto-r", "obj-r", "null-r", "other-r", "code-r", "out-r"],
      steps: [
        { phase: 0, on: ["rex-r", "proto-r", "obj-r", "null-r"], tok: ["REX", "PROTO", "OBJ", "NULL"],
          set: { hl: "", r1: "rex → Dog.prototype → Object.prototype → null", r2: "tom → Dog.prototype → Object.prototype → null", r3: "каждая стрелка — ссылка [[Prototype]], она же __proto__" },
          cap: "Цепочка: rex → Dog.prototype → Object.prototype → null. Каждая стрелка — ссылка [[Prototype]], она же __proto__.", term: "prototype chain · [[Prototype]]" },
        { phase: 1, on: ["rex-r", "tom-r"], tok: ["CODE", "REX", "TOM"],
          set: { hl: "1", r1: "rex.__proto__ === Dog.prototype", r2: "tom.__proto__ === Dog.prototype", r3: "две отдельные ссылки, ведут в один объект" },
          cap: "__proto__ — просто ссылка объекта на его прототип: у rex и tom они отдельные, но ведут в одно место.", term: "obj.__proto__ ≡ Object.getPrototypeOf(obj)" },
        { phase: 2, on: ["fn-r", "proto-r"], tok: ["FN", "PROTO"],
          set: { hl: "", r1: "Dog.prototype — объект-родитель", r2: "new Dog() ставит ссылку на него", r3: "один родитель на все экземпляры" },
          cap: "prototype — свойство функции Dog: объект-родитель, на который ссылаются все, кого создал new Dog.", term: "Dog.prototype · new связывает экземпляр с ним" },
        { phase: 3, on: ["proto-r", "rex-r", "tom-r"], tok: ["CODE", "PROTO", "REX", "TOM"],
          set: { hl: "2-3", protorun: "run() ← добавили", "st-rex": "run: есть, по ссылке", "st-tom": "run: есть, по ссылке", r1: "rex.run() → 'бегу'", r2: "tom.run() → 'бегу'", r3: "изменили родителя — видят все" }, cls: { "proto-r": { "is-changed": true } },
          cap: "Добавили run в Dog.prototype — он появился у rex и tom сразу: они читают его через ссылку.", term: "изменение родителя видят все наследники" },
        { phase: 4, on: ["rex-r", "other-r", "tom-r"], tok: ["CODE", "REX", "OTHER", "TOM"],
          show: ["other", "a-rex2"], hide: ["a-rex"],
          set: { hl: "4-5", "st-rex": "run: нет · swim: есть", "st-tom": "run: есть", r1: "rex → { swim() } → Object.prototype", r2: "tom → Dog.prototype, как было", r3: "поменялась только ссылка rex" }, cls: { "proto-r": { "is-changed": false }, "other-r": { "is-changed": true } },
          cap: "Заменили __proto__ у rex — поменялась только его ссылка: rex видит swim, tom по-прежнему видит run.", term: "ссылка меняется у одного объекта · Object.setPrototypeOf" },
        { phase: 5, on: ["out-r"], tok: ["CODE", "OUT"],
          set: { hl: "6", r1: "__proto__ — ссылка одного объекта", r2: "prototype — родитель для всех экземпляров", r3: "менять ссылку — setPrototypeOf; лучше задать при создании" }, cls: { "other-r": { "is-changed": false } },
          cap: "Правило: __proto__ — ссылка одного объекта, prototype — родитель для всех, кого создал конструктор.", term: "__proto__ устарел · Object.setPrototypeOf медленный · Object.create при создании" },
      ],
    },

    "proto-chain": {
      phases: ["Своё", "В прототипе", "Object.prototype", "null"],
      codeTop: 140,
      ports: { DOG: [222, 50], ANIMAL: [462, 50], OBJ: [702, 50], NULL: [884, 50], CODE: [428, 174], OUT: [884, 174] },
      rects: ["dog-r", "animal-r", "obj-r", "null-r", "code-r", "out-r"],
      steps: [
        { phase: 0, on: ["dog-r", "code-r"], tok: ["CODE", "DOG"], set: { hl: "1", r1: "ищем: name", r2: "нашли: у самого dog" },
          cap: "Чтение свойства начинается с самого объекта: name лежит прямо в dog.", term: "own property" },
        { phase: 1, on: ["animal-r", "code-r"], tok: ["CODE", "DOG", "ANIMAL"], set: { hl: "2", r1: "ищем: speak", r2: "нашли: в Animal.prototype" },
          cap: "Нет у объекта — движок идёт по скрытой ссылке [[Prototype]] к следующему объекту.", term: "[[Prototype]] · Object.getPrototypeOf(dog)" },
        { phase: 2, on: ["obj-r", "code-r"], tok: ["CODE", "DOG", "ANIMAL", "OBJ"], set: { hl: "3", r1: "ищем: toString", r2: "нашли: в Object.prototype" },
          cap: "Так доходит до Object.prototype — там toString и hasOwnProperty для всех объектов.", term: "Object.prototype — общий предок" },
        { phase: 3, on: ["null-r", "code-r"], tok: ["CODE", "OBJ", "NULL"], set: { hl: "4", r1: "ищем: fly", r2: "нашли: нигде → undefined" },
          cap: "Дальше null: свойства нет, результат undefined, без ошибки.", term: "конец цепочки · undefined, не throw" },
      ],
    },

    "proto-create": {
      phases: ["Object.create", "new", "class", "prototype vs __proto__"],
      codeTop: 28,
      ports: { CODE: [428, 90], NEW: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "new-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "1", note1: "Object.create(proto) — самый прямой способ задать [[Prototype]]", note2: "Object.create(null) — объект без прототипа, чистый словарь" },
          cap: "Object.create(proto) создаёт объект с указанным прототипом — без конструкторов.", term: "Object.create · Object.setPrototypeOf" },
        { phase: 1, on: ["code-r", "new-r"], tok: ["CODE", "NEW"], set: { hl: "2-4" }, show: ["new"],
          cap: "new делает четыре шага: новый объект, связь с Dog.prototype, вызов с this, возврат объекта.", term: "new → {} → [[Prototype]] → call → return" },
        { phase: 2, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "5", note1: "class — синтаксис над функцией и prototype: методы попадают в Cat.prototype", note2: "typeof Cat === 'function'; методы класса неперечислимые, вызов без new — ошибка" },
          cap: "class — тот же механизм: методы попадают в Cat.prototype, конструктор — функция.", term: "class = сахар · typeof Cat === 'function'" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "6", note1: "prototype — свойство функции-конструктора; [[Prototype]] (__proto__) — ссылка у объекта", note2: "rex.__proto__ === Dog.prototype; у функции Dog своя ссылка → Function.prototype" },
          cap: "prototype — свойство функции, [[Prototype]] — ссылка у объекта; __proto__ — устаревший доступ к ней.", term: "F.prototype vs obj.[[Prototype]] · Object.getPrototypeOf" },
      ],
    },

    "proto-shared": {
      phases: ["Общий метод", "Своё свойство", "in / hasOwn", "Меняем прототип"],
      codeTop: 28,
      ports: { REX: [212, 71], TOM: [212, 151], PROTO: [508, 105], CODE: [884, 90], NOTE: [884, 230] },
      rects: ["rex-r", "tom-r", "proto-r", "code-r", "note-r"],
      steps: [
        { phase: 0, on: ["proto-r", "code-r"], tok: ["CODE", "REX", "PROTO", "TOM"], set: { hl: "1", "st-rex": "speak: из прототипа", "st-tom": "speak: из прототипа" },
          cap: "Метод один — в прототипе; оба объекта читают его по цепочке.", term: "shared method · память один раз" },
        { phase: 1, on: ["rex-r", "code-r"], tok: ["CODE", "REX"], set: { hl: "2", "st-rex": "speak: своё, перекрыло", note1: "запись создаёт своё свойство у rex, прототип не тронут; tom видит старое" }, cls: { "rex-r": { "is-changed": true } },
          cap: "Запись создаёт собственное свойство у rex и перекрывает прототипное; tom видит старое.", term: "shadowing · запись не идёт по цепочке" },
        { phase: 2, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "3-4", note1: "in — по всей цепочке; hasOwnProperty — только своё", note2: "Object.keys — только свои; for…in — и унаследованные перечислимые" }, cls: { "rex-r": { "is-changed": false } },
          cap: "in смотрит всю цепочку, hasOwnProperty — только собственные свойства.", term: "in · hasOwnProperty · Object.hasOwn" },
        { phase: 3, on: ["proto-r", "rex-r", "tom-r"], tok: ["CODE", "PROTO", "REX", "TOM"], set: { hl: "5", "st-rex": "run: из прототипа", "st-tom": "run: из прототипа", note1: "изменение прототипа видят все существующие объекты сразу", note2: "так работают полифилы — и так же ломают чужой код" },
          cap: "Добавили в прототип — появилось у всех сразу; так делают полифилы и так же ломают чужой код.", term: "monkey patching · полифилы · Array.prototype" },
      ],
    },

    "proto-inherit": {
      phases: ["extends", "super", "instanceof", "Встроенные"],
      codeTop: 28,
      ports: { CODE: [428, 90], CHAIN: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "chain-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "chain-r"], tok: ["CODE", "CHAIN"], set: { hl: "2", c1: "rex → Dog.prototype", c2: "→ Animal.prototype", c3: "→ Object.prototype → null" },
          cap: "extends связывает Dog.prototype с Animal.prototype — цепочка из двух уровней.", term: "Object.setPrototypeOf(Dog.prototype, Animal.prototype)" },
        { phase: 1, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "3", note1: "super(n) вызывает конструктор родителя для этого же this", note2: "до super() обращаться к this нельзя — ReferenceError" },
          cap: "super(n) вызывает конструктор родителя для этого же this; до super this недоступен.", term: "super() до this · derived constructor" },
        { phase: 2, on: ["code-r", "chain-r"], tok: ["CODE", "CHAIN"], set: { hl: "6-7", c4: "instanceof: идёт по цепочке ✓" },
          cap: "instanceof проверяет, есть ли Dog.prototype или Animal.prototype в цепочке объекта.", term: "instanceof · Symbol.hasInstance · Object.getPrototypeOf" },
        { phase: 3, on: ["chain-r", "note-r"], tok: ["CHAIN", "NOTE"], set: { hl: "", c1: "[] → Array.prototype", c2: "→ Object.prototype → null", c3: "fn → Function.prototype", c4: "примитивы — через обёртки", note1: "массивы, функции, даты — объекты с прототипами: map, call, getTime оттуда", note2: "'abc'.toUpperCase() — временная обёртка String" },
          cap: "Массивы, функции, даты — тоже объекты с прототипами; у примитивов — временные обёртки.", term: "Array.prototype.map · Function.prototype.call · autoboxing" },
      ],
    },

    "ts-type-interface": {
      phases: ["Слияние", "Дополнить библиотеку", "Объединения и кортежи", "Вычисляемые типы"],
      codeTop: 28,
      ports: { CODE: [428, 90], IFACE: [884, 44], TYPE: [884, 146], NOTE: [884, 234] },
      rects: ["code-r", "iface-r", "type-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "iface-r"], tok: ["CODE", "IFACE"], set: { hl: "1-2", i1: "два interface с одним именем — один тип" },
          cap: "Только interface: два объявления с одним именем сливаются в одно.", term: "declaration merging" },
        { phase: 1, on: ["code-r", "iface-r"], tok: ["CODE", "IFACE"], set: { hl: "3", i2: "можно дополнить чужой тип: window, Request" },
          cap: "Поэтому только interface дополняет типы библиотек: declare module плюс interface с тем же именем.", term: "module augmentation · global augmentation" },
        { phase: 2, on: ["code-r", "type-r"], tok: ["CODE", "TYPE"], set: { hl: "5-6", t1: "объединения: string | number", t2: "кортежи и примитивы" },
          cap: "Только type: объединения, кортежи, псевдонимы примитивов — interface описывает лишь объект.", term: "union · tuple · primitive alias" },
        { phase: 3, on: ["code-r", "type-r", "note-r"], tok: ["CODE", "TYPE", "NOTE"], set: { hl: "7-8", t3: "keyof, mapped, conditional, шаблоны строк", note1: "оба умеют: описать объект и функцию, расширить (extends / &), implements у класса, если это не union", note2: "interface кэшируется по имени: быстрее проверка и понятнее ошибки в больших проектах" },
          cap: "Только type: вычисляемые типы — keyof, mapped, conditional, template literal.", term: "keyof · mapped · conditional · template literal" },
      ],
    },

    "ts-problems": {
      phases: ["Контракт", "Расширение", "Состояния", "Тип из типа"],
      codeTop: 28,
      ports: { CODE: [428, 90], IFACE: [884, 44], TYPE: [884, 146], NOTE: [884, 234] },
      rects: ["code-r", "iface-r", "type-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "iface-r"], tok: ["CODE", "IFACE"], set: { hl: "2-3", p1: "класс обязан реализовать все методы" },
          cap: "interface — контракт: класс через implements обязан реализовать все методы.", term: "implements · contract" },
        { phase: 1, on: ["code-r", "iface-r"], tok: ["CODE", "IFACE"], set: { hl: "4", p2: "extends — собрать форму из форм" },
          cap: "extends собирает форму из других форм и ругается на конфликт полей; пересечение & промолчит.", term: "extends · конфликт → ошибка, & → never" },
        { phase: 2, on: ["code-r", "type-r"], tok: ["CODE", "TYPE"], set: { hl: "5-7", q1: "состояния экрана как union", q2: "невозможных комбинаций нет" },
          cap: "type с объединением описывает состояния экрана: loading, error, ok — без невозможных комбинаций.", term: "discriminated union · impossible states impossible" },
        { phase: 3, on: ["code-r", "type-r", "note-r"], tok: ["CODE", "TYPE", "NOTE"], set: { hl: "8-9", q3: "тип из типа: Partial, keyof, шаблоны", note1: "правило: контракты и формы объектов — interface; состояния, объединения, производные типы — type", note2: "в команде одно правило, его держит eslint: consistent-type-definitions" },
          cap: "type выводит тип из другого: Partial, keyof, шаблоны строк — без дублирования.", term: "derived types · DRY в типах" },
      ],
    },

    "ts-generics": {
      phases: ["Без generic", "Параметр типа", "Вывод T", "В жизни"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 170] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1", r1: "any на входе — any на выходе", r2: "тип потерян", r3: "или копия функции на каждый тип" }, cls: { "out-r": { "is-changed": true } },
          cap: "Без generic: либо any и потеря типа, либо копия функции на каждый тип.", term: "generic = параметр типа" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2", r1: "T — параметр типа", r2: "подставляется при вызове", r3: "внутри функции T один и тот же" }, cls: { "out-r": { "is-changed": false } },
          cap: "T — переменная для типа: подставляется при вызове, внутри функции остаётся одной и той же.", term: "type parameter <T>" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3-4", r1: "first([1, 2]) → number", r2: "first(['a']) → string", r3: "выход зависит от входа" },
          cap: "Компилятор выводит T из аргумента: тип результата зависит от типа входа, писать явно не нужно.", term: "type inference · выход связан со входом" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "5-6", r1: "useState<T>, Promise<T>, Array<T>", r2: "ApiResponse<T> — обёртка", r3: "один шаблон, разное содержимое", note1: "generic нужен, когда тип выхода зависит от типа входа или один шаблон повторяется с разным содержимым", note2: "явный <T> пишут, когда вывести неоткуда: useState<User | null>(null)" },
          cap: "В жизни: useState<T>, Promise<T>, ApiResponse<T> — один шаблон для разного содержимого.", term: "generic types · явный аргумент, когда вывод невозможен" },
      ],
    },

    "ts-generic-limits": {
      phases: ["extends", "keyof", "Компонент", "Когда лишний"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-2", r1: "T extends { id: string }", r2: "внутри есть i.id", r3: "снаружи — любой тип с id" },
          cap: "extends ограничивает T: внутри есть id, снаружи подходит любой тип с id.", term: "generic constraint" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3-5", r1: "K — только ключи T", r2: "T[K] — тип поля", r3: "опечатка в ключе — ошибка" },
          cap: "keyof и T[K]: ключ только из полей объекта, результат — точный тип этого поля.", term: "keyof · indexed access T[K]" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "6", r1: "Props<T> — список чего угодно", r2: "render получает item: T", r3: "T выводится из items" },
          cap: "Generic-компонент: List<T> отдаёт в render элемент правильного типа, T выводится из items.", term: "generic component · явный <List<User>> редко нужен" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "7", r1: "выход не зависит от входа — union", r2: "<T extends string> — лишнее", r3: "меньше параметров — яснее", note1: "правило: generic — когда типы входа и выхода связаны; иначе union или конкретный тип", note2: "параметр типа, который используется один раз, — почти всегда лишний" },
          cap: "Когда generic лишний: тип выхода не зависит от входа — хватит union или конкретного типа.", term: "избыточные generics · параметр на один раз" },
      ],
    },

    "ts-unknown-never": {
      phases: ["any", "unknown", "never в switch", "never как сигнал"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 198] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1", r1: "any — проверка выключена", r2: "ошибка всплывёт в рантайме", r3: "any заражает всё вокруг" }, cls: { "out-r": { "is-changed": true } },
          cap: "any выключает проверку: компилятор молчит, ошибка всплывает в рантайме.", term: "any · noImplicitAny" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2-3", r1: "unknown — тип неизвестен", r2: "сначала проверь, потом используй", r3: "typeof, instanceof, in, схема" }, cls: { "out-r": { "is-changed": false } },
          cap: "unknown — «значение есть, тип неизвестен»: сначала проверь, потом используй.", term: "unknown · narrowing перед использованием" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-7", r1: "never — сюда попасть нельзя", r2: "новый вариант — ошибка в switch", r3: "все варианты разобраны" },
          cap: "never в default: появится новый вариант union — компилятор укажет на этот switch.", term: "exhaustiveness check · assertNever" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "8", r1: "string & number = never", r2: "типы несовместимы", r3: "never — сигнал ошибки", note1: "never также — тип функции, которая всегда бросает или не завершается", note2: "any — выключить проверку; unknown — проверить перед использованием; never — «не бывает»" },
          cap: "Пересечение несовместимых типов даёт never — сигнал, что в типах ошибка.", term: "intersection → never · (): never для throw" },
      ],
    },

    "ts-narrowing": {
      phases: ["Union", "По kind", "typeof / instanceof", "Предикат"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 212] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-2", r1: "Shape = Circle | Square", r2: "kind — общее поле", r3: "по нему различаем варианты" },
          cap: "Объединение с общим полем kind: по нему компилятор различает варианты.", term: "discriminated union · literal types" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "s.kind === 'circle'", r2: "внутри if s — Circle", r3: "поэтому есть s.r" },
          cap: "Проверка kind сужает тип в ветке: внутри if компилятор знает, что это Circle.", term: "narrowing · control-flow analysis" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-6", r1: "typeof — примитивы", r2: "instanceof — классы", r3: "in — есть ли поле" },
          cap: "typeof для примитивов, instanceof для классов, in для проверки поля.", term: "typeof · instanceof · in · equality narrowing" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "7-9", r1: "x is User — своя проверка", r2: "после неё x — User", r3: "asserts — бросает ошибку", note1: "предикат — свои проверки: после isUser(x) внутри if x уже User", note2: "asserts x is User — вариант, который бросает ошибку вместо false" },
          cap: "Своя проверка с x is User: после неё компилятор считает x пользователем.", term: "type predicate · asserts condition" },
      ],
    },

    "ts-util-objects": {
      phases: ["Partial / Required", "Readonly", "Pick / Omit", "Record"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 198] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2-3", r1: "Partial — поля можно не указывать", r2: "Required — все поля обязательны", r3: "один тип на черновик и готовый объект" },
          cap: "Partial делает все поля необязательными, Required — обязательными: одна форма для черновика и сохранённого.", term: "Partial<T> · Required<T>" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4", r1: "Readonly — поля нельзя менять", r2: "запись — ошибка", r3: "вложенные объекты не трогает" },
          cap: "Readonly запрещает запись в поля на уровне типов; вложенные объекты не трогает.", term: "Readonly<T> · только на верхнем уровне" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "5-6", r1: "Pick — оставить указанные поля", r2: "Omit — убрать указанные поля", r3: "User без password одной строкой" },
          cap: "Pick берёт нужные поля, Omit убирает лишние — карточка пользователя без пароля.", term: "Pick<T, K> · Omit<T, K>" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "7-8", r1: "K — ключи, V — значения", r2: "{ circle: string; square: string }", r3: "нет ключа — ошибка", note1: "V может быть функцией: Record<Kind, (size: number) => string> — таблица обработчиков вместо switch", note2: "комбинируются: Partial<Pick<User, 'name' | 'email'>>" },
          cap: "Record<K, V>: объект со всеми ключами из K, под каждым — значение типа V; пропустил ключ — ошибка.", term: "Record<K, V> · mapped types под капотом" },
      ],
    },

    "ts-util-unions": {
      phases: ["Union", "Extract", "Exclude", "NonNullable"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1", r1: "union — список вариантов", r2: "utility убирают или оставляют варианты", r3: "результат — тоже union" },
          cap: "Exclude и Extract работают с объединениями: убрать или оставить варианты.", term: "union · distributive conditional types" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2", r1: "Extract — оставить варианты", r2: "из четырёх статусов остался 'loading'", r3: "по значению или по форме" },
          cap: "Extract оставляет только те варианты, что подходят под второй аргумент.", term: "Extract<U, X>" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "Exclude — убрать варианты", r2: "остались 'ok' | 'error'", r3: "Omit, но для union" },
          cap: "Exclude выбрасывает варианты: из статусов остаются только конечные.", term: "Exclude<U, X>" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "4-7", r1: "NonNullable — без null и undefined", r2: "Extract по форме — вариант объекта", r3: "выбрать событие по полю type", note1: "Exclude и Extract идут по каждому варианту union по очереди — distributive conditional type", note2: "Omit на объединении объектов ведёт себя неожиданно: сначала Extract нужного варианта" },
          cap: "NonNullable убирает null и undefined; Extract по форме выбирает вариант из объединения объектов.", term: "NonNullable<T> · Extract<Event, { type: 'click' }>" },
      ],
    },

    "ts-util-functions": {
      phases: ["Parameters", "ReturnType", "Классы", "this"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 212] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-3", r1: "Parameters — типы аргументов функции", r2: "[string, number?]", r3: "берём из функции, не переписываем" },
          cap: "Parameters вытаскивает типы аргументов кортежем — для обёрток и моков без дублирования.", term: "Parameters<typeof fn> · typeof" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4", r1: "ReturnType — тип результата функции", r2: "Promise<User>", r3: "у async сверху Awaited" },
          cap: "ReturnType берёт тип результата функции; для async-функций сверху Awaited.", term: "ReturnType<F> · Awaited<ReturnType<F>>" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "5-7", r1: "ConstructorParameters — аргументы new", r2: "InstanceType — объект после new", r3: "[string] и Repo" },
          cap: "ConstructorParameters и InstanceType — то же для классов: аргументы new и тип экземпляра.", term: "ConstructorParameters<C> · InstanceType<C>" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "8-9", r1: "ThisParameterType — тип this", r2: "OmitThisParameter — функция без this", r3: "ThisType — this внутри объекта", note1: "ThisType<T> — контекст this в объектных литералах при noImplicitThis (API в стиле Vue)", note2: "ThisParameterType, OmitThisParameter, ThisType — редкие: знать, что есть" },
          cap: "this можно объявить параметром функции: ThisParameterType читает его, OmitThisParameter убирает.", term: "ThisParameterType<F> · OmitThisParameter<F> · ThisType<T>" },
      ],
    },

    "ts-util-async": {
      phases: ["Awaited", "NoInfer", "Регистр", "Capitalize"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 184] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-3", r1: "Awaited — тип после await", r2: "Promise<Promise<string>> → string", r3: "вложенные Promise разворачивает" },
          cap: "Awaited даёт тип после await и разворачивает вложенные Promise.", term: "Awaited<T> · TS 4.5" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-5", r1: "NoInfer — не выводить T отсюда", r2: "T берётся из items", r3: "'c' — ошибка" },
          cap: "NoInfer говорит компилятору не выводить T из этого аргумента: T берётся из items.", term: "NoInfer<T> · TS 5.4" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "6", r1: "Uppercase — верхний регистр", r2: "Lowercase — нижний", r3: "только литеральные строки" },
          cap: "Uppercase и Lowercase меняют регистр литерального строкового типа.", term: "Uppercase<S> · Lowercase<S>" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "7", r1: "Capitalize — первая буква большая", r2: "Uncapitalize — маленькая", r3: "click → onClick", note1: "строковые utility работают только с литеральными типами: string остаётся string", note2: "типичное применение — template literal types: `on${Capitalize<E>}`" },
          cap: "Capitalize и Uncapitalize вместе с шаблонными строками собирают имена: click → onClick.", term: "Capitalize<S> · Uncapitalize<S> · template literal types" },
      ],
    },

    "ts-util-const": {
      phases: ["as const", "typeof", "satisfies", "Аннотация"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 170] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1", r1: "as const — значения становятся типами", r2: "readonly ['admin', 'user']", r3: "тип из данных" },
          cap: "as const превращает данные в литеральные типы: массив становится readonly-кортежем.", term: "as const · const assertion" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "2", r1: "typeof ROLES — тип константы", r2: "[number] — тип элемента", r3: "'admin' | 'user'" },
          cap: "typeof с [number] достаёт union значений из массива — источник истины один.", term: "typeof · indexed access [number]" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3-5", r1: "satisfies — проверить по типу", r2: "тип значения не меняется", r3: "cfg.host — ошибка, его нет" },
          cap: "satisfies проверяет, что значение подходит под тип, но не расширяет его.", term: "satisfies · TS 4.9" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "6", r1: ": Config — тип становится Config", r2: "точные значения теряются", r3: "satisfies точнее", note1: "аннотация — когда важен контракт; satisfies — когда важен точный тип значения", note2: "as const и satisfies вместе: точные литералы плюс проверка формы" },
          cap: "Аннотация расширяет тип до Config, satisfies оставляет точный — выбирайте по задаче.", term: "annotation vs satisfies" },
      ],
    },

    "ai-request": {
      phases: ["Через бэкенд", "Роли", "Параметры", "Ответ"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 170] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-2", r1: "ключ API — на сервере", r2: "фронт ходит в /api/chat", r3: "бэкенд добавляет ключ и лимиты" },
          cap: "Фронт не ходит в LLM напрямую: ключ и лимиты живут на своём бэкенде.", term: "server proxy · ключ не в бандле" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-5", r1: "system — правила и роль", r2: "user — вопрос", r3: "assistant — прошлые ответы" },
          cap: "Запрос — список сообщений с ролями: system задаёт правила, user спрашивает, assistant — история.", term: "messages: system | user | assistant" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "6", r1: "temperature — случайность, 0 точнее", r2: "max_tokens — потолок длины", r3: "stream — ответ по кусочкам" },
          cap: "temperature — насколько случайный ответ, max_tokens — потолок длины, stream — отдавать по кусочкам.", term: "temperature · max_tokens · stream" },
        { phase: 3, on: ["out-r", "note-r"], tok: ["OUT", "NOTE"], set: { hl: "", r1: "в ответе: текст и usage", r2: "usage — сколько токенов", r3: "finish_reason: stop или length", note1: "usage.prompt_tokens и completion_tokens — по ним считают стоимость", note2: "finish_reason: length — упёрлись в max_tokens, ответ обрезан" },
          cap: "В ответе текст, число токенов и причина остановки: length значит, что ответ обрезан.", term: "usage · finish_reason" },
      ],
    },

    "ai-stream": {
      phases: ["SSE", "Дельты", "Буфер", "Стоп"],
      codeTop: 100,
      ports: { API: [79, 92], SSE: [259, 92], BUF: [439, 92], STATE: [594, 92], SCREEN: [784, 92], CODE: [428, 150], STATUS: [884, 116] },
      rects: ["api-r", "sse-r", "buf-r", "state-r", "screen-r", "code-r", "status-r"],
      steps: [
        { phase: 0, on: ["api-r", "sse-r", "code-r"], tok: ["CODE", "API", "SSE"], set: { hl: "1-3", "st-api": "отдаёт по кусочкам", "st-sse": "строки data: {…}", s1: "status: streaming" }, cls: { "api-r": { "is-called": true }, "sse-r": { "is-called": true } },
          cap: "Ответ идёт потоком: строки data: {…}, каждая — маленький JSON с кусочком текста.", term: "SSE · text/event-stream" },
        { phase: 1, on: ["sse-r", "buf-r", "code-r"], tok: ["CODE", "SSE", "BUF"], set: { hl: "4", "st-sse": "delta: «Воз», «врат», «…»", "st-buf": "склеиваем дельты" }, cls: { "buf-r": { "is-called": true } },
          cap: "В каждой строке delta — следующий кусочек текста; их склеивают в буфер.", term: "delta · JSON.parse каждой строки" },
        { phase: 2, on: ["buf-r", "state-r", "screen-r", "code-r"], tok: ["CODE", "BUF", "STATE", "SCREEN"], set: { hl: "6", "st-buf": "копит до кадра", "st-state": "+= буфер", "st-screen": "печатается…" }, cls: { "state-r": { "is-called": true }, "screen-r": { "is-called": true } },
          cap: "В state буфер уходит раз в кадр, а не на каждую дельту — иначе сотни рендеров в секунду.", term: "requestAnimationFrame · batching" },
        { phase: 3, on: ["code-r", "status-r"], tok: ["CODE", "STATUS"], set: { hl: "5,7".replace(",", "-"), s2: "стоп: abort() → done", s3: "data: [DONE] — конец потока", "st-sse": "data: [DONE]" },
          cap: "Кнопка «Стоп» — AbortController; конец потока сервер помечает строкой data: [DONE].", term: "AbortController · [DONE] · статусы idle / streaming / done / error" },
      ],
    },

    "ai-embed": {
      phases: ["Вектор", "Близость", "База", "Поиск"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 156] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-2", r1: "текст → массив чисел", r2: "1536 чисел — координаты смысла", r3: "похожий смысл — близкие векторы" },
          cap: "Embedding — текст, превращённый в массив чисел: похожий смысл даёт близкие векторы.", term: "embedding · размерность 1536" },
        { phase: 1, on: ["out-r"], tok: ["OUT"], set: { hl: "", r1: "cosine — угол между векторами", r2: "1 — тот же смысл, 0 — разный", r3: "«возврат» ≈ «вернуть деньги»" },
          cap: "Близость считают косинусом угла: «возврат товара» и «вернуть деньги» окажутся рядом.", term: "cosine similarity · семантический поиск" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "3", r1: "хранит вектор + текст + id", r2: "индекс для поиска ближайших", r3: "pgvector, Qdrant, Pinecone" },
          cap: "Векторная база хранит векторы вместе с текстом и быстро ищет ближайшие.", term: "pgvector · Qdrant · HNSW-индекс" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "4-5", r1: "вопрос → вектор той же моделью", r2: "search: k ближайших", r3: "это retrieval для RAG", note1: "модель embeddings для индекса и для запроса — одна и та же", note2: "фильтр по метаданным: только документы этого пользователя" },
          cap: "Вопрос превращают в вектор той же моделью и берут k ближайших записей.", term: "top-k · metadata filter" },
      ],
    },

    "ai-rag": {
      phases: ["Зачем", "Индексация", "Поиск", "Ответ", "Ловушки"],
      codeTop: 28,
      ports: { DOCS: [90, 116], CHUNKS: [270, 116], EMB: [450, 116], DB: [630, 116], Q: [90, 216], QV: [270, 216], TOP: [450, 216], PROMPT: [630, 216], LLM: [810, 216], NOTE: [884, 262] },
      rects: ["docs-r", "chunks-r", "emb-r", "db-r", "q-r", "qv-r", "top-r", "prompt-r", "llm-r", "note-r"],
      steps: [
        { phase: 0, on: ["llm-r"], tok: ["LLM"], set: { note1: "RAG: модель отвечает по вашим документам, а не по памяти", note2: "без дообучения, данные всегда актуальные, ответ со ссылками" },
          cap: "RAG: модель отвечает по вашим документам, а не по памяти — без дообучения, данные актуальные.", term: "retrieval-augmented generation" },
        { phase: 1, on: ["docs-r", "chunks-r", "emb-r", "db-r"], tok: ["DOCS", "CHUNKS", "EMB", "DB"], set: { "st-docs": "PDF, база знаний", "st-chunks": "по 300–800 токенов", "st-emb": "вектор на кусок", "st-db": "вектор + текст" },
          cls: { "docs-r": { "is-called": true }, "chunks-r": { "is-called": true }, "emb-r": { "is-called": true }, "db-r": { "is-called": true } },
          cap: "Индексация заранее: документы режут на куски, считают embeddings, кладут в векторную базу.", term: "chunking · overlap · ingestion" },
        { phase: 2, on: ["q-r", "qv-r", "top-r"], tok: ["Q", "QV", "TOP"], set: { "st-q": "«как вернуть товар?»", "st-qv": "той же моделью", "st-top": "5 ближайших кусков" },
          cls: { "q-r": { "is-called": true }, "qv-r": { "is-called": true }, "top-r": { "is-called": true } },
          cap: "Вопрос → вектор → k ближайших кусков из базы.", term: "retrieval · top-k · reranking" },
        { phase: 3, on: ["prompt-r", "llm-r"], tok: ["TOP", "PROMPT", "LLM"], set: { "st-prompt": "контекст + вопрос", "st-llm": "ответ + ссылки" },
          cls: { "prompt-r": { "is-called": true }, "llm-r": { "is-called": true } },
          cap: "Куски вставляют в промпт как контекст: «отвечай только по нему» — ответ со ссылками на источники.", term: "context window · цитаты · grounding" },
        { phase: 4, on: ["note-r"], tok: ["NOTE"], set: { note1: "ловушки: слишком крупные или мелкие куски, шум в top-k, ответ мимо контекста", note2: "лечение: подбор размера кусков, reranking, eval-набор вопросов с эталонами" },
          cap: "Ловушки: неудачный размер кусков, шум в top-k, галлюцинации мимо контекста — нужен eval-набор.", term: "chunk size · reranking · eval" },
      ],
    },

    "ai-prompt": {
      phases: ["Роли", "JSON-схема", "Проверка Zod", "Где хранить"],
      codeTop: 28,
      ports: { CODE: [428, 90], OUT: [884, 44], NOTE: [884, 170] },
      rects: ["code-r", "out-r", "note-r"],
      steps: [
        { phase: 0, on: ["out-r"], tok: ["OUT"], set: { hl: "", r1: "system — кто модель и правила", r2: "few-shot — 2–3 примера ответа", r3: "формат задаём явно" },
          cap: "Промпт — это system с правилами плюс примеры нужного ответа; формат задаём явно.", term: "system prompt · few-shot" },
        { phase: 1, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "1-3", r1: "просим JSON по схеме", r2: "поля, а не проза", r3: "UI рендерит по intent" },
          cap: "Структурированный ответ: просим JSON по схеме, чтобы UI работал с полями, а не с прозой.", term: "structured output · JSON schema · function calling" },
        { phase: 2, on: ["code-r", "out-r"], tok: ["CODE", "OUT"], set: { hl: "4-5", r1: "ответ модели — unknown", r2: "safeParse проверяет без throw", r3: "не сошлось — повтор с текстом ошибки" },
          cap: "Ответ модели — граница: проверяем схемой Zod, при ошибке повторяем запрос с текстом ошибки.", term: "validate at boundary · retry with feedback" },
        { phase: 3, on: ["code-r", "note-r"], tok: ["CODE", "NOTE"], set: { hl: "6", r1: "промпты — в репозитории", r2: "с версией и тестами", r3: "меняются без деплоя фронта", note1: "промпт хранят как код: файл, версия, ревью, тест на golden-наборе", note2: "температура для структурированных ответов — 0" },
          cap: "Промпты хранят как код: в репозитории, с версиями и тестами, а не в строках компонента.", term: "prompt versioning · golden set" },
      ],
    },

    "ai-eval": {
      phases: ["Качество", "Guardrails", "Токены", "Стоимость"],
      codeTop: 28,
      ports: { Q: [280, 44], G: [582, 44], T: [884, 44], NOTE: [884, 184] },
      rects: ["q-r", "g-r", "t-r", "note-r"],
      steps: [
        { phase: 0, on: ["q-r"], tok: ["Q"], set: { q1: "golden-набор: вопрос → эталон", q2: "прогон после каждого изменения", q3: "доля верных, судья — человек или модель" },
          cap: "Качество меряют на golden-наборе: вопрос и эталон, прогон после каждого изменения, доля верных.", term: "eval set · LLM-as-judge" },
        { phase: 1, on: ["g-r"], tok: ["G"], set: { g1: "фильтр входа: запрещённые темы", g2: "фильтр выхода: формат, ссылки", g3: "fallback — оператор или «не знаю»" },
          cap: "Guardrails: фильтры входа и выхода, проверка ссылок на источники, fallback на оператора.", term: "guardrails · fallback" },
        { phase: 2, on: ["t-r"], tok: ["T"], set: { t1: "контекст ограничен", t2: "историю обрезают или суммируют", t3: "длинные документы — кусками" },
          cap: "Токены: окно контекста ограничено, историю обрезают или суммируют, длинные документы режут.", term: "context window · truncation · summary" },
        { phase: 3, on: ["t-r", "note-r"], tok: ["T", "NOTE"], set: { t1: "цена за токены ввода и вывода", t2: "кеш одинаковых запросов", t3: "дешёвая модель для простых задач", note1: "лимиты на пользователя и на день; стриминг — чтобы ждать было не так больно", note2: "логируем запрос, ответ, токены и время — иначе не найти, где дорого и медленно" },
          cap: "Стоимость: платим за токены ввода и вывода; кешируем, простые задачи — дешёвой модели, лимиты.", term: "prompt caching · model routing · rate limit" },
      ],
    },
  };

  function initialState() {
    return { text: {}, vis: {}, cls: {} };
  }

  function applyStep(state, step) {
    Object.assign(state.text, step.set ?? {});
    (step.show ?? []).forEach((name) => { state.vis[name] = true; });
    (step.hide ?? []).forEach((name) => { state.vis[name] = false; });
    for (const [name, classes] of Object.entries(step.cls ?? {})) {
      state.cls[name] = { ...(state.cls[name] ?? {}), ...classes };
    }
  }

  function stateAt(story, index) {
    const state = initialState();
    for (let i = 0; i <= index && i < story.steps.length; i += 1) applyStep(state, story.steps[i]);
    return state;
  }

  function namesOf(story) {
    const names = { text: new Set(), vis: new Set(), cls: new Set() };
    story.steps.forEach((step) => {
      Object.keys(step.set ?? {}).forEach((name) => names.text.add(name));
      (step.show ?? []).forEach((name) => names.vis.add(name));
      (step.hide ?? []).forEach((name) => names.vis.add(name));
      Object.keys(step.cls ?? {}).forEach((name) => names.cls.add(name));
    });
    return names;
  }

  const controllers = new WeakMap();

  function setupStory(figure, options = {}) {
    if (!figure) return null;
    const existing = controllers.get(figure);
    if (existing) return existing;
    const story = STORIES[figure.getAttribute?.("data-story")];
    if (!story) return null;

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
    const autoplay = options.autoplay ?? true;

    const names = namesOf(story);
    const initialText = new Map();
    names.text.forEach((name) => { initialText.set(name, field(name)?.textContent ?? ""); });
    const initialHidden = new Map();
    names.vis.forEach((name) => { initialHidden.set(name, Boolean(field(name)?.classList?.contains?.("is-off"))); });

    let index = 0;
    let playing = autoplay && !reducedMotion;
    let timer = null;
    let hops = [];

    function moveToken(ports) {
      hops.forEach((id) => clearTimer(id));
      hops = [];
      const token = field("tok");
      if (!token) return;
      ports.forEach((name, n) => {
        const place = () => {
          const port = story.ports[name];
          if (port) token.setAttribute?.("transform", `translate(${port[0]},${port[1]})`);
        };
        if (n === 0 || reducedMotion) place();
        else hops.push(setTimer(place, n * HOP_DELAY));
      });
    }

    function paintHighlightLine(value) {
      const hl = field("hl");
      if (!hl) return;
      const raw = String(value ?? "").trim();
      if (!raw) {
        hl.classList?.toggle?.("is-off", true);
        return;
      }
      const [a, b] = raw.split("-").map(Number);
      const from = a;
      const to = Number.isFinite(b) ? b : a;
      hl.setAttribute?.("y", String((story.codeTop ?? CODE_TOP) + 6 + CODE_LINE * (from - 1)));
      hl.setAttribute?.("height", String(CODE_LINE * (to - from + 1)));
      hl.classList?.toggle?.("is-off", false);
    }

    function paint(k) {
      const state = stateAt(story, k);
      const step = story.steps[k];

      phaseButtons.forEach((button) => {
        const active = Number(button.getAttribute?.("data-walk-phase")) === step.phase;
        button.setAttribute?.("aria-pressed", String(active));
      });

      names.text.forEach((name) => {
        const value = state.text[name] ?? initialText.get(name);
        if (name === "hl") paintHighlightLine(value);
        else {
          const el = field(name);
          if (el) el.textContent = value;
        }
      });
      names.vis.forEach((name) => {
        const visible = state.vis[name] ?? !initialHidden.get(name);
        field(name)?.classList?.toggle?.("is-off", !visible);
      });
      names.cls.forEach((name) => {
        const el = field(name);
        if (!el) return;
        const classes = state.cls[name] ?? {};
        ["is-called", "is-skipped", "is-changed"].forEach((cls) => el.classList?.toggle?.(cls, Boolean(classes[cls])));
      });
      story.rects.forEach((name) => field(name)?.classList?.toggle?.("is-on", step.on.includes(name)));
      moveToken(step.tok);

      if (capEl) capEl.textContent = step.cap;
      if (termEl) termEl.textContent = step.term;
      if (countEl) countEl.textContent = `шаг ${k + 1} / ${story.steps.length}`;
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
      const total = story.steps.length;
      index = ((k % total) + total) % total;
      paint(index);
      arm();
    }

    function setPlaying(value) {
      playing = Boolean(value);
      renderControls();
      arm();
    }

    const controller = {
      story,
      get index() { return index; },
      get playing() { return playing; },
      get paused() { return !playing; },
      go,
      next() { go(index + 1); },
      prev() { go(index - 1); },
      replay() { setPlaying(true); go(0); },
      togglePlay() { setPlaying(!playing); },
      setPlaying,
    };
    controllers.set(figure, controller);

    playButton?.addEventListener?.("click", controller.togglePlay);
    control("prev")?.addEventListener?.("click", controller.prev);
    control("next")?.addEventListener?.("click", controller.next);
    control("replay")?.addEventListener?.("click", controller.replay);
    phaseButtons.forEach((button) => {
      button.addEventListener?.("click", () => {
        const phase = Number(button.getAttribute?.("data-walk-phase"));
        const target = story.steps.findIndex((step) => step.phase === phase);
        if (target < 0) return;
        setPlaying(false);
        go(target);
      });
    });

    renderControls();
    go(0);
    return controller;
  }

  function setupRerenderVisuals(root = typeof document === "undefined" ? null : document, options = {}) {
    if (!root) return [];
    const figures = root.matches?.(figureSelector) ? [root] : Array.from(root.querySelectorAll?.(figureSelector) ?? []);
    return figures.map((figure) => setupStory(figure, options)).filter(Boolean);
  }

  return { STORIES, initialState, applyStep, stateAt, namesOf, setupStory, setupRerenderVisuals };
})();

if (typeof window !== "undefined") {
  window.RerenderVisual = RerenderVisual;
}

if (typeof document !== "undefined") {
  const autoInitialize = () => {
    RerenderVisual.setupRerenderVisuals(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialize, { once: true });
  } else {
    autoInitialize();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = RerenderVisual;
}
