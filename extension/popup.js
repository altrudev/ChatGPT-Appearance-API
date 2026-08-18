(() => {
  "use strict";

  const STORAGE_KEY = "salSettings";
  const policy = globalThis.SALPolicy;
  const controls = {};
  const fields = [
    "enabled", "backgroundColor", "gradient", "fit", "overlayOpacity",
    "backgroundBlur", "conversationOpacity", "sidebarOpacity", "glassBlur"
  ];

  function byId(id) { return document.getElementById(id); }

  function status(message) {
    byId("status").textContent = message;
    clearTimeout(status.timer);
    status.timer = setTimeout(() => { byId("status").textContent = ""; }, 2200);
  }

  async function ensureAdapter() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs && tabs[0];
      if (!tab || !tab.id) return false;

      const probe = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          isChatGPT: location.hostname === "chatgpt.com",
          attached: Boolean(globalThis.__SAL_APPEARANCE_ADAPTER_V011__)
        })
      });

      const state = probe && probe[0] && probe[0].result;
      if (!state || !state.isChatGPT) return false;

      if (!state.attached) {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"]
        });
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["lib/policy.js", "content.js"]
        });
      } else {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => globalThis.__SAL_APPEARANCE_ADAPTER_V011__?.load?.()
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  function renderOutputs() {
    byId("overlayOpacityOut").textContent = `${Math.round(Number(controls.overlayOpacity.value) * 100)}%`;
    byId("backgroundBlurOut").textContent = `${controls.backgroundBlur.value}px`;
    byId("conversationOpacityOut").textContent = `${Math.round(Number(controls.conversationOpacity.value) * 100)}%`;
    byId("sidebarOpacityOut").textContent = `${Math.round(Number(controls.sidebarOpacity.value) * 100)}%`;
    byId("glassBlurOut").textContent = `${controls.glassBlur.value}px`;
  }

  function setForm(settings) {
    const safe = policy.sanitizeSettings(settings);
    for (const field of fields) {
      const control = controls[field];
      if (control.type === "checkbox") control.checked = Boolean(safe[field]);
      else control.value = safe[field];
    }
    renderOutputs();
  }

  function formSettings(previous) {
    return policy.sanitizeSettings({
      ...previous,
      enabled: controls.enabled.checked,
      backgroundColor: controls.backgroundColor.value,
      gradient: controls.gradient.value,
      fit: controls.fit.value,
      overlayOpacity: controls.overlayOpacity.value,
      backgroundBlur: controls.backgroundBlur.value,
      conversationOpacity: controls.conversationOpacity.value,
      sidebarOpacity: controls.sidebarOpacity.value,
      glassBlur: controls.glassBlur.value
    });
  }

  function update(mutator) {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const current = policy.sanitizeSettings(result[STORAGE_KEY] || policy.DEFAULTS);
      const next = policy.sanitizeSettings(mutator ? mutator(current) : formSettings(current));
      chrome.storage.local.set({ [STORAGE_KEY]: next }, async () => {
        setForm(next);
        const attached = await ensureAdapter();
        status(attached ? "Applied to this ChatGPT tab" : "Saved — open ChatGPT to apply");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    for (const field of fields) controls[field] = byId(field);

    chrome.storage.local.get(STORAGE_KEY, async (result) => {
      setForm(result[STORAGE_KEY] || policy.DEFAULTS);
      const attached = await ensureAdapter();
      if (attached) status("Connected to this ChatGPT tab");
    });

    for (const field of fields) {
      const eventName = controls[field].type === "range" ? "input" : "change";
      controls[field].addEventListener(eventName, () => {
        renderOutputs();
        update();
      });
    }

    byId("imageFile").addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        status("Unsupported image type");
        event.target.value = "";
        return;
      }
      if (file.size > policy.MAX_IMAGE_BYTES) {
        status("Image exceeds 5 MB");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || "");
        if (!policy.isSafeImageDataUrl(value)) {
          status("Image validation failed");
          return;
        }
        update((current) => ({ ...current, imageDataUrl: value, enabled: true }));
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });

    byId("clearImage").addEventListener("click", () => {
      update((current) => ({ ...current, imageDataUrl: "" }));
    });

    byId("reset").addEventListener("click", () => {
      chrome.storage.local.set({ [STORAGE_KEY]: { ...policy.DEFAULTS } }, async () => {
        setForm(policy.DEFAULTS);
        await ensureAdapter();
        status("Defaults restored");
      });
    });
  });
})();
