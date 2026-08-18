# Platform Context

This repository is intentionally separate from the current ChatGPT plugin UI model.

As of August 2026, OpenAI's public plugin documentation says custom plugin UI components run inside an iframe in ChatGPT and render alongside the conversation. OpenAI's UI guidelines also ask partner UI to use system-defined palettes rather than redefine ChatGPT backgrounds or core colors. Its security guidance emphasizes least privilege and explicit user consent.

Those are sensible boundaries for today's plugin model. SAL proposes an additional **host-owned, permissioned appearance surface** rather than weakening iframe isolation or giving plugins arbitrary access to the ChatGPT DOM.

Primary references:

- [OpenAI — Add UI to your MCP server](https://developers.openai.com/plugins/build/chatgpt-ui)
- [OpenAI — Plugin UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines)
- [OpenAI — Plugin Security & Privacy](https://developers.openai.com/plugins/guides/security-privacy)

The proposed Appearance API in this repository is not an existing OpenAI feature and should not be represented as one.
