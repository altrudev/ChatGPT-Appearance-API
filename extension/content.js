(() => {
  "use strict";

  const INSTANCE_KEY = "__SAL_APPEARANCE_ADAPTER_V011__";
  const STORAGE_KEY = "salSettings";
  const policy = globalThis.SALPolicy;
  if (!policy) return;

  // The popup may inject this adapter into a ChatGPT tab that was already open
  // when the extension was installed. Re-injection must therefore be safe.
  if (globalThis[INSTANCE_KEY]) {
    globalThis[INSTANCE_KEY].load();
    return;
  }

  const root = document.documentElement;
  const originalHostTokens = new Map();
  const hostSurfaceTokens = Object.freeze({
    "--main-surface-primary": "var(--sal-main-surface)",
    "--sidebar-surface-primary": "var(--sal-sidebar-surface)",
    "--sidebar-surface-secondary": "var(--sal-sidebar-surface)"
  });

  function rememberHostToken(name) {
    if (originalHostTokens.has(name)) return;
    originalHostTokens.set(name, {
      value: root.style.getPropertyValue(name),
      priority: root.style.getPropertyPriority(name)
    });
  }

  function applyHostSurfaceTokens() {
    for (const [name, value] of Object.entries(hostSurfaceTokens)) {
      rememberHostToken(name);
      root.style.setProperty(name, value, "important");
    }
  }

  function restoreHostSurfaceTokens() {
    for (const [name, previous] of originalHostTokens.entries()) {
      if (previous.value) root.style.setProperty(name, previous.value, previous.priority);
      else root.style.removeProperty(name);
    }
    originalHostTokens.clear();
  }

  function clearSalVariables() {
    for (const key of Object.keys(policy.cssBackgroundValues(policy.DEFAULTS))) {
      root.style.removeProperty(key);
    }
  }

  function applySettings(raw) {
    const settings = policy.sanitizeSettings(raw);

    if (!settings.enabled) {
      root.removeAttribute("data-sal-enabled");
      clearSalVariables();
      restoreHostSurfaceTokens();
      return;
    }

    const variables = policy.cssBackgroundValues(settings);
    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }

    applyHostSurfaceTokens();
    root.setAttribute("data-sal-enabled", "true");
  }

  function load() {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      applySettings(result[STORAGE_KEY] || policy.DEFAULTS);
    });
  }

  const storageListener = (changes, area) => {
    if (area !== "local" || !changes[STORAGE_KEY]) return;
    applySettings(changes[STORAGE_KEY].newValue || policy.DEFAULTS);
  };

  chrome.storage.onChanged.addListener(storageListener);

  globalThis[INSTANCE_KEY] = Object.freeze({ load });
  load();
})();
