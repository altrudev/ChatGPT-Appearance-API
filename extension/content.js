(() => {
  "use strict";

  const STORAGE_KEY = "salSettings";
  const policy = globalThis.SALPolicy;
  if (!policy) return;

  function applySettings(raw) {
    const settings = policy.sanitizeSettings(raw);
    const root = document.documentElement;

    if (!settings.enabled) {
      root.removeAttribute("data-sal-enabled");
      for (const key of Object.keys(policy.cssBackgroundValues(policy.DEFAULTS))) {
        root.style.removeProperty(key);
      }
      return;
    }

    root.setAttribute("data-sal-enabled", "true");
    const variables = policy.cssBackgroundValues(settings);
    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }
  }

  function load() {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      applySettings(result[STORAGE_KEY] || policy.DEFAULTS);
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[STORAGE_KEY]) return;
    applySettings(changes[STORAGE_KEY].newValue || policy.DEFAULTS);
  });

  load();
})();
