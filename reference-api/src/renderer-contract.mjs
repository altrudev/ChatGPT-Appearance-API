import { validateAppearanceRequest } from "./validator.mjs";

export const HOST_DEFAULTS = Object.freeze({
  background: {
    color: "#ffffff",
    gradient: null,
    image: null,
    blurPx: 0
  },
  surfaces: {
    conversationOpacity: 1,
    sidebarOpacity: 1,
    glassBlurPx: 0
  }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeAppearance(current, appearance) {
  return {
    background: {
      ...current.background,
      ...(appearance.background || {})
    },
    surfaces: {
      ...current.surfaces,
      ...(appearance.surfaces || {})
    }
  };
}

export function applyAppearanceTransition({ current = HOST_DEFAULTS, request, policyVersion = "sal-host-policy/0.1", now = () => new Date().toISOString() }) {
  const validation = validateAppearanceRequest(request);
  if (!validation.ok) {
    return {
      applied: false,
      state: clone(current),
      evidence: {
        timestamp: now(),
        policyVersion,
        themeId: request && request.themeId ? request.themeId : null,
        status: "rejected",
        errors: validation.errors,
        invariants: {
          conversationContentAccessed: false,
          authenticationSurfaceModified: false,
          functionalControlsModified: false,
          executableCodeAccepted: false,
          remoteAssetAccepted: false,
          rollbackAvailable: true
        }
      }
    };
  }

  const previous = clone(current);
  const state = mergeAppearance(previous, request.appearance);

  return {
    applied: true,
    state,
    rollback: () => clone(previous),
    evidence: {
      timestamp: now(),
      policyVersion,
      themeId: request.themeId,
      status: "applied",
      capabilities: [...request.capabilities],
      changedFields: Object.keys(request.appearance.background || {}).map((key) => `background.${key}`)
        .concat(Object.keys(request.appearance.surfaces || {}).map((key) => `surfaces.${key}`)),
      invariants: {
        conversationContentAccessed: false,
        authenticationSurfaceModified: false,
        functionalControlsModified: false,
        executableCodeAccepted: false,
        remoteAssetAccepted: false,
        rollbackAvailable: true
      }
    }
  };
}
