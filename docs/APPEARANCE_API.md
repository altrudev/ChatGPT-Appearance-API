# Appearance API — Reference Specification 0.1

## Purpose

The Appearance API is a proposed host capability for applying narrowly scoped visual customization without granting a theme provider arbitrary CSS, DOM, conversation, authentication, or execution access.

This is a reference design, not an existing OpenAI API.

## Core invariant

> Appearance authority must not imply content authority, interface authority, authentication authority, or execution authority.

## Request model

A provider submits a declarative request:

```json
{
  "schemaVersion": "0.1",
  "themeId": "reference.soft-glass",
  "capabilities": [
    "background.color",
    "background.image",
    "surface.conversation.opacity"
  ],
  "appearance": {
    "background": {
      "color": "#15171a",
      "image": "asset://local/user-selected-background"
    },
    "surfaces": {
      "conversationOpacity": 0.84
    }
  }
}
```

Every populated field requires its corresponding capability. Unknown fields or capabilities fail closed.

## Capability registry

| Capability | Effect |
|---|---|
| `background.color` | Host background fallback color |
| `background.gradient` | Host-validated decorative gradient |
| `background.image` | Opaque local asset handle only |
| `background.blur` | Blur applied by host renderer |
| `surface.conversation.opacity` | Conversation surface opacity within safe bounds |
| `surface.sidebar.opacity` | Sidebar surface opacity within safe bounds |
| `surface.glass.blur` | Host-controlled backdrop blur |

No v0.1 capability changes visibility, position, event handling, authentication, message content, or executable behavior.

## Local asset handles

`background.image` accepts an opaque handle such as:

```text
asset://local/user-selected-background
```

A provider should not receive the underlying image bytes unless the user separately authorizes that transfer. The host resolves and renders the local asset.

Remote URLs are intentionally rejected in v0.1 to prevent tracking pixels and silent asset exfiltration.

## Host validation

The host MUST:

1. reject unknown schema versions;
2. reject unknown capabilities;
3. reject fields without granted capabilities;
4. reject arbitrary network URLs for local-only assets;
5. clamp or reject values outside accessibility/safety ranges;
6. keep authentication and functional controls outside the appearance renderer;
7. preserve a reset/rollback path;
8. produce transition evidence without including conversation text.

## Accessibility

The host remains responsible for readability. A production host should evaluate effective contrast around text-bearing surfaces and raise surface opacity or add a host-owned scrim when needed to preserve WCAG AA contrast.

Themes may express preference; they may not disable the host accessibility gate.

## Evidence

An applied transition can produce a record like:

```json
{
  "status": "applied",
  "themeId": "reference.soft-glass",
  "capabilities": ["background.image"],
  "changedFields": ["background.image"],
  "invariants": {
    "conversationContentAccessed": false,
    "authenticationSurfaceModified": false,
    "functionalControlsModified": false,
    "executableCodeAccepted": false,
    "remoteAssetAccepted": false,
    "rollbackAvailable": true
  }
}
```

The record proves what the appearance transition was permitted to change; it does not claim authorship, ownership, or broader provenance.
