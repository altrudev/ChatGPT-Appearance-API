# Safe Appearance Layer

**Safe Appearance Layer (SAL)** is an open reference architecture for user-controlled visual customization of conversational AI interfaces without granting appearance providers authority over conversation content, authentication, functional controls, or execution.

The repository contains two implementations:

1. **A working Chrome/Edge reference extension for ChatGPT** that applies local backgrounds and controlled transparency today.
2. **A vendor-neutral reference Appearance API** showing how an AI host could expose the same capability natively through declarative, permission-scoped appearance requests instead of arbitrary CSS or DOM access.

> **Core invariant:** Appearance authority must not imply content authority, interface authority, authentication authority, or execution authority.

## Why this exists

Current conversational interfaces typically make one of two choices: keep appearance fully host-controlled, or let browser extensions/userscripts modify the DOM with broad styling authority. SAL explores a middle layer: the user authorizes a narrow set of appearance capabilities, the provider requests declarative tokens, and the host validates and renders them.

The reference client is intentionally small. It demonstrates that useful personalization does not require telemetry, remote image hosting, conversation parsing, or arbitrary JavaScript injection.

## Reference client features

- Local JPG, PNG, or WebP background image
- Solid/gradient fallback background
- Background fit: cover, contain, or tile
- Background blur
- Dark overlay for readability
- Conversation surface opacity
- Sidebar surface opacity
- Glass/backdrop blur
- One-click reset
- Local-only storage
- No analytics or telemetry
- No network requests
- No conversation parsing

The extension requests only Chrome's `storage` permission and host access only for `chatgpt.com` so its content stylesheet can run there.

## Architecture

```text
User authority
    ↓
Appearance intent
    ↓
Declared capability request
    ↓
Host validation / policy
    ↓
Host-rendered appearance transition
    ↓
Verification + invariant checks
    ↓
Reversible local state
```

The native reference API is **declarative**. A theme asks for an allowlisted appearance capability such as `background.image` or `surface.sidebar.opacity`. It does not receive arbitrary CSS, DOM, conversation, authentication, or execution access.

See [ARCHITECTURE.md](ARCHITECTURE.md), [THREAT_MODEL.md](THREAT_MODEL.md), [docs/APPEARANCE_API.md](docs/APPEARANCE_API.md), and [docs/PLATFORM_CONTEXT.md](docs/PLATFORM_CONTEXT.md).

## Install the reference extension locally

1. Run `npm run check`.
2. Open `chrome://extensions/` (or the equivalent Edge extensions page).
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the `extension/` directory.
6. Open ChatGPT and use the extension popup to choose a local background.

No account connection is required.

## Test and audit

```bash
npm run check
```

This runs the policy/validator tests and a static local audit that rejects network primitives, code-evaluation primitives, unexpected extension permissions, and accidental remote asset URLs.

To package the extension:

```bash
npm run package:extension
```

## Status

**v0.1.0 — Reference implementation.** The browser extension works by applying CSS to the ChatGPT web client and can therefore require adapter updates if the host UI changes. The proposed native API is a reference design, not an OpenAI-supported API.

This project is not affiliated with or endorsed by OpenAI. ChatGPT is a trademark of OpenAI.

## License

MIT. See [LICENSE](LICENSE).
