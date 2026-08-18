(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SALPolicy = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const MAX_DATA_URL_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 256;

  const DEFAULTS = Object.freeze({
    enabled: false,
    imageDataUrl: "",
    backgroundColor: "#15171a",
    gradient: "linear-gradient(135deg, #15171a 0%, #23262c 100%)",
    fit: "cover",
    position: "center center",
    overlayColor: "#000000",
    overlayOpacity: 0.18,
    backgroundBlur: 0,
    conversationOpacity: 0.84,
    sidebarOpacity: 0.9,
    glassBlur: 10
  });

  const ENUMS = Object.freeze({
    fit: new Set(["cover", "contain", "tile"]),
    position: new Set(["center center", "center top", "center bottom", "left center", "right center"])
  });

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function sanitizeGradient(value) {
    if (typeof value !== "string") return DEFAULTS.gradient;
    const trimmed = value.trim();
    if (trimmed.length > 300) return DEFAULTS.gradient;
    if (!/^(linear-gradient|radial-gradient)\(/i.test(trimmed)) return DEFAULTS.gradient;
    if (/url\s*\(|var\s*\(|expression\s*\(|@import/i.test(trimmed)) return DEFAULTS.gradient;
    return trimmed;
  }

  function isSafeImageDataUrl(value) {
    if (value === "") return true;
    if (typeof value !== "string" || value.length > MAX_DATA_URL_CHARS) return false;
    return /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(value);
  }

  function sanitizeSettings(input) {
    const candidate = input && typeof input === "object" ? input : {};
    return {
      enabled: typeof candidate.enabled === "boolean" ? candidate.enabled : DEFAULTS.enabled,
      imageDataUrl: isSafeImageDataUrl(candidate.imageDataUrl) ? candidate.imageDataUrl : "",
      backgroundColor: isHexColor(candidate.backgroundColor) ? candidate.backgroundColor : DEFAULTS.backgroundColor,
      gradient: sanitizeGradient(candidate.gradient),
      fit: ENUMS.fit.has(candidate.fit) ? candidate.fit : DEFAULTS.fit,
      position: ENUMS.position.has(candidate.position) ? candidate.position : DEFAULTS.position,
      overlayColor: isHexColor(candidate.overlayColor) ? candidate.overlayColor : DEFAULTS.overlayColor,
      overlayOpacity: clamp(candidate.overlayOpacity, 0, 0.85, DEFAULTS.overlayOpacity),
      backgroundBlur: clamp(candidate.backgroundBlur, 0, 30, DEFAULTS.backgroundBlur),
      conversationOpacity: clamp(candidate.conversationOpacity, 0.35, 1, DEFAULTS.conversationOpacity),
      sidebarOpacity: clamp(candidate.sidebarOpacity, 0.35, 1, DEFAULTS.sidebarOpacity),
      glassBlur: clamp(candidate.glassBlur, 0, 30, DEFAULTS.glassBlur)
    };
  }

  function hexToRgb(hex) {
    const safe = isHexColor(hex) ? hex : "#000000";
    return {
      r: parseInt(safe.slice(1, 3), 16),
      g: parseInt(safe.slice(3, 5), 16),
      b: parseInt(safe.slice(5, 7), 16)
    };
  }

  function rgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1, 1)})`;
  }

  function cssBackgroundValues(settings) {
    const safe = sanitizeSettings(settings);
    const hasImage = Boolean(safe.imageDataUrl);
    const size = safe.fit === "tile" ? "auto" : safe.fit;
    const repeat = safe.fit === "tile" ? "repeat" : "no-repeat";

    return {
      "--sal-bg-image": hasImage ? `url(\"${safe.imageDataUrl}\")` : "none",
      "--sal-bg-gradient": safe.gradient,
      "--sal-bg-color": safe.backgroundColor,
      "--sal-bg-size": size,
      "--sal-bg-repeat": repeat,
      "--sal-bg-position": safe.position,
      "--sal-overlay-color": rgba(safe.overlayColor, safe.overlayOpacity),
      "--sal-bg-blur": `${safe.backgroundBlur}px`,
      "--sal-main-surface": rgba(safe.backgroundColor, safe.conversationOpacity),
      "--sal-sidebar-surface": rgba(safe.backgroundColor, safe.sidebarOpacity),
      "--sal-glass-blur": `${safe.glassBlur}px`
    };
  }

  return {
    DEFAULTS,
    MAX_IMAGE_BYTES,
    sanitizeSettings,
    isSafeImageDataUrl,
    cssBackgroundValues,
    rgba
  };
});
