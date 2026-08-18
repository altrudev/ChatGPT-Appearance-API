# Contributing

Contributions are welcome, particularly around accessibility, host adapters, threat modeling, and portable appearance schemas.

## Before opening a pull request

Run:

```bash
npm run check
```

Please keep changes within the project's authority boundary. A feature that needs conversation text, arbitrary CSS, remote scripts, or authentication-surface control belongs in a different project unless the security model is explicitly revised and reviewed.

## Design principles

- Least privilege
- Local-first assets
- Declarative capabilities
- Fail closed on unknown authority
- Reversible transitions
- Accessibility preserved by the host
- Evidence without conversation capture

No GitHub Actions workflow is required; the repository is intentionally testable locally with Node's built-in test runner.
