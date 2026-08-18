import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, "sal-chatgpt-reference-client-v0.1.0.zip");
if (fs.existsSync(out)) fs.unlinkSync(out);
execFileSync("zip", ["-q", "-r", out, "extension"], { cwd: root });
console.log(out);
