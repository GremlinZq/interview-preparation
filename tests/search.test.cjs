const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const searchModulePath = path.join(__dirname, "..", "search.js");

function loadSearchModule() {
  assert.ok(existsSync(searchModulePath), "search.js must exist before its behavior can be tested");
  return require(searchModulePath);
}

test("findSearchResults prioritizes a matching section title and still searches panel text", () => {
  const { findSearchResults } = loadSearchModule();
  const records = [
    {
      sectionId: "browser-rendering",
      title: "Как браузер рисует страницу",
      text: "Перед запросом TLS защищает HTTPS-соединение.",
    },
    {
      sectionId: "tls",
      title: "TLS подробно",
      text: "Transport Layer Security шифрует данные.",
    },
    {
      sectionId: "dns-request",
      title: "DNS и путь запроса",
      text: "DNS находит IP-адрес сайта.",
    },
  ];

  const results = findSearchResults(records, "  tls  ", 6);

  assert.deepEqual(
    results.map(({ sectionId }) => sectionId),
    ["tls", "browser-rendering"],
  );
  assert.equal(results[0].matchSource, "title");
  assert.equal(results[1].matchSource, "content");
  assert.match(results[1].snippet, /TLS защищает HTTPS/);
});

test("findSearchResults handles Russian case, whitespace and yo without changing the visible text", () => {
  const { findSearchResults, normalizeSearchText, splitSearchMatch } = loadSearchModule();
  const records = [
    {
      sectionId: "headers-cache",
      title: "Заголовки и кеш",
      text: "Защищённое   соединение сохраняет исходное написание.",
    },
  ];

  assert.equal(normalizeSearchText("  ВСЁ \n О TLS  "), "все о tls");

  const [result] = findSearchResults(records, "ЗАЩИЩЕННОЕ СОЕДИНЕНИЕ", 6);
  assert.equal(result.sectionId, "headers-cache");
  assert.match(result.snippet, /Защищённое соединение/);
  assert.deepEqual(splitSearchMatch(result.snippet, "защищенное соединение"), {
    before: "",
    match: "Защищённое соединение",
    after: " сохраняет исходное написание.",
  });
});

test("findSearchResults stays compact and ignores queries shorter than two characters", () => {
  const { findSearchResults } = loadSearchModule();
  const records = [
    { sectionId: "one", title: "HTTP один", text: "HTTP" },
    { sectionId: "two", title: "HTTP два", text: "HTTP" },
    { sectionId: "three", title: "HTTP три", text: "HTTP" },
  ];

  assert.deepEqual(findSearchResults(records, "h", 2), []);
  assert.deepEqual(
    findSearchResults(records, "http", 2).map(({ sectionId }) => sectionId),
    ["one", "two"],
  );
});

test("joinSearchTextParts keeps neighboring labels readable in result snippets", () => {
  const { joinSearchTextParts } = loadSearchModule();

  assert.equal(
    joinSearchTextParts(["AAAA", "IPv6-адрес", "Более новый формат IP"]),
    "AAAA IPv6-адрес Более новый формат IP",
  );
});

test("findFirstSearchPart returns the content block that owns an exact text-node match", () => {
  const { findFirstSearchPart } = loadSearchModule();
  const parts = [
    { text: "AAAA", target: "dns-record-aaaa" },
    { text: "IPv6-адрес", target: "dns-record-aaaa" },
    { text: "Более новый формат IP", target: "dns-record-aaaa" },
  ];

  assert.equal(
    findFirstSearchPart(parts, "ipv6-АДРЕС")?.target,
    "dns-record-aaaa",
  );
});

test("search presentation keeps virtual options out of Tab order and reports an empty popup as closed", () => {
  const { getSearchOptionState, getSearchPopupState } = loadSearchModule();

  assert.deepEqual(getSearchOptionState(2), {
    id: "sidebar-search-option-2",
    role: "option",
    tabIndex: -1,
  });
  assert.deepEqual(getSearchPopupState(0), {
    expanded: false,
    resultsHidden: true,
  });
  assert.deepEqual(getSearchPopupState(3), {
    expanded: true,
    resultsHidden: false,
  });
});

test("search focus policy closes results only after focus leaves the whole search control", () => {
  const { shouldCloseSearchOnFocusOut } = loadSearchModule();

  assert.equal(shouldCloseSearchOnFocusOut(true), false);
  assert.equal(shouldCloseSearchOnFocusOut(false), true);
});

test("actual study page is searchable by every realtime communication method", () => {
  const { findSearchResults } = loadSearchModule();
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const panelStart = html.indexOf('<section id="realtime-updates"');
  const panelEnd = html.indexOf('<section id="dns-request"', panelStart);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);

  const titleMatch = html.match(
    /<a\b[^>]*href="#realtime-updates"[^>]*>([\s\S]*?)<\/a>/i,
  );
  assert.ok(titleMatch);

  const stripMarkup = (value) =>
    value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const record = {
    sectionId: "realtime-updates",
    title: stripMarkup(titleMatch[1]),
    text: stripMarkup(html.slice(panelStart, panelEnd)),
  };

  for (const query of ["polling", "long polling", "sse", "websocket", "handshake", "рукопожатие"]) {
    assert.equal(
      findSearchResults([record], query, 7)[0]?.sectionId,
      "realtime-updates",
      `Expected the actual page to be searchable by ${query}`,
    );
  }
});
