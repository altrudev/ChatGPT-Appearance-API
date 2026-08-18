import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../extension/lib/policy.js", import.meta.url), "utf8");
const sandbox = { globalThis: {} };
vm.runInNewContext(source, sandbox, { filename: "policy.js" });
const policy = sandbox.globalThis.SALPolicy;

test("sanitizer preserves safe local image data URLs", () => {
  const value = "data:image/png;base64,aGVsbG8=";
  const result = policy.sanitizeSettings({ imageDataUrl: value });
  assert.equal(result.imageDataUrl, value);
});

test("sanitizer rejects remote image URLs", () => {
  const result = policy.sanitizeSettings({ imageDataUrl: "https://tracker.example/pixel.png" });
  assert.equal(result.imageDataUrl, "");
});

test("sanitizer rejects unsafe gradient functions", () => {
  const result = policy.sanitizeSettings({ gradient: "linear-gradient(red, url(https://example.com/x))" });
  assert.equal(result.gradient, policy.DEFAULTS.gradient);
});

test("surface opacity is clamped to readability floor", () => {
  const result = policy.sanitizeSettings({ conversationOpacity: 0.01, sidebarOpacity: 2 });
  assert.equal(result.conversationOpacity, 0.35);
  assert.equal(result.sidebarOpacity, 1);
});

test("unknown settings are not preserved", () => {
  const result = policy.sanitizeSettings({ arbitraryCss: "body{display:none}", enabled: true });
  assert.equal(Object.hasOwn(result, "arbitraryCss"), false);
});
