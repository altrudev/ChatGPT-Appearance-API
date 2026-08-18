export const CAPABILITIES = Object.freeze({
  BACKGROUND_COLOR: "background.color",
  BACKGROUND_GRADIENT: "background.gradient",
  BACKGROUND_IMAGE: "background.image",
  BACKGROUND_BLUR: "background.blur",
  CONVERSATION_OPACITY: "surface.conversation.opacity",
  SIDEBAR_OPACITY: "surface.sidebar.opacity",
  GLASS_BLUR: "surface.glass.blur"
});

export const ALLOWED_CAPABILITIES = new Set(Object.values(CAPABILITIES));

const HEX = /^#[0-9a-fA-F]{6}$/;
const THEME_ID = /^[a-z0-9][a-z0-9._-]{2,80}$/;
const LOCAL_ASSET = /^asset:\/\/local\/[A-Za-z0-9._-]+$/;

const fieldCapability = Object.freeze({
  "background.color": CAPABILITIES.BACKGROUND_COLOR,
  "background.gradient": CAPABILITIES.BACKGROUND_GRADIENT,
  "background.image": CAPABILITIES.BACKGROUND_IMAGE,
  "background.blurPx": CAPABILITIES.BACKGROUND_BLUR,
  "surfaces.conversationOpacity": CAPABILITIES.CONVERSATION_OPACITY,
  "surfaces.sidebarOpacity": CAPABILITIES.SIDEBAR_OPACITY,
  "surfaces.glassBlurPx": CAPABILITIES.GLASS_BLUR
});

function numberInRange(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function validGradient(value) {
  return typeof value === "string" &&
    value.length <= 300 &&
    /^(linear-gradient|radial-gradient)\(/i.test(value.trim()) &&
    !/url\s*\(|var\s*\(|expression\s*\(|@import/i.test(value);
}

function ownKeysOnly(object, allowed, errors, path) {
  for (const key of Object.keys(object || {})) {
    if (!allowed.has(key)) errors.push(`${path}.${key}: unknown field`);
  }
}

export function validateAppearanceRequest(request) {
  const errors = [];
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    return { ok: false, errors: ["request: object required"] };
  }

  ownKeysOnly(request, new Set(["schemaVersion", "themeId", "capabilities", "appearance"]), errors, "request");

  if (request.schemaVersion !== "0.1") errors.push("schemaVersion: unsupported version");
  if (typeof request.themeId !== "string" || !THEME_ID.test(request.themeId)) errors.push("themeId: invalid identifier");
  if (!Array.isArray(request.capabilities)) errors.push("capabilities: array required");
  if (!request.appearance || typeof request.appearance !== "object" || Array.isArray(request.appearance)) errors.push("appearance: object required");

  const requested = new Set(Array.isArray(request.capabilities) ? request.capabilities : []);
  for (const capability of requested) {
    if (!ALLOWED_CAPABILITIES.has(capability)) errors.push(`capabilities: unknown capability ${String(capability)}`);
  }
  if (requested.size !== (request.capabilities || []).length) errors.push("capabilities: duplicates not allowed");

  const appearance = request.appearance || {};
  ownKeysOnly(appearance, new Set(["background", "surfaces"]), errors, "appearance");

  const background = appearance.background || {};
  if (appearance.background !== undefined && (typeof background !== "object" || Array.isArray(background))) {
    errors.push("appearance.background: object required");
  } else {
    ownKeysOnly(background, new Set(["color", "gradient", "image", "blurPx"]), errors, "appearance.background");
    if (background.color !== undefined && !HEX.test(background.color)) errors.push("appearance.background.color: #RRGGBB required");
    if (background.gradient !== undefined && !validGradient(background.gradient)) errors.push("appearance.background.gradient: invalid or unsafe gradient");
    if (background.image !== undefined && !LOCAL_ASSET.test(background.image)) errors.push("appearance.background.image: local asset handle required");
    if (background.blurPx !== undefined && !numberInRange(background.blurPx, 0, 30)) errors.push("appearance.background.blurPx: must be 0..30");
  }

  const surfaces = appearance.surfaces || {};
  if (appearance.surfaces !== undefined && (typeof surfaces !== "object" || Array.isArray(surfaces))) {
    errors.push("appearance.surfaces: object required");
  } else {
    ownKeysOnly(surfaces, new Set(["conversationOpacity", "sidebarOpacity", "glassBlurPx"]), errors, "appearance.surfaces");
    if (surfaces.conversationOpacity !== undefined && !numberInRange(surfaces.conversationOpacity, 0.35, 1)) errors.push("appearance.surfaces.conversationOpacity: must be 0.35..1");
    if (surfaces.sidebarOpacity !== undefined && !numberInRange(surfaces.sidebarOpacity, 0.35, 1)) errors.push("appearance.surfaces.sidebarOpacity: must be 0.35..1");
    if (surfaces.glassBlurPx !== undefined && !numberInRange(surfaces.glassBlurPx, 0, 30)) errors.push("appearance.surfaces.glassBlurPx: must be 0..30");
  }

  const presentFields = [];
  for (const key of ["color", "gradient", "image", "blurPx"]) {
    if (background[key] !== undefined) presentFields.push(`background.${key}`);
  }
  for (const key of ["conversationOpacity", "sidebarOpacity", "glassBlurPx"]) {
    if (surfaces[key] !== undefined) presentFields.push(`surfaces.${key}`);
  }

  for (const field of presentFields) {
    const requiredCapability = fieldCapability[field];
    if (!requested.has(requiredCapability)) errors.push(`${field}: capability ${requiredCapability} was not granted`);
  }

  return { ok: errors.length === 0, errors };
}
