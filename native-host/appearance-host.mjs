import { applyAppearanceTransition, HOST_DEFAULTS } from "../reference-api/src/renderer-contract.mjs";

const HANDLE_PREFIX = "asset://local/";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createLocalAssetRegistry({ createObjectURL = (file) => URL.createObjectURL(file), revokeObjectURL = (url) => URL.revokeObjectURL(url) } = {}) {
  const records = new Map();
  let counter = 0;

  function registerFile(file) {
    if (!file || typeof file !== "object") throw new TypeError("file required");
    if (!/^image\/(png|jpeg|webp)$/.test(String(file.type || ""))) throw new TypeError("unsupported image type");
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > 5 * 1024 * 1024) throw new RangeError("image must be 1 byte..5 MB");

    counter += 1;
    const handle = `${HANDLE_PREFIX}user-background-${counter}`;
    const objectUrl = createObjectURL(file);
    records.set(handle, {
      objectUrl,
      metadata: Object.freeze({
        name: String(file.name || "local-image"),
        type: String(file.type),
        size: Number(file.size)
      })
    });
    return Object.freeze({ handle, metadata: records.get(handle).metadata });
  }

  function resolveForHost(handle) {
    const record = records.get(handle);
    return record ? record.objectUrl : null;
  }

  function describe(handle) {
    const record = records.get(handle);
    return record ? record.metadata : null;
  }

  function revoke(handle) {
    const record = records.get(handle);
    if (!record) return false;
    revokeObjectURL(record.objectUrl);
    records.delete(handle);
    return true;
  }

  function clear() {
    for (const handle of [...records.keys()]) revoke(handle);
  }

  return Object.freeze({ registerFile, resolveForHost, describe, revoke, clear });
}

export class NativeAppearanceHost {
  #state;
  #history = [];
  #evidence = [];
  #policyVersion;
  #now;

  constructor({ initialState = HOST_DEFAULTS, policyVersion = "sal-native-host-policy/0.2", now = () => new Date().toISOString() } = {}) {
    this.#state = clone(initialState);
    this.#policyVersion = policyVersion;
    this.#now = now;
  }

  getState() {
    return clone(this.#state);
  }

  getEvidence() {
    return clone(this.#evidence);
  }

  requestTransition(request) {
    const result = applyAppearanceTransition({
      current: this.#state,
      request,
      policyVersion: this.#policyVersion,
      now: this.#now
    });

    const evidence = {
      ...result.evidence,
      executionBoundary: "native-host-renderer",
      hostOwnsRendering: true,
      providerReceivedDomAuthority: false,
      providerReceivedConversation: false,
      transitionSequence: this.#evidence.length + 1
    };

    this.#evidence.push(evidence);
    if (!result.applied) {
      return { applied: false, state: this.getState(), evidence: clone(evidence) };
    }

    this.#history.push(this.getState());
    this.#state = clone(result.state);
    return { applied: true, state: this.getState(), evidence: clone(evidence) };
  }

  rollback() {
    if (!this.#history.length) {
      const evidence = {
        timestamp: this.#now(),
        policyVersion: this.#policyVersion,
        status: "rollback-noop",
        executionBoundary: "native-host-renderer",
        rollbackAvailable: false,
        transitionSequence: this.#evidence.length + 1
      };
      this.#evidence.push(evidence);
      return { rolledBack: false, state: this.getState(), evidence: clone(evidence) };
    }

    const previous = this.#history.pop();
    this.#state = clone(previous);
    const evidence = {
      timestamp: this.#now(),
      policyVersion: this.#policyVersion,
      status: "rolled-back",
      executionBoundary: "native-host-renderer",
      invariants: {
        conversationContentAccessed: false,
        authenticationSurfaceModified: false,
        functionalControlsModified: false,
        executableCodeAccepted: false,
        remoteAssetAccepted: false
      },
      transitionSequence: this.#evidence.length + 1
    };
    this.#evidence.push(evidence);
    return { rolledBack: true, state: this.getState(), evidence: clone(evidence) };
  }
}

export function appearanceStateToHostTokens(state, resolveAsset = () => null) {
  const safe = state || HOST_DEFAULTS;
  const imageHandle = safe.background?.image || null;
  const resolved = imageHandle ? resolveAsset(imageHandle) : null;

  return Object.freeze({
    "--sal-native-bg-color": safe.background?.color || "#ffffff",
    "--sal-native-bg-gradient": safe.background?.gradient || "none",
    "--sal-native-bg-image": resolved ? `url(\"${String(resolved).replace(/[\"\\\n\r]/g, "")}\")` : "none",
    "--sal-native-bg-blur": `${Number(safe.background?.blurPx || 0)}px`,
    "--sal-native-conversation-opacity": String(Number(safe.surfaces?.conversationOpacity ?? 1)),
    "--sal-native-sidebar-opacity": String(Number(safe.surfaces?.sidebarOpacity ?? 1)),
    "--sal-native-glass-blur": `${Number(safe.surfaces?.glassBlurPx || 0)}px`
  });
}
