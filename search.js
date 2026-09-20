const StudySearch = (() => {
  function compactSearchText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function normalizeSearchText(value) {
    return compactSearchText(value)
      .toLocaleLowerCase("ru-RU")
      .replaceAll("ё", "е");
  }

  function joinSearchTextParts(parts) {
    return compactSearchText(
      parts
        .map((part) => compactSearchText(part))
        .filter(Boolean)
        .join(" "),
    );
  }

  function findFirstSearchPart(parts, query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return null;

    return parts.find((part) =>
      normalizeSearchText(part.text).includes(normalizedQuery),
    ) ?? null;
  }

  function getSearchOptionState(index) {
    return {
      id: `sidebar-search-option-${index}`,
      role: "option",
      tabIndex: -1,
    };
  }

  function getSearchPopupState(resultCount) {
    const hasResults = resultCount > 0;
    return {
      expanded: hasResults,
      resultsHidden: !hasResults,
    };
  }

  function shouldCloseSearchOnFocusOut(nextFocusIsInside) {
    return !nextFocusIsInside;
  }

  function createSearchSnippet(text, query, maxLength = 112) {
    const compactText = compactSearchText(text);
    if (!compactText || maxLength <= 0) return "";

    const normalizedText = normalizeSearchText(compactText);
    const normalizedQuery = normalizeSearchText(query);
    const matchIndex = normalizedQuery
      ? normalizedText.indexOf(normalizedQuery)
      : -1;

    if (compactText.length <= maxLength) return compactText;

    const idealStart = matchIndex < 0
      ? 0
      : matchIndex - Math.floor((maxLength - normalizedQuery.length) / 2);
    const start = Math.max(0, Math.min(idealStart, compactText.length - maxLength));
    const end = Math.min(compactText.length, start + maxLength);
    const body = compactText.slice(start, end).trim();

    return `${start > 0 ? "…" : ""}${body}${end < compactText.length ? "…" : ""}`;
  }

  function splitSearchMatch(text, query) {
    const compactText = compactSearchText(text);
    const normalizedText = normalizeSearchText(compactText);
    const normalizedQuery = normalizeSearchText(query);
    const matchIndex = normalizedQuery
      ? normalizedText.indexOf(normalizedQuery)
      : -1;

    if (matchIndex < 0) {
      return { before: compactText, match: "", after: "" };
    }

    return {
      before: compactText.slice(0, matchIndex),
      match: compactText.slice(matchIndex, matchIndex + normalizedQuery.length),
      after: compactText.slice(matchIndex + normalizedQuery.length),
    };
  }

  function findSearchResults(records, query, limit = 7) {
    const normalizedQuery = normalizeSearchText(query);
    if (normalizedQuery.length < 2 || limit <= 0) return [];

    return records
      .map((record, order) => {
        const title = compactSearchText(record.title);
        const text = compactSearchText(record.text);
        const normalizedTitle = normalizeSearchText(title);
        const normalizedText = normalizeSearchText(text);
        const titleIndex = normalizedTitle.indexOf(normalizedQuery);
        const contentIndex = normalizedText.indexOf(normalizedQuery);

        if (titleIndex < 0 && contentIndex < 0) return null;

        let score = 100;
        let matchSource = "content";
        if (titleIndex >= 0) {
          matchSource = "title";
          score = normalizedTitle === normalizedQuery
            ? 400
            : titleIndex === 0
              ? 350
              : 300;
        }

        return {
          sectionId: record.sectionId,
          title,
          snippet: createSearchSnippet(text, contentIndex >= 0 ? query : ""),
          matchSource,
          score,
          order,
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || left.order - right.order)
      .slice(0, limit)
      .map(({ score, order, ...result }) => result);
  }

  return {
    createSearchSnippet,
    findFirstSearchPart,
    findSearchResults,
    getSearchOptionState,
    getSearchPopupState,
    joinSearchTextParts,
    normalizeSearchText,
    shouldCloseSearchOnFocusOut,
    splitSearchMatch,
  };
})();

if (typeof window !== "undefined") {
  window.StudySearch = StudySearch;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = StudySearch;
}
