const RealtimeVisual = (() => {
  const diagramSelector = "[data-realtime-diagram]";
  const controllers = new WeakMap();

  function findDiagram(root) {
    if (!root) return null;
    if (root.matches?.(diagramSelector)) return root;
    return root.querySelector?.(diagramSelector) ?? null;
  }

  function setupRealtimeVisual(
    root = typeof document === "undefined" ? null : document,
    options = {},
  ) {
    const diagram = findDiagram(root);
    if (!diagram) return null;

    const existingController = controllers.get(diagram);
    if (existingController) return existingController;

    const view = diagram.ownerDocument?.defaultView
      ?? (typeof window === "undefined" ? null : window);
    const hasInjectedObserver = Object.prototype.hasOwnProperty.call(
      options,
      "IntersectionObserver",
    );
    const IntersectionObserverClass = hasInjectedObserver
      ? options.IntersectionObserver
      : view?.IntersectionObserver;
    const threshold = options.threshold ?? 0.3;
    let observer = null;
    let hasStarted = diagram.classList.contains("is-in-view");
    let removeFallbackListeners = () => {};

    function start() {
      if (hasStarted) return;
      hasStarted = true;
      diagram.classList.add("is-in-view");
      observer?.unobserve?.(diagram);
      removeFallbackListeners();
    }

    const controller = {
      start,
      disconnect() {
        observer?.disconnect?.();
        removeFallbackListeners();
      },
    };
    controllers.set(diagram, controller);

    if (typeof IntersectionObserverClass !== "function") {
      const requestFrame = typeof view?.requestAnimationFrame === "function"
        ? view.requestAnimationFrame.bind(view)
        : (callback) => setTimeout(callback, 16);
      let framePending = false;

      const checkVisibility = () => {
        framePending = false;
        const rect = diagram.getBoundingClientRect?.();
        const viewportHeight = view?.innerHeight ?? 0;
        if (!rect || viewportHeight <= 0 || rect.height <= 0) return;

        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
        );
        if (visibleHeight / rect.height >= threshold) start();
      };
      const scheduleVisibilityCheck = () => {
        if (hasStarted || framePending) return;
        framePending = true;
        requestFrame(checkVisibility);
      };

      view?.addEventListener?.("scroll", scheduleVisibilityCheck, { passive: true });
      view?.addEventListener?.("resize", scheduleVisibilityCheck);
      removeFallbackListeners = () => {
        view?.removeEventListener?.("scroll", scheduleVisibilityCheck);
        view?.removeEventListener?.("resize", scheduleVisibilityCheck);
      };
      scheduleVisibilityCheck();
      return controller;
    }

    observer = new IntersectionObserverClass((entries) => {
      const visibleEntry = entries.find((entry) => entry.target === diagram);
      if (
        visibleEntry?.isIntersecting
        && visibleEntry.intersectionRatio >= threshold
      ) {
        start();
      }
    }, { threshold });
    observer.observe(diagram);

    return controller;
  }

  return { setupRealtimeVisual };
})();

if (typeof window !== "undefined") {
  window.RealtimeVisual = RealtimeVisual;
}

if (typeof document !== "undefined") {
  const autoInitialize = () => {
    RealtimeVisual.setupRealtimeVisual(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialize, { once: true });
  } else {
    autoInitialize();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = RealtimeVisual;
}
