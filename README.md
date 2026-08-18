# Safe Appearance Layer

<p align="center">
  <strong>An open reference architecture for safe visual personalization of conversational AI interfaces.</strong>
</p>

<p align="center">
  Appearance can change. Conversation authority should not.
</p>

<p align="center">
  <img src="docs/assets/sal-hero.svg" alt="Safe Appearance Layer: compatibility client and native Appearance API" width="100%" />
</p>

> **Core invariant:** Appearance authority must not imply content authority, interface authority, authentication authority, or execution authority.

## What this repository now proves

Safe Appearance Layer (SAL) contains **three complementary layers**:

1. **Executable native host** — a real host-owned Appearance API implementation with capability approval, opaque local assets, transition evidence, and exact rollback.
2. **Working Chrome/Edge ChatGPT reference client** — a compatibility bridge that applies local backgrounds and controlled transparency to ChatGPT today.
3. **Vendor-neutral Appearance API specification** — the platform contract a conversational AI host can expose without granting themes arbitrary CSS, DOM, conversation, authentication, or execution access.

The browser extension proves the user experience on an existing host. The native demo proves the preferred authority architecture when the host itself owns rendering.

## Run the native host

```bash
npm run check
npm run demo:native
```

Open `http://127.0.0.1:4173/native-host/`.

The native demo runs offline with Node built-ins only. It demonstrates:

- user approval of requested appearance capabilities;
- host-owned rendering instead of DOM injection;
- local JPG/PNG/WebP represented to the provider only as an opaque `asset://local/...` handle;
- host-only object URL resolution;
- transition evidence without conversation text;
- exact rollback;
- hostile capability rejection (`interface.hide-send-button`);
- conversation state isolated from appearance state.

See [`native-host/README.md`](native-host/README.md) and [`docs/DDC_NATIVE_HOST_REVIEW.md`](docs/DDC_NATIVE_HOST_REVIEW.md).

### Visual reference demo

The existing [`docs/demo/index.html`](docs/demo/index.html) remains a self-contained visual mockup showing appearance controls and surface behavior without external assets or network dependencies.

## The boundary

<p align="center">
  <img src="docs/assets/permission-boundary.svg" alt="Theme provider to host policy to host UI permission boundary" width="100%" />
</p>

```text
User Authority
    ↓
Appearance Intent
    ↓
Declared Capability Request
    ↓
User Capability Approval
    ↓
Host Validation / Policy
    ↓
Host-Owned Renderer
    ↓
Verification + Invariant Checks
    ↓
Evidence + Reversible State
```

**Appearance ≠ Content ≠ Function ≠ Authentication ≠ Execution**

A theme may request `background.image`. That does not authorize reading conversation text. A request for `surface.sidebar.opacity` does not authorize hiding sidebar controls. Unknown capabilities fail closed.

## Executable native host

The native implementation is not a browser skin. The host owns the rendering boundary and converts validated appearance state into a fixed set of presentation tokens. Theme/provider code receives no DOM handle and cannot supply arbitrary CSS, HTML, event handlers, authentication UI, or functional-control changes.

Local images cross the provider boundary as opaque handles:

```text
User-selected File
      ↓
Host asset registry
      ├── provider sees: asset://local/user-background-1
      └── host resolves: blob:<host-owned-object-url>
```

The native host also keeps conversation state in a separate runtime module. Appearance transitions neither import nor receive the conversation runtime.

## Working ChatGPT reference client

The Chrome/Edge compatibility client demonstrates local backgrounds, gradient fallback, blur, readability overlay, conversation/sidebar transparency, glass effects, and reset while deliberately excluding telemetry, remote network requests, conversation parsing, remote scripts, arbitrary theme CSS, authentication-surface changes, and functional-control interception.

The extension requests:

- `storage` — local appearance settings;
- `scripting` — attach the local appearance adapter to an already-open ChatGPT tab;
- host access only for `https://chatgpt.com/*`.

The extension is a compatibility proof, not the preferred authority model.

## Native Appearance API reference

The proposed API is declarative. A provider submits a narrow capability request; the host owns validation, rendering, accessibility enforcement, local asset resolution, evidence, and rollback.

```json
{
  "schemaVersion": "0.1",
  "themeId": "reference.soft-glass",
  "capabilities": [
    "background.image",
    "surface.conversation.opacity",
    "surface.glass.blur"
  ],
  "appearance": {
    "background": {
      "image": "asset://local/user-selected-background"
    },
    "surfaces": {
      "conversationOpacity": 0.84,
      "glassBlurPx": 10
    }
  }
}
```

Remote wallpaper URLs are rejected in the v0.1 local-only model. See [`docs/APPEARANCE_API.md`](docs/APPEARANCE_API.md).

## DDC validation

```bash
npm run ddc:audit
```

The DDC review evaluates:

**Authority → Intent → Preconditions → Execution Boundary → Transition → Verification → Invariant Preservation → Evidence → Recovery**

The native-host result is **PASS WITH BOUNDED RESIDUAL UNCERTAINTY**. Remaining uncertainty is explicit: production accessibility enforcement against arbitrary imagery and direct ChatGPT integration require host-specific implementation/testing.

## Full checks

```bash
npm run check
```

This runs unit/policy tests, the static security audit, and the DDC structural audit.

Package the ChatGPT compatibility extension with:

```bash
npm run package:extension
```

No GitHub Actions workflow is required.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`THREAT_MODEL.md`](THREAT_MODEL.md)
- [`SECURITY.md`](SECURITY.md)
- [`docs/APPEARANCE_API.md`](docs/APPEARANCE_API.md)
- [`docs/DDC_NATIVE_HOST_REVIEW.md`](docs/DDC_NATIVE_HOST_REVIEW.md)
- [`docs/OPENAI_PROPOSAL.md`](docs/OPENAI_PROPOSAL.md)
- [`docs/PLATFORM_CONTEXT.md`](docs/PLATFORM_CONTEXT.md)

## Project status

**SAL v0.2.0 — executable native host + ChatGPT compatibility client + reference API.**

Direct integration into ChatGPT itself still requires an OpenAI-supported host appearance capability. SAL's host-level appearance boundary is a proposed capability rather than an existing ChatGPT API.

The visual demonstrations in this repository are illustrative reference interfaces, not official OpenAI UI.

This project is not affiliated with or endorsed by OpenAI. ChatGPT is a trademark of OpenAI.

## License

MIT. See [`LICENSE`](LICENSE).
