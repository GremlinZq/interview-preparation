const EventLoopVisual = (() => {
  const comparisonSelector = "[data-loop-visual-comparison]";
  const diagramSelector = "svg[data-loop-diagram-svg]";
  const pauseSelector = '[data-loop-control="pause"]';
  const replaySelector = '[data-loop-control="replay"]';
  const controllers = new WeakMap();

  function findComparison(root) {
    if (!root) return null;
    if (root.matches?.(comparisonSelector)) return root;
    return root.querySelector?.(comparisonSelector) ?? null;
  }

  function getFrameScheduler(comparison, injectedScheduler) {
    if (typeof injectedScheduler === "function") return injectedScheduler;

    const view = comparison.ownerDocument?.defaultView
      ?? (typeof window === "undefined" ? null : window);
    if (typeof view?.requestAnimationFrame === "function") {
      return view.requestAnimationFrame.bind(view);
    }

    return (callback) => setTimeout(callback, 16);
  }

  function setupLoopVisualComparison(
    root = typeof document === "undefined" ? null : document,
    options = {},
  ) {
    const comparison = findComparison(root);
    if (!comparison) return null;
    const existingController = controllers.get(comparison);
    if (existingController) return existingController;

    const diagrams = Array.from(
      comparison.querySelectorAll?.(diagramSelector) ?? [],
    );
    const pauseButton = comparison.querySelector?.(pauseSelector);
    const replayButton = comparison.querySelector?.(replaySelector);
    const pauseLabel = comparison.querySelector?.("[data-loop-control-label]");
    const pauseIcon = comparison.querySelector?.("[data-loop-control-icon]");
    const requestFrame = getFrameScheduler(
      comparison,
      options.requestAnimationFrame,
    );
    let isPaused = comparison.classList.contains("is-paused");
    let replayRevision = 0;

    function renderPauseState() {
      comparison.classList.toggle("is-paused", isPaused);
      pauseButton?.setAttribute("aria-pressed", String(isPaused));
      if (pauseLabel) {
        pauseLabel.textContent = isPaused ? "Продолжить" : "Пауза";
      }
      if (pauseIcon) {
        pauseIcon.textContent = isPaused ? "▶" : "Ⅱ";
      }
    }

    function togglePause() {
      isPaused = !isPaused;
      const method = isPaused ? "pauseAnimations" : "unpauseAnimations";

      diagrams.forEach((diagram) => diagram[method]?.());
      renderPauseState();
    }

    function replay() {
      diagrams.forEach((diagram) => diagram.setCurrentTime?.(0));
      isPaused = false;
      diagrams.forEach((diagram) => diagram.unpauseAnimations?.());
      renderPauseState();
      replayRevision += 1;
      const currentRevision = replayRevision;
      comparison.classList.add("is-replaying");
      requestFrame(() => {
        requestFrame(() => {
          if (currentRevision === replayRevision) {
            comparison.classList.remove("is-replaying");
          }
        });
      });
    }

    renderPauseState();
    pauseButton?.addEventListener("click", togglePause);
    replayButton?.addEventListener("click", replay);

    const controller = { replay, togglePause };
    controllers.set(comparison, controller);

    const panel = comparison.closest?.("[data-tab-panel]");
    const view = comparison.ownerDocument?.defaultView
      ?? (typeof window === "undefined" ? null : window);
    const MutationObserverClass = options.MutationObserver
      ?? view?.MutationObserver;

    if (panel && typeof MutationObserverClass === "function") {
      const visibilityObserver = new MutationObserverClass(() => {
        if (panel.hidden) {
          diagrams.forEach((diagram) => diagram.pauseAnimations?.());
          return;
        }

        replay();
      });
      visibilityObserver.observe(panel, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
      controller.disconnect = () => visibilityObserver.disconnect?.();

      if (panel.hidden) {
        diagrams.forEach((diagram) => diagram.pauseAnimations?.());
      }
    }

    return controller;
  }

  return { setupLoopVisualComparison };
})();

if (typeof window !== "undefined") {
  window.EventLoopVisual = EventLoopVisual;
}

if (typeof document !== "undefined") {
  const autoInitialize = () => {
    EventLoopVisual.setupLoopVisualComparison(document);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialize, { once: true });
  } else {
    autoInitialize();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = EventLoopVisual;
}
