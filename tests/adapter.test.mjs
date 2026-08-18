import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../extension/manifest.json", import.meta.url), "utf8"));
const popup = fs.readFileSync(new URL("../extension/popup.js", import.meta.url), "utf8");
const content = fs.readFileSync(new URL("../extension/content.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../extension/content.css", import.meta.url), "utf8");

test("popup can attach adapter to an already-open ChatGPT tab", () => {
  assert.deepEqual(manifest.permissions, ["storage", "scripting"]);
  assert.match(popup, /chrome\.scripting\.executeScript/);
  assert.match(popup, /chrome\.scripting\.insertCSS/);
});

test("content adapter is idempotent under reinjection", () => {
  assert.match(content, /__SAL_APPEARANCE_ADAPTER_V011__/);
  assert.match(content, /if \(globalThis\[INSTANCE_KEY\]\)/);
});

test("adapter overrides named host surface tokens and preserves rollback", () => {
  assert.match(content, /--main-surface-primary/);
  assert.match(content, /--sidebar-surface-primary/);
  assert.match(content, /restoreHostSurfaceTokens/);
});

test("html background provides a renderer fallback", () => {
  assert.match(css, /html\[data-sal-enabled="true"\] \{/);
  assert.match(css, /background-image:/);
  assert.match(css, /body > div/);
});
