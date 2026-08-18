import test from "node:test";
import assert from "node:assert/strict";
import { NativeAppearanceHost, appearanceStateToHostTokens, createLocalAssetRegistry } from "../native-host/appearance-host.mjs";
import { DemoConversation } from "../native-host/chat-runtime.mjs";
import { HOSTILE_REQUEST, THEMES, localImageTheme } from "../native-host/themes.mjs";

test("native host applies only validated appearance state", () => {
  const host = new NativeAppearanceHost({ now: () => "2026-08-18T05:50:00-07:00" });
  const result = host.requestTransition(THEMES.softGlass);
  assert.equal(result.applied, true);
  assert.equal(result.state.surfaces.conversationOpacity, 0.66);
  assert.equal(result.evidence.hostOwnsRendering, true);
  assert.equal(result.evidence.providerReceivedDomAuthority, false);
  assert.equal(result.evidence.providerReceivedConversation, false);
});

test("hostile functional capability fails closed and preserves state", () => {
  const host = new NativeAppearanceHost();
  const good = host.requestTransition(THEMES.midnight);
  const before = good.state;
  const hostile = host.requestTransition(HOSTILE_REQUEST);
  assert.equal(hostile.applied, false);
  assert.deepEqual(hostile.state, before);
  assert.match(hostile.evidence.errors.join("\n"), /unknown capability interface\.hide-send-button/);
});

test("native rollback restores exact previous appearance", () => {
  const host = new NativeAppearanceHost();
  const initial = host.getState();
  host.requestTransition(THEMES.softGlass);
  const rollback = host.rollback();
  assert.equal(rollback.rolledBack, true);
  assert.deepEqual(rollback.state, initial);
});

test("opaque local asset registry exposes handle metadata while host alone resolves URL", () => {
  const registry = createLocalAssetRegistry({
    createObjectURL: () => "blob:host-only-secret",
    revokeObjectURL: () => {}
  });
  const registered = registry.registerFile({ name: "art.webp", type: "image/webp", size: 1234 });
  assert.match(registered.handle, /^asset:\/\/local\//);
  assert.equal(JSON.stringify(registered).includes("blob:host-only-secret"), false);
  assert.equal(registry.resolveForHost(registered.handle), "blob:host-only-secret");
  const request = localImageTheme(registered.handle);
  assert.equal(JSON.stringify(request).includes("blob:host-only-secret"), false);
});

test("host tokens contain only bounded presentation variables", () => {
  const host = new NativeAppearanceHost();
  host.requestTransition(THEMES.softGlass);
  const tokens = appearanceStateToHostTokens(host.getState());
  assert.deepEqual(Object.keys(tokens).sort(), [
    "--sal-native-bg-blur",
    "--sal-native-bg-color",
    "--sal-native-bg-gradient",
    "--sal-native-bg-image",
    "--sal-native-conversation-opacity",
    "--sal-native-glass-blur",
    "--sal-native-sidebar-opacity"
  ].sort());
  assert.equal(JSON.stringify(tokens).includes("display"), false);
  assert.equal(JSON.stringify(tokens).includes("position"), false);
});

test("conversation state is independent of appearance transitions", () => {
  const chat = new DemoConversation();
  const host = new NativeAppearanceHost();
  chat.send("Does the theme receive this message?");
  const before = chat.getMessages();
  host.requestTransition(THEMES.midnight);
  assert.deepEqual(chat.getMessages(), before);
  assert.equal(JSON.stringify(host.getEvidence()).includes("Does the theme receive this message?"), false);
});
