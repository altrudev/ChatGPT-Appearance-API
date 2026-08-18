const RESPONSES = Object.freeze([
  "In this native demo, the host owns appearance rendering. The theme receives no conversation handle.",
  "The appearance request is declarative: capability list plus bounded values. Unknown authority fails closed.",
  "A local image becomes an opaque asset handle. Only the host resolves the underlying object URL.",
  "Rollback restores the previous host-owned appearance state without touching conversation state."
]);

export class DemoConversation {
  #messages = [];
  #cursor = 0;

  constructor() {
    this.#messages.push({ role: "assistant", text: "Native SAL host is ready. Try a theme, local image, rollback, or the hostile-request test." });
  }

  getMessages() {
    return this.#messages.map((message) => ({ ...message }));
  }

  send(text) {
    const clean = String(text || "").trim().slice(0, 1200);
    if (!clean) return this.getMessages();
    this.#messages.push({ role: "user", text: clean });
    this.#messages.push({ role: "assistant", text: RESPONSES[this.#cursor % RESPONSES.length] });
    this.#cursor += 1;
    return this.getMessages();
  }
}
