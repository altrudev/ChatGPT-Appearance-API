import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const extension = path.join(root, "extension");
const manifest = JSON.parse(fs.readFileSync(path.join(extension, "manifest.json"), "utf8"));
const failures = [];

const expectedPermissions = ["storage"];
if (JSON.stringify(manifest.permissions || []) !== JSON.stringify(expectedPermissions)) {
  failures.push(`manifest permissions changed: ${JSON.stringify(manifest.permissions || [])}`);
}

const expectedHosts = new Set(["https://chatgpt.com/*"]);
for (const host of manifest.host_permissions || []) {
  if (!expectedHosts.has(host)) failures.push(`unexpected host permission: ${host}`);
}
if ((manifest.host_permissions || []).length !== expectedHosts.size) {
  failures.push("host permission set is incomplete or expanded");
}

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

const textFiles = filesUnder(extension).filter((file) => /\.(js|css|html|json)$/.test(file));
const forbidden = [
  { name: "fetch", regex: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/ },
  { name: "WebSocket", regex: /\bWebSocket\b/ },
  { name: "sendBeacon", regex: /\bsendBeacon\s*\(/ },
  { name: "eval", regex: /\beval\s*\(/ },
  { name: "Function constructor", regex: /\bnew\s+Function\s*\(/ },
  { name: "remote script source", regex: /<script[^>]+src=["']https?:\/\//i },
  { name: "remote stylesheet", regex: /<link[^>]+href=["']https?:\/\//i }
];

for (const file of textFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.regex.test(source)) failures.push(`${path.relative(root, file)} contains forbidden ${rule.name}`);
  }
}

const content = fs.readFileSync(path.join(extension, "content.js"), "utf8");
if (/data-message-author-role|conversation-turn|\.innerText|textContent\s*\)/.test(content)) {
  failures.push("content script contains a conversation-content selector or extraction pattern");
}

if (failures.length) {
  console.error("SAL static audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SAL static audit passed");
console.log(`- permissions: ${expectedPermissions.join(", ")}`);
console.log(`- host permissions: ${[...expectedHosts].join(", ")}`);
console.log(`- scanned files: ${textFiles.length}`);
console.log("- network/eval primitives: none detected");
console.log("- conversation extraction patterns: none detected");
