# Proposal: Permissioned Appearance API for ChatGPT

## Summary

Introduce a host-controlled Appearance API that lets approved plugins or theme providers request narrow visual customization through declarative capabilities rather than arbitrary CSS or DOM access.

The initial capability set can be deliberately small: backgrounds, gradients, surface opacity, and host-owned blur.

## Why

Users increasingly treat conversational AI as a persistent working environment. Appearance can support personalization, accessibility, focus, organizational identity, and creative context. Browser extensions can demonstrate demand, but they necessarily operate with broader page styling access than a first-party platform should require.

A native Appearance API can provide the same utility while keeping ChatGPT in control of rendering and security-sensitive UI.

## Security boundary

**Appearance ≠ Content ≠ Function ≠ Authentication ≠ Execution**

Granting a theme `background.image` must not grant access to conversation content. Granting `surface.sidebar.opacity` must not allow hiding or replacing sidebar controls. Authentication dialogs, security warnings, system notices, message content, and executable behavior remain outside the appearance namespace.

## Suggested API shape

A plugin declares capabilities and submits appearance tokens. ChatGPT validates the request and applies it through the host renderer.

```json
{
  "schemaVersion": "0.1",
  "capabilities": [
    "background.image",
    "surface.conversation.opacity"
  ],
  "appearance": {
    "background": { "image": "asset://local/user-background" },
    "surfaces": { "conversationOpacity": 0.84 }
  }
}
```

## Privacy

Local assets should remain local by default. A theme provider should receive an opaque asset handle, not the user's image bytes. Remote image URLs can be excluded from the first version entirely.

## Accessibility

ChatGPT should retain authority to enforce contrast, readable surfaces, reduced motion, and other accessibility constraints even when a theme requests more aggressive transparency.

## Reference implementation

This repository includes:

- a working Chrome/Edge ChatGPT background client;
- an allowlisted capability validator;
- an example declarative schema;
- transition evidence and rollback code;
- threat model and hostile-input tests.

The browser extension is the compatibility proof. The reference API is the safer target architecture.
