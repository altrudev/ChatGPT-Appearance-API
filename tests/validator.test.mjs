import test from "node:test";
import assert from "node:assert/strict";
import { validateAppearanceRequest } from "../reference-api/src/validator.mjs";
import { applyAppearanceTransition, HOST_DEFAULTS } from "../reference-api/src/renderer-contract.mjs";

function validRequest() {
  return {
    schemaVersion: "0.1",
    themeId: "reference.test-theme",
    capabilities: [
      "background.color",
      "background.image",
      "surface.conversation.opacity"
    ],
    appearance: {
      background: {
        color: "#15171a",
        image: "asset://local/wallpaper"
      },
      surfaces: {
        conversationOpacity: 0.84
      }
    }
  };
}

test("valid declarative request is accepted", () => {
  assert.deepEqual(validateAppearanceRequest(validRequest()), { ok: true, errors: [] });
});

test("field without capability fails closed", () => {
  const request = validRequest();
  request.capabilities = request.capabilities.filter((c) => c !== "background.image");
  const result = validateAppearanceRequest(request);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /background\.image/);
});

test("unknown capability fails closed", () => {
  const request = validRequest();
  request.capabilities.push("interface.hide-send-button");
  const result = validateAppearanceRequest(request);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /unknown capability/);
});

test("remote image URL is rejected", () => {
  const request = validRequest();
  request.appearance.background.image = "https://tracker.example/pixel.gif";
  const result = validateAppearanceRequest(request);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /local asset handle required/);
});

test("transition evidence contains no conversation content", () => {
  const result = applyAppearanceTransition({
    request: validRequest(),
    now: () => "2026-08-17T23:45:00-07:00"
  });
  assert.equal(result.applied, true);
  assert.equal(result.evidence.invariants.conversationContentAccessed, false);
  assert.equal(JSON.stringify(result.evidence).includes("conversationText"), false);
  assert.equal(result.state.background.image, "asset://local/wallpaper");
});

test("rejected transition preserves current state", () => {
  const request = validRequest();
  request.appearance.background.image = "javascript:alert(1)";
  const current = JSON.parse(JSON.stringify(HOST_DEFAULTS));
  current.background.color = "#010203";
  const result = applyAppearanceTransition({ current, request, now: () => "2026-08-17T23:45:00-07:00" });
  assert.equal(result.applied, false);
  assert.deepEqual(result.state, current);
});

test("rollback returns exact previous state", () => {
  const current = JSON.parse(JSON.stringify(HOST_DEFAULTS));
  current.surfaces.sidebarOpacity = 0.77;
  const result = applyAppearanceTransition({ current, request: validRequest() });
  assert.equal(result.applied, true);
  assert.deepEqual(result.rollback(), current);
});
