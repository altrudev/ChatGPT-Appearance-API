import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension", "manifest.json"), "utf8"));
const version = String(manifest.version || "dev").replace(/[^0-9A-Za-z._-]/g, "-");

fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, `sal-chatgpt-reference-client-v${version}.zip`);
if (fs.existsSync(out)) fs.unlinkSync(out);
execFileSync("zip", ["-q", "-r", out, "extension"], { cwd: root });
console.log(out);
