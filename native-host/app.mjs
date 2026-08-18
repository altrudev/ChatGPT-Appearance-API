import { NativeAppearanceHost, appearanceStateToHostTokens, createLocalAssetRegistry } from "./appearance-host.mjs";
import { DemoConversation } from "./chat-runtime.mjs";
import { HOSTILE_REQUEST, THEMES, localImageTheme } from "./themes.mjs";

const host = new NativeAppearanceHost();
const assets = createLocalAssetRegistry();
const chat = new DemoConversation();
let pendingRequest = null;

const $ = (selector) => document.querySelector(selector);
const hostRoot = $("#nativeHost");
const messageList = $("#messages");
const evidenceBox = $("#evidence");
const capabilityList = $("#capabilityList");
const approvalDialog = $("#approvalDialog");
const approvalTitle = $("#approvalTitle");
const transitionStatus = $("#transitionStatus");

function renderAppearance(state = host.getState()) {
  const tokens = appearanceStateToHostTokens(state, assets.resolveForHost);
  for (const [name, value] of Object.entries(tokens)) hostRoot.style.setProperty(name, value);
  document.documentElement.dataset.salNativeReady = "true";
}

function renderEvidence(evidence = host.getEvidence().at(-1) || { status: "ready", policyVersion: "sal-native-host-policy/0.2" }) {
  evidenceBox.textContent = JSON.stringify(evidence, null, 2);
  transitionStatus.textContent = evidence.status || "ready";
  transitionStatus.dataset.status = evidence.status || "ready";
}

function renderMessages() {
  messageList.replaceChildren(...chat.getMessages().map((message) => {
    const article = document.createElement("article");
    article.className = `message ${message.role}`;
    const role = document.createElement("strong");
    role.textContent = message.role === "assistant" ? "Host assistant" : "You";
    const body = document.createElement("p");
    body.textContent = message.text;
    article.append(role, body);
    return article;
  }));
  messageList.scrollTop = messageList.scrollHeight;
}

function askApproval(request) {
  pendingRequest = request;
  approvalTitle.textContent = `Approve ${request.themeId}?`;
  capabilityList.replaceChildren(...request.capabilities.map((capability) => {
    const li = document.createElement("li");
    li.textContent = capability;
    return li;
  }));
  approvalDialog.showModal();
}

function applyApproved() {
  if (!pendingRequest) return;
  const result = host.requestTransition(pendingRequest);
  pendingRequest = null;
  approvalDialog.close();
  renderAppearance(result.state);
  renderEvidence(result.evidence);
}

$("#themeSoftGlass").addEventListener("click", () => askApproval(THEMES.softGlass));
$("#themeMidnight").addEventListener("click", () => askApproval(THEMES.midnight));
$("#approve").addEventListener("click", applyApproved);
$("#deny").addEventListener("click", () => { pendingRequest = null; approvalDialog.close(); });

$("#hostile").addEventListener("click", () => {
  const result = host.requestTransition(HOSTILE_REQUEST);
  renderAppearance(result.state);
  renderEvidence(result.evidence);
});

$("#rollback").addEventListener("click", () => {
  const result = host.rollback();
  renderAppearance(result.state);
  renderEvidence(result.evidence);
});

$("#imageInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const registered = assets.registerFile(file);
    askApproval(localImageTheme(registered.handle));
  } catch (error) {
    renderEvidence({ status: "rejected-local-asset", error: error.message, conversationContentAccessed: false });
  }
});

$("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chatInput");
  chat.send(input.value);
  input.value = "";
  renderMessages();
});

window.addEventListener("beforeunload", () => assets.clear());

renderAppearance();
renderEvidence();
renderMessages();
