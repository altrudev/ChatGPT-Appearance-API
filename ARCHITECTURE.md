# Architecture

## Goal

Provide meaningful visual personalization while preserving a hard authority boundary between **appearance** and every higher-risk capability of the host interface.

## Three layers

### 1. Executable native host

`native-host/` is the preferred architecture made runnable. The host owns:

- capability approval;
- request validation;
- local asset registry and resolution;
- rendering;
- conversation state;
- evidence;
- rollback.

The appearance runtime receives declarative appearance requests only. It does not import the chat runtime and contains no external network path.

### 2. Browser compatibility client

The Chrome/Edge extension proves the user experience on ChatGPT today. It stores a sanitized appearance profile locally and applies a fixed allowlist of host-surface changes.

The extension necessarily has more page authority than the native design because ChatGPT does not expose the proposed appearance boundary. It remains intentionally constrained: no telemetry, no network requests, no conversation extraction, no arbitrary theme CSS, and no remote code.

### 3. Native Appearance API specification

`reference-api/` defines the vendor-neutral declarative contract a production host can expose.

```text
Theme/provider                    Host
--------------                    ----
manifest + request   ──────────►  user capability approval
                                  capability validator
                                  accessibility / policy gate
                                  local asset resolver
                                  renderer
                                  transition evidence
                      ◄─────────  applied/rejected result
```

A provider supplies bounded values. It never receives a DOM handle or arbitrary CSS execution path.

## Authority model

```text
Appearance ≠ Content
Appearance ≠ Function
Appearance ≠ Authentication
Appearance ≠ Execution
```

Approval to change `background.image` does not authorize reading conversation text. Approval to change `surface.sidebar.opacity` does not authorize hiding sidebar controls.

## Opaque local assets

The native host registers a user-selected image and returns only an opaque handle to the appearance request:

```text
asset://local/user-background-1
```

The provider never needs the host-owned `blob:` object URL. Resolution happens only inside the renderer boundary.

## Transition governance

SAL evaluates an appearance change as:

**Authority → Intent → Preconditions → Execution Boundary → Transition → Verification → Invariant Preservation → Evidence → Recovery**

A transition record contains requested capabilities, applied/rejected state, changed appearance fields, policy version, execution boundary, and invariant outcomes. Conversation text is not evidence for an appearance transition and is therefore excluded.

## Recovery

- Invalid values fail closed.
- Unknown capabilities fail closed.
- Remote image URLs fail closed in the local-only profile.
- A rejected transition does not mutate current appearance state.
- Native rollback restores the exact previous appearance state.
- Local asset records can be revoked by the host.
- Extension reset restores host defaults and previously owned inline tokens.
