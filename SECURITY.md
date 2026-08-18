# Security Policy

## Supported version

The current `main` branch and the latest tagged release are supported during the reference phase.

## Report a vulnerability

Please avoid posting exploit details publicly before a fix is available. Open a minimal GitHub issue that states a security problem exists and requests a private contact channel, or contact the repository owner through their published GitHub profile.

Useful reports include:

- the affected version;
- the exact capability boundary crossed;
- reproduction steps;
- whether conversation content, authentication UI, remote networking, or functional controls are affected;
- a minimal proof of concept.

## Security invariants

1. No remote network requests from the reference extension.
2. No conversation extraction or parsing.
3. No arbitrary CSS or JavaScript supplied by a theme.
4. No executable remote assets.
5. Unknown native Appearance API capabilities fail closed.
6. Reset must remain available.
