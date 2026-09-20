const navigationLinks = [...document.querySelectorAll("[data-tab]")];
const sections = [...document.querySelectorAll("[data-tab-panel]")];
const tabList = document.querySelector("[data-tablist]");
const tabTopics = tabList ? [...tabList.querySelectorAll(".nav-topic")] : [];
const contentTabLinks = [...document.querySelectorAll("[data-tab-link]")];
const sidebarSearch = document.querySelector("[data-sidebar-search]");
const searchInput = sidebarSearch?.querySelector("[data-search-input]");
const searchClearButton = sidebarSearch?.querySelector("[data-search-clear]");
const searchPopover = sidebarSearch?.querySelector("[data-search-popover]");
const searchStatus = sidebarSearch?.querySelector("[data-search-status]");
const searchResultsList = sidebarSearch?.querySelector("[data-search-results]");
const searchUtils = window.StudySearch;
const navigationUtils = window.StudyNavigation;
const desktopTabsQuery = window.matchMedia("(min-width: 53.76rem)");
const linksBySection = new Map(
  navigationLinks.map((link) => [link.hash.slice(1), link]),
);
const panelsBySection = new Map(
  sections.map((section) => [section.id, section]),
);

function collectSectionSearchText(section) {
  if (!searchUtils) return section.textContent ?? "";

  const textParts = [];
  const walker = document.createTreeWalker(
    section,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        const isIgnored = parent?.closest("script, style, noscript, [aria-hidden='true']");
        return !isIgnored && node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  while (walker.nextNode()) {
    textParts.push(walker.currentNode.textContent);
  }

  return searchUtils.joinSearchTextParts(textParts);
}

const searchRecords = sections.map((section) => ({
  sectionId: section.id,
  title: linksBySection.get(section.id)?.textContent ?? "",
  text: collectSectionSearchText(section),
}));

let currentSearchResults = [];
let activeSearchResultIndex = -1;
let searchHighlightTimer = null;

function getRequestedSection(...fallback) {
  return navigationUtils.resolveRequestedSection(
    window.location.hash,
    panelsBySection.keys(),
    ...fallback,
  );
}

function setActiveNavigation(sectionId) {
  const tabsEnabled = desktopTabsQuery.matches;
  const activeLink = linksBySection.get(sectionId);

  navigationLinks.forEach((link) => {
    const isCurrent = link === linksBySection.get(sectionId);
    link.classList.toggle("is-active", isCurrent);

    if (tabsEnabled) {
      link.setAttribute("aria-selected", isCurrent.toString());
      link.setAttribute("tabindex", isCurrent ? "0" : "-1");
      link.removeAttribute("aria-current");
    } else {
      link.removeAttribute("aria-selected");
      link.removeAttribute("tabindex");

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  });

  if (tabsEnabled && activeLink && tabList) {
    window.requestAnimationFrame(() => {
      const linkRect = activeLink.getBoundingClientRect();
      const menuRect = tabList.getBoundingClientRect();

      if (navigationUtils.shouldRevealNavigationLink(linkRect, menuRect)) {
        activeLink.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
  }
}

function activateDesktopPanel(sectionId, options = {}) {
  const activeSectionId = navigationUtils.resolveRequestedSection(
    `#${sectionId ?? ""}`,
    panelsBySection.keys(),
  );
  const { focusTab = false, scrollToTop = false } = options;

  sections.forEach((section) => {
    const isCurrent = section.id === activeSectionId;
    section.classList.toggle("is-active-panel", isCurrent);
    section.hidden = !isCurrent;
    section.setAttribute("tabindex", isCurrent ? "0" : "-1");
  });

  setActiveNavigation(activeSectionId);

  if (focusTab) {
    linksBySection.get(activeSectionId)?.focus();
  }

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

function updateSectionHash(sectionId, historyMode) {
  const nextHash = `#${sectionId}`;
  if (window.location.hash === nextHash) return;

  const method = historyMode === "replace" ? "replaceState" : "pushState";
  window.history[method](null, "", nextHash);
}

function openDesktopPanel(sectionId, options = {}) {
  const {
    historyMode = "push",
    focusTab = false,
    scrollToTop = true,
  } = options;
  clearSearchHighlight();
  updateSectionHash(sectionId, historyMode);
  activateDesktopPanel(sectionId, { focusTab, scrollToTop });
}

navigationLinks.forEach((link, currentIndex) => {
  link.addEventListener("click", (event) => {
    if (!desktopTabsQuery.matches) {
      setActiveNavigation(link.hash.slice(1));
      return;
    }

    event.preventDefault();
    openDesktopPanel(link.hash.slice(1));
  });

  link.addEventListener("keydown", (event) => {
    if (!desktopTabsQuery.matches) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % navigationLinks.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + navigationLinks.length) % navigationLinks.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = navigationLinks.length - 1;
    } else if (event.key === " ") {
      event.preventDefault();
      openDesktopPanel(link.hash.slice(1));
      return;
    } else {
      return;
    }

    event.preventDefault();
    const nextLink = navigationLinks[nextIndex];
    openDesktopPanel(nextLink.hash.slice(1), {
      historyMode: "replace",
      focusTab: true,
    });
  });
});

contentTabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.hash.slice(1);
    if (!desktopTabsQuery.matches || !panelsBySection.has(sectionId)) return;

    event.preventDefault();
    openDesktopPanel(sectionId, { focusTab: true });
  });
});

function clearSearchHighlight() {
  if (searchHighlightTimer !== null) {
    window.clearTimeout(searchHighlightTimer);
    searchHighlightTimer = null;
  }

  document.querySelectorAll(".is-search-match").forEach((element) => {
    element.classList.remove("is-search-match");
  });
}

function closeSearchResults() {
  currentSearchResults = [];
  activeSearchResultIndex = -1;
  searchPopover?.setAttribute("hidden", "");
  searchResultsList?.setAttribute("hidden", "");
  searchInput?.setAttribute("aria-expanded", "false");
  searchInput?.removeAttribute("aria-activedescendant");
  searchResultsList?.replaceChildren();
}

function clearSidebarSearch({ focusInput = false } = {}) {
  if (!searchInput) return;

  searchInput.value = "";
  searchClearButton?.setAttribute("hidden", "");
  if (searchStatus) searchStatus.textContent = "";
  closeSearchResults();
  clearSearchHighlight();

  if (focusInput && desktopTabsQuery.matches) {
    searchInput.focus();
  }
}

function appendSearchText(container, text, query) {
  const parts = searchUtils.splitSearchMatch(text, query);
  container.append(document.createTextNode(parts.before));

  if (parts.match) {
    const mark = document.createElement("mark");
    mark.textContent = parts.match;
    container.append(mark);
  }

  container.append(document.createTextNode(parts.after));
}

function setActiveSearchResult(index) {
  if (!searchInput || currentSearchResults.length === 0) return;

  const resultElements = [...searchResultsList.querySelectorAll("[data-search-result]")];
  const normalizedIndex = (index + resultElements.length) % resultElements.length;
  activeSearchResultIndex = normalizedIndex;

  resultElements.forEach((element, resultIndex) => {
    element.setAttribute(
      "aria-selected",
      (resultIndex === normalizedIndex).toString(),
    );
  });

  const activeResult = resultElements[normalizedIndex];
  searchInput.setAttribute("aria-activedescendant", activeResult.id);
  activeResult.scrollIntoView({ block: "nearest" });
}

function renderSearchResults(results, query) {
  if (!searchPopover || !searchResultsList || !searchStatus || !searchInput) return;

  currentSearchResults = results;
  activeSearchResultIndex = -1;
  searchResultsList.replaceChildren();
  searchPopover.removeAttribute("hidden");
  const popupState = searchUtils.getSearchPopupState(results.length);
  searchInput.setAttribute("aria-expanded", popupState.expanded.toString());
  searchInput.removeAttribute("aria-activedescendant");

  if (results.length === 0) {
    searchStatus.textContent = "Ничего не найдено. Попробуйте «TLS» или «Cookie».";
    searchResultsList.toggleAttribute("hidden", popupState.resultsHidden);
    return;
  }

  searchStatus.textContent = `Найдено разделов: ${results.length}`;
  searchResultsList.removeAttribute("hidden");

  results.forEach((result, index) => {
    const item = document.createElement("li");
    item.setAttribute("role", "presentation");

    const button = document.createElement("button");
    const optionState = searchUtils.getSearchOptionState(index);
    button.id = optionState.id;
    button.type = "button";
    button.tabIndex = optionState.tabIndex;
    button.setAttribute("role", optionState.role);
    button.setAttribute("aria-selected", "false");
    button.setAttribute("data-search-result", "");
    button.setAttribute("data-search-section", result.sectionId);

    const title = document.createElement("strong");
    title.setAttribute("data-search-result-section", "");
    appendSearchText(title, result.title, query);

    const snippet = document.createElement("span");
    snippet.setAttribute("data-search-result-snippet", "");
    appendSearchText(snippet, result.snippet, query);

    button.append(title, snippet);
    button.addEventListener("mouseenter", () => setActiveSearchResult(index));
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => activateSearchResult(result));
    item.append(button);
    searchResultsList.append(item);
  });
}

function updateSidebarSearch() {
  if (!searchInput || !searchUtils || !desktopTabsQuery.matches) return;

  const query = searchInput.value;
  searchClearButton?.toggleAttribute("hidden", query.length === 0);

  if (searchUtils.normalizeSearchText(query).length < 2) {
    if (searchStatus) searchStatus.textContent = "";
    closeSearchResults();
    return;
  }

  renderSearchResults(searchUtils.findSearchResults(searchRecords, query, 7), query);
}

function findSearchTarget(panel, query) {
  const normalizedQuery = searchUtils.normalizeSearchText(query);
  const selector = "article, h1, h2, h3, h4, p, li, dt, dd, th, td, figcaption, summary";
  const textParts = [];
  const walker = document.createTreeWalker(
    panel,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        const isIgnored = parent?.closest("script, style, noscript, [aria-hidden='true']");
        return !isIgnored && node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    textParts.push({
      text: walker.currentNode.textContent,
      target: parent.closest(selector) ?? parent,
    });
  }

  const exactPart = searchUtils.findFirstSearchPart(textParts, query);
  if (exactPart?.target) return exactPart.target;

  const matches = [...panel.querySelectorAll(selector)].filter((element) =>
    searchUtils.normalizeSearchText(element.textContent).includes(normalizedQuery),
  );

  return matches.find((candidate) =>
    !matches.some((other) => other !== candidate && candidate.contains(other)),
  ) ?? matches[0] ?? panel.querySelector("h1, h2") ?? panel;
}

function openContainingDetails(target, panel) {
  const ancestors = [];
  let details = target.closest("details");

  while (details && panel.contains(details)) {
    ancestors.unshift(details);
    details = details.parentElement?.closest("details") ?? null;
  }

  ancestors.forEach((element) => {
    element.open = true;
  });
}

function revealSearchTarget(panel, query) {
  const target = findSearchTarget(panel, query);
  openContainingDetails(target, panel);

  window.requestAnimationFrame(() => {
    target.classList.add("is-search-match");
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });

    searchHighlightTimer = window.setTimeout(() => {
      target.classList.remove("is-search-match");
      searchHighlightTimer = null;
    }, 3600);
  });
}

function activateSearchResult(result) {
  if (!searchInput || !desktopTabsQuery.matches) return;

  const query = searchInput.value;
  openDesktopPanel(result.sectionId, { scrollToTop: false });
  closeSearchResults();

  const panel = panelsBySection.get(result.sectionId);
  if (panel) revealSearchTarget(panel, query);
}

if (
  sidebarSearch
  && searchInput
  && searchClearButton
  && searchPopover
  && searchStatus
  && searchResultsList
  && searchUtils
) {
  searchInput.addEventListener("input", updateSidebarSearch);
  searchInput.addEventListener("search", updateSidebarSearch);
  searchInput.addEventListener("focus", updateSidebarSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && currentSearchResults.length > 0) {
      event.preventDefault();
      setActiveSearchResult(activeSearchResultIndex + 1);
    } else if (event.key === "ArrowUp" && currentSearchResults.length > 0) {
      event.preventDefault();
      setActiveSearchResult(activeSearchResultIndex - 1);
    } else if (event.key === "Enter" && currentSearchResults.length > 0) {
      event.preventDefault();
      const resultIndex = activeSearchResultIndex < 0 ? 0 : activeSearchResultIndex;
      activateSearchResult(currentSearchResults[resultIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      clearSidebarSearch({ focusInput: true });
    }
  });

  searchClearButton.addEventListener("click", () => {
    clearSidebarSearch({ focusInput: true });
  });

  document.addEventListener("click", (event) => {
    if (!sidebarSearch.contains(event.target)) closeSearchResults();
  });

  sidebarSearch.addEventListener("focusout", (event) => {
    const nextFocusIsInside = event.relatedTarget instanceof Node
      && sidebarSearch.contains(event.relatedTarget);
    if (searchUtils.shouldCloseSearchOnFocusOut(nextFocusIsInside)) {
      closeSearchResults();
    }
  });
}

function updateActiveSectionFromScroll() {
  if (desktopTabsQuery.matches) return;

  const readingLine = window.innerWidth <= 860 ? 150 : window.innerHeight * 0.22;
  const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  let activeSection = sections[0];

  if (isAtPageEnd) {
    activeSection = sections.at(-1);
  } else {
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= readingLine) {
        activeSection = section;
      }
    });
  }

  if (activeSection) {
    setActiveNavigation(activeSection.id);
  }
}

let scrollUpdatePending = false;
function scheduleNavigationUpdate() {
  if (scrollUpdatePending) return;

  scrollUpdatePending = true;
  window.requestAnimationFrame(() => {
    updateActiveSectionFromScroll();
    scrollUpdatePending = false;
  });
}

function configureLayout() {
  const tabsEnabled = desktopTabsQuery.matches;
  document.documentElement.classList.toggle("tabs-enabled", tabsEnabled);

  if (tabsEnabled) {
    tabList?.setAttribute("role", "tablist");
    tabList?.setAttribute("aria-orientation", "vertical");
    tabTopics.forEach((topic) => topic.setAttribute("role", "presentation"));
    navigationLinks.forEach((link) => link.setAttribute("role", "tab"));
    sections.forEach((section) => section.setAttribute("role", "tabpanel"));
    activateDesktopPanel(getRequestedSection(), { scrollToTop: true });
  } else {
    clearSidebarSearch();
    tabList?.removeAttribute("role");
    tabList?.removeAttribute("aria-orientation");
    tabTopics.forEach((topic) => topic.removeAttribute("role"));
    navigationLinks.forEach((link) => {
      link.removeAttribute("role");
      link.removeAttribute("aria-selected");
      link.removeAttribute("tabindex");
    });
    sections.forEach((section) => {
      section.hidden = false;
      section.removeAttribute("role");
      section.removeAttribute("tabindex");
    });
    updateActiveSectionFromScroll();
  }
}

function syncPanelWithHistory() {
  if (desktopTabsQuery.matches) {
    const requestedSection = getRequestedSection(null);
    if (requestedSection) {
      activateDesktopPanel(requestedSection, { scrollToTop: true });
    }
  }
}

window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleNavigationUpdate);
window.addEventListener("hashchange", syncPanelWithHistory);
window.addEventListener("popstate", syncPanelWithHistory);
window.addEventListener("load", syncPanelWithHistory);

if (typeof desktopTabsQuery.addEventListener === "function") {
  desktopTabsQuery.addEventListener("change", configureLayout);
} else {
  desktopTabsQuery.addListener(configureLayout);
}

configureLayout();
scheduleNavigationUpdate();

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear().toString();
}
