# Transition Governance Review

This project applies the DDC methodology as a transition-governance review using ordinary systems language.

## Authority

The user may authorize visual personalization. That authorization is scoped to explicitly granted appearance capabilities.

## Intent

Change presentation only: background and host-defined surface treatments.

## Preconditions

- User has selected or enabled a theme.
- The host recognizes the schema version.
- Requested fields map to granted capabilities.
- Local image assets satisfy format and size policy.

## Execution boundary

### Browser reference client

The extension operates only on ChatGPT host pages, uses local extension storage, and has no network API permission or network calls in its source.

### Native reference API

The host—not the theme provider—owns validation and rendering. Providers receive no DOM authority.

## Transition

A validated appearance state replaces the previous appearance state.

## Verification

- request validates against the capability registry;
- local image URL policy rejects remote/network URLs;
- values are range checked;
- local static audit rejects network/eval primitives;
- tests verify unauthorized fields fail closed;
- rollback reproduces the exact prior state.

## Preserved invariants

- conversation content is not required or captured;
- authentication surfaces are not modified;
- functional controls are not hidden or intercepted;
- executable theme code is not accepted;
- remote assets are not accepted by the reference API;
- rollback remains available.

## Evidence

The host reference code records requested capabilities, changed appearance fields, policy version, result, and invariant outcomes without recording conversation content.

## Recovery

Invalid requests do not transition state. Applied transitions return a rollback closure in the reference code. The extension provides a restore-defaults control.
