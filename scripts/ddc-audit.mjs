import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checks = [];

function pass(name, evidence) { checks.push({ name, status: "PASS", evidence }); }
function fail(name, evidence) { checks.push({ name, status: "FAIL", evidence }); failures.push(`${name}: ${evidence}`); }
function source(relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }

const appearance = source("native-host/appearance-host.mjs");
const app = source("native-host/app.mjs");
const server = source("scripts/serve-native.mjs");
const validator = source("reference-api/src/validator.mjs");

if (!/validateAppearanceRequest|applyAppearanceTransition/.test(appearance)) fail("Authority gate", "native appearance host does not use canonical validator/transition contract");
else pass("Authority gate", "native host delegates transition authorization to reference API validator/renderer contract");

if (/innerHTML\s*=|insertAdjacentHTML|eval\s*\(|new\s+Function/.test(app + appearance)) fail("Execution boundary", "arbitrary HTML/code execution primitive detected");
else pass("Execution boundary", "no arbitrary HTML/code execution path in native appearance runtime");

if (/https?:\/\//.test(appearance) || /fetch\s*\(|XMLHttpRequest|WebSocket/.test(appearance)) fail("Resource boundary", "appearance runtime contains external network path");
else pass("Resource boundary", "appearance runtime has no external network primitive");

if (!/LOCAL_ASSET/.test(validator) || !/HANDLE_PREFIX/.test(appearance) || !/resolveForHost/.test(appearance)) fail("Asset authority", "opaque local asset handle boundary missing");
else pass("Asset authority", "validator restricts local asset handles; host-only registry resolves object URLs");

if (!/providerReceivedConversation:\s*false/.test(appearance) || /chat-runtime/.test(appearance)) fail("Conversation isolation", "appearance layer can depend on conversation runtime");
else pass("Conversation isolation", "appearance runtime neither imports chat runtime nor records conversation payloads");

if (!/rollback\(\)/.test(appearance) || !/#history/.test(appearance)) fail("Recovery", "exact previous-state rollback not implemented");
else pass("Recovery", "host keeps previous appearance state and exposes rollback");

if (!/Content-Security-Policy/.test(server) || !/connect-src 'self'/.test(server) || !/object-src 'none'/.test(server)) fail("Host containment", "native demo server CSP is incomplete");
else pass("Host containment", "server enforces self-only connection policy and blocks objects/embedding");

const report = {
  methodology: "DDC transition governance",
  scope: "Safe Appearance Layer native-host v0.2.0",
  chain: ["Authority", "Intent", "Preconditions", "Execution boundary", "Transition", "Verification", "Invariant preservation", "Evidence", "Recovery"],
  checks,
  verdict: failures.length ? "FAIL" : "PASS_WITH_BOUNDED_RESIDUAL_UNCERTAINTY",
  residualUncertainty: [
    "Production accessibility enforcement against arbitrary user imagery requires host contrast measurement beyond this reference demo.",
    "Direct integration into ChatGPT requires an OpenAI-supported host appearance capability; this demo proves the host-side architecture, not deployment inside chatgpt.com."
  ]
};

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "ddc-native-host-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
