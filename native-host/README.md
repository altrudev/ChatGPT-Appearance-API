# Native Host Demo

This directory is the executable **native Safe Appearance Layer host**. Unlike the ChatGPT browser extension, it does not inject CSS into somebody else's page. The host owns the renderer and exposes only a narrow declarative Appearance API boundary.

## Run

From the repository root:

```bash
npm run demo:native
```

Then open `http://127.0.0.1:4173/native-host/`.

The server uses only Node built-ins and sends a restrictive Content Security Policy. The demo is offline: no API key and no external network access are required.

## What to test

- Apply **Soft Glass** or **Midnight** and approve the listed capabilities.
- Pick a local JPG/PNG/WebP. The provider request contains an opaque `asset://local/...` handle; the host alone resolves the local object URL.
- Use **Rollback** to restore the exact previous appearance state.
- Run **hostile capability request**. The request attempts `interface.hide-send-button` and must fail closed while leaving host state unchanged.
- Send chat messages. Chat state remains independent of appearance transitions and is never included in appearance evidence.

## Native boundary

```text
Theme/provider request
        ↓
User capability approval
        ↓
Host validator
        ↓
Host-owned renderer
        ↓
Evidence + rollback
```

The provider receives no DOM handle, arbitrary CSS path, conversation object, authentication surface, or executable hook.
