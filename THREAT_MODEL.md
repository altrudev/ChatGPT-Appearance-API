# Threat Model

## Protected assets

- Conversation confidentiality
- Authentication integrity
- Functional ChatGPT controls
- User ability to recover the default interface
- Visual readability/accessibility
- Local image privacy
- Host UI integrity

## Trust boundaries

### Browser reference client

The user grants the extension host access to ChatGPT pages and local extension storage. This is broader than the proposed native API and is treated as a compatibility bridge, not the ideal authority model.

### Native reference API

The appearance provider is untrusted. The host owns validation, rendering, accessibility, and rollback.

## Threats and controls

| Threat | Control |
|---|---|
| Theme reads conversation content | Native API exposes no conversation handle; reference extension contains no conversation selectors or extraction logic |
| Tracking pixel / remote wallpaper | Only local `data:image/...` in extension; reference API uses opaque local asset handles |
| Fake login or security UI | No arbitrary HTML/CSS surface in native API; authentication surfaces are outside the appearance capability namespace |
| Hide/disable functional controls | No display/visibility/position tokens for functional controls |
| Unreadable theme | Host clamps opacity/blur values and should enforce WCAG contrast around text surfaces |
| Irreversible customization | Reset path and reversible transition state are mandatory |
| Arbitrary code execution | No `eval`, `Function`, remote scripts, or executable theme payloads |
| Permission creep | Explicit allowlist and unknown-capability rejection |
| Host DOM drift | Browser client uses a narrow adapter; drift affects appearance only, not core ChatGPT function |

## Abuse cases intentionally out of scope

SAL does not provide arbitrary CSS, custom script injection, custom login panels, message transformation, DOM automation, or conversation-aware theming.

## Security reporting

See [SECURITY.md](SECURITY.md).
