const StudyNavigation = (() => {
  function resolveRequestedSection(hash, sectionIds, fallback) {
    const availableSections = [...sectionIds];
    const requestedSection = String(hash ?? "").replace(/^#/, "");

    if (availableSections.includes(requestedSection)) {
      return requestedSection;
    }

    if (arguments.length >= 3) {
      return fallback;
    }

    return availableSections[0] ?? null;
  }

  function shouldRevealNavigationLink(linkRect, menuRect) {
    return linkRect.top < menuRect.top || linkRect.bottom > menuRect.bottom;
  }

  return { resolveRequestedSection, shouldRevealNavigationLink };
})();

if (typeof window !== "undefined") {
  window.StudyNavigation = StudyNavigation;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = StudyNavigation;
}
