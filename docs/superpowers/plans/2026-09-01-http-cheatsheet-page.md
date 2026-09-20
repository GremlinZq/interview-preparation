# HTTP/HTTPS Cheat Sheet Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать и открыть адаптивную локальную страницу шпаргалок с боковой навигацией и первым материалом по HTTP/HTTPS.

**Architecture:** Статический интерфейс состоит из семантического HTML, отдельной таблицы стилей и небольшого скрипта прокрутки. Python-тест разбирает HTML и проверяет контракт страницы: обязательные секции, корректные якоря и подключённые локальные ресурсы.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python 3 `unittest`/`html.parser`.

**Spec:** `docs/superpowers/specs/2026-09-01-http-cheatsheet-page-design.md`

## Global Constraints

- Интерфейс и учебный материал написаны на русском языке.
- Никаких сборщиков, пакетов и сетевых зависимостей.
- На широком экране навигация закреплена слева; на узком превращается в верхнюю горизонтальную панель.
- Первый раздел охватывает базовую модель HTTP/HTTPS и оставляет понятные точки расширения.

---

### Task 1: Контракт и интерфейс страницы

**Files:**
- Create: `tests/test_page.py`
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`

**Interfaces:**
- Consumes: локальные файлы из корня проекта.
- Produces: якоря `overview`, `request-response`, `http-vs-https`, `roadmap`; навигационные ссылки на каждый якорь; скрипт подсветки активной ссылки.

- [ ] **Step 1: Write the failing contract test**

```python
class PageContractTest(unittest.TestCase):
    def test_required_sections_and_navigation_targets_exist(self):
        required = {"overview", "request-response", "http-vs-https", "roadmap"}
        self.assertTrue(required.issubset(self.parser.ids))
        self.assertTrue({f"#{item}" for item in required}.issubset(self.parser.nav_hrefs))
```

- [ ] **Step 2: Run the test and confirm the page is absent**

Run: `python3 -m unittest tests/test_page.py -v`

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Implement the semantic page**

Create `index.html` with `aside`, `nav`, `main`, four named sections, comparison cards, request/response examples, topic roadmap, and local links to `styles.css` and `script.js`.

```html
<a class="nav-link" href="#overview">Коротко о главном</a>
<section id="overview" data-section>...</section>
```

- [ ] **Step 4: Add the responsive visual system**

Create `styles.css` with a two-column CSS Grid, sticky dark navigation, warm content canvas, amber accents, responsive breakpoint at `860px`, visible focus styles, and reduced-motion handling.

```css
.app-shell { display: grid; grid-template-columns: minmax(260px, 320px) 1fr; }
@media (max-width: 860px) { .app-shell { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Add active-section behavior**

Create `script.js` using `IntersectionObserver` to set `aria-current="location"` on the matching navigation link, with a safe fallback when the API is unavailable.

```js
const links = new Map([...document.querySelectorAll('.nav-link')]
  .map((link) => [link.hash.slice(1), link]));
```

- [ ] **Step 6: Run automated checks**

Run: `python3 -m unittest tests/test_page.py -v`

Expected: all tests PASS.

Run: `node --check script.js`

Expected: exit code 0 with no syntax errors.

- [ ] **Step 7: Serve and inspect**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: `http://127.0.0.1:4173/` responds with status 200 and displays the page. Open that URL in the Codex browser.

> Примечание: папка пока не является Git-репозиторием, поэтому план не включает коммит без отдельного согласования.
