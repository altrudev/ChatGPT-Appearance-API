# Architecture

## Goal

Provide meaningful visual personalization while preserving a hard authority boundary between **appearance** and every higher-risk capability of the host interface.

## Two layers

### 1. Browser reference client

The extension proves the user experience today. It stores a sanitized appearance profile in `chrome.storage.local` and applies a fixed allowlist of CSS variables and selectors on ChatGPT pages.

It does not:

- read or extract conversation messages;
- call remote APIs;
- inject arbitrary user CSS;
- execute remote code;
- replace authentication surfaces;
- hide or intercept ChatGPT controls.

The browser extension necessarily has host-page styling access because no native appearance API exists. That limitation is why the second layer exists.

### 2. Native Appearance API reference

The preferred platform design moves rendering authority back into the host.

```text
Theme/provider                   Host
--------------                   ----
manifest + request  ──────────►  capability validator
                                 policy + accessibility gate
                                 renderer
                                 transition evidence
                     ◄─────────  applied/rejected result
```

A provider supplies declarative values. It never receives a DOM handle or arbitrary CSS execution path.

## Authority model

The host should treat these as separate capability classes:

```text
Appearance ≠ Content
Appearance ≠ Function
Appearance ≠ Authentication
Appearance ≠ Execution
```

An approval to change `background.image` does not authorize reading conversation text. Approval to change `surface.sidebar.opacity` does not authorize hiding sidebar controls.

## Transition governance

SAL evaluates an appearance change as a governed state transition:

**Authority → Intent → Preconditions → Capability boundary → Transition → Verification → Invariant preservation → Evidence → Consequence/lineage → Recovery**

A compliant host can record a small transition object containing requested capabilities, applied values, rejected values, policy version, and rollback state. No conversation text is required for that evidence.

## Failure strategy

- Invalid values fail closed.
- Unknown capabilities fail closed.
- Network image URLs fail closed in the local-only profile.
- A missing or invalid image falls back to a local color/gradient.
- Reset restores host defaults.
- If a host adapter becomes incompatible, functional ChatGPT UI remains untouched; only SAL appearance may degrade.
