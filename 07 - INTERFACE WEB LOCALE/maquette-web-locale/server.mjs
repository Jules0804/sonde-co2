import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateConfig } from "./public/core.mjs";
import { EventLog } from "../../06 - LOGICIEL EMBARQUE/simulateur/src/history-log.js";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const ROLE_LEVEL = { viewer: 0, installer: 1, admin: 2 };

function createSecurityState(options = {}) {
  const sessionDurationMs = options.sessionDurationMs ?? 15 * 60_000;
  const lockDurationMs = options.lockDurationMs ?? 30_000;
  const maxFailures = options.maxFailures ?? 5;
  const accountInputs = options.accounts ?? {
    installateur: { password: process.env.VENT_CO2_INSTALLER_PASSWORD || "installateur123", role: "installer" },
    administrateur: { password: process.env.VENT_CO2_ADMIN_PASSWORD || "administrateur123", role: "admin" },
  };
  const accounts = new Map(Object.entries(accountInputs).map(([username, account]) => {
    const salt = randomBytes(16);
    return [username, { role: account.role, salt, verifier: scryptSync(account.password, salt, 32) }];
  }));
  const dummySalt = randomBytes(16);
  return {
    accounts,
    dummySalt,
    dummyVerifier: scryptSync("mot-de-passe-factice", dummySalt, 32),
    sessions: new Map(),
    failures: new Map(),
    sessionDurationMs,
    lockDurationMs,
    maxFailures,
  };
}

function clientKey(request) {
  return request.socket.remoteAddress || "client-inconnu";
}

function bearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.authorization || "");
  return match?.[1] || null;
}

function currentSession(request, security) {
  const token = bearerToken(request);
  if (!token) return null;
  const session = security.sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    security.sessions.delete(token);
    return null;
  }
  return { ...session, token };
}

function authorize(request, response, security, minimumRole, requireCsrf = false) {
  const session = currentSession(request, security);
  if (!session) {
    json(response, 401, { code: "AUTH_REQUIRED", message: "Connexion requise." }, { "WWW-Authenticate": "Bearer" });
    return null;
  }
  if ((ROLE_LEVEL[session.role] ?? -1) < ROLE_LEVEL[minimumRole]) {
    json(response, 403, { code: "FORBIDDEN", message: "Droits insuffisants." });
    return null;
  }
  if (requireCsrf && request.headers["x-csrf-token"] !== session.csrfToken) {
    json(response, 403, { code: "CSRF_REQUIRED", message: "Jeton de confirmation absent ou invalide." });
    return null;
  }
  return session;
}

function createControllerState(options = {}) {
  const now = options.now ?? Date.now;
  const initialNow = now();
  const history = Array.from({ length: 49 }, (_, index) => {
    const phase = index / 48;
    const occupied = Math.sin(phase * Math.PI * 2 - 1.2) > 0;
    const co2Ppm = Math.round(620 + (occupied ? 510 * Math.sin(phase * Math.PI * 2 - 1.2) : 0) + 35 * Math.sin(index * .9));
    const safeCo2 = Math.max(520, co2Ppm);
    return {
      timestamp: new Date(initialNow - (48 - index) * 30 * 60_000).toISOString(),
      co2Ppm: safeCo2,
      outputPct: Number(Math.max(20, Math.min(78, 20 + (safeCo2 - 760) * .08)).toFixed(1)),
      state: "AUTO",
      fault: null,
    };
  });
  const state = {
    now,
    bootedAt: initialNow,
    bootId: 1,
    co2Ppm: 824,
    outputPct: 28,
    config: { targetPpm: 1000, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500 },
    configRevision: 1,
    test: null,
    history,
    eventLog: new EventLog({ capacity: 512 }),
  };
  appendEvent(state, "BOOT", "INFO", "SYSTEM");
  return state;
}

function appendEvent(state, code, severity, source, detail0 = 0, detail1 = 0) {
  const now = state.now();
  return state.eventLog.add({
    epochSeconds: Math.floor(now / 1000),
    uptimeSeconds: Math.floor((now - state.bootedAt) / 1000),
    bootId: state.bootId,
    code, severity, source, detail0, detail1,
  });
}

function evolve(state) {
  if (state.test && state.test.endsAt <= state.now()) {
    state.test = null;
    state.outputPct = Math.max(state.config.minOutputPct, 20);
    appendEvent(state, "TEST_STOPPED", "INFO", "SYSTEM", 1);
  }
  if (state.test) {
    state.outputPct = state.test.outputPct;
    return;
  }
  state.co2Ppm = Math.max(520, Math.min(1680, state.co2Ppm + (Math.random() - .47) * 24));
  const desired = Math.max(state.config.minOutputPct,
    Math.min(state.config.maxOutputPct, state.config.minOutputPct + (state.co2Ppm - state.config.targetPpm) * .09));
  state.outputPct += Math.max(-2, Math.min(3, desired - state.outputPct));
}

function statusPayload(state) {
  evolve(state);
  return {
    timestamp: new Date(state.now()).toISOString(),
    co2Ppm: Math.round(state.co2Ppm),
    outputPct: Number(state.outputPct.toFixed(1)),
    outputVolts: Number((state.outputPct / 10).toFixed(2)),
    mode: state.test ? "TEST" : "AUTO",
    fault: null,
    sensor: { state: "VALID", ageSeconds: 1, temperatureC: 21.8, humidityPct: 47 },
    test: state.test ? { outputPct: state.test.outputPct, endsAt: new Date(state.test.endsAt).toISOString() } : null,
    uptimeSeconds: Math.floor((state.now() - state.bootedAt) / 1000),
  };
}

function securityHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  };
}

function json(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    ...securityHeaders("application/json; charset=utf-8"),
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  if (!(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    throw Object.assign(new Error("Content-Type application/json requis"), { status: 415 });
  }
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_768) throw Object.assign(new Error("Payload too large"), { status: 413 });
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    throw Object.assign(new Error("JSON invalide"), { status: 400 });
  }
}

async function login(request, response, security, state) {
  const key = clientKey(request);
  const failure = security.failures.get(key);
  if (failure?.lockedUntil > Date.now()) {
    const retryAfter = Math.ceil((failure.lockedUntil - Date.now()) / 1000);
    return json(response, 429, { code: "LOGIN_LOCKED", message: "Trop de tentatives. Réessayer plus tard.", retryAfterSeconds: retryAfter }, { "Retry-After": String(retryAfter) });
  }
  const body = await readJson(request);
  const username = typeof body.username === "string" ? body.username.trim().slice(0, 64) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 128) : "";
  const account = security.accounts.get(username);
  const candidate = scryptSync(password, account?.salt ?? security.dummySalt, 32);
  const valid = timingSafeEqual(candidate, account?.verifier ?? security.dummyVerifier);
  if (!valid) {
    const count = (failure?.count ?? 0) + 1;
    security.failures.set(key, {
      count,
      lockedUntil: count >= security.maxFailures ? Date.now() + security.lockDurationMs : 0,
    });
    appendEvent(state, "LOGIN_FAILED", "WARNING", "SYSTEM");
    return json(response, 401, { code: "INVALID_CREDENTIALS", message: "Identifiant ou mot de passe incorrect." });
  }
  security.failures.delete(key);
  const token = randomBytes(32).toString("base64url");
  const session = {
    username,
    role: account.role,
    csrfToken: randomBytes(24).toString("base64url"),
    expiresAt: Date.now() + security.sessionDurationMs,
  };
  security.sessions.set(token, session);
  appendEvent(state, "SESSION_OPENED", "INFO", account.role === "admin" ? "ADMIN" : "INSTALLER");
  return json(response, 200, { token, ...session, expiresAt: new Date(session.expiresAt).toISOString() });
}

async function handleApi(request, response, state, security, pathname) {
  if (request.method === "GET" && pathname === "/api/v1/status") return json(response, 200, statusPayload(state));
  if (request.method === "GET" && pathname === "/api/v1/history") return json(response, 200, { periodSeconds: 1800, samples: state.history });
  if (request.method === "DELETE" && pathname === "/api/v1/history") {
    const session = authorize(request, response, security, "admin", true);
    if (!session) return;
    const deletedSamples = state.history.length;
    state.history = [];
    appendEvent(state, "HISTORY_CLEARED", "WARNING", "ADMIN", deletedSamples);
    return json(response, 200, { cleared: true, deletedSamples });
  }
  if (request.method === "GET" && pathname === "/api/v1/events") {
    if (!authorize(request, response, security, "installer")) return;
    return json(response, 200, { events: state.eventLog.latest(200) });
  }
  if (request.method === "POST" && pathname === "/api/v1/session") return login(request, response, security, state);
  if (request.method === "GET" && pathname === "/api/v1/session") {
    const session = authorize(request, response, security, "installer");
    if (!session) return;
    return json(response, 200, { username: session.username, role: session.role, csrfToken: session.csrfToken, expiresAt: new Date(session.expiresAt).toISOString() });
  }
  if (request.method === "DELETE" && pathname === "/api/v1/session") {
    const session = authorize(request, response, security, "installer", true);
    if (!session) return;
    security.sessions.delete(session.token);
    appendEvent(state, "SESSION_CLOSED", "INFO", session.role === "admin" ? "ADMIN" : "INSTALLER");
    return json(response, 200, { disconnected: true });
  }
  if (request.method === "GET" && pathname === "/api/v1/config") {
    if (!authorize(request, response, security, "installer")) return;
    return json(response, 200, { ...state.config, revision: state.configRevision }, { ETag: `"${state.configRevision}"` });
  }
  if (request.method === "PUT" && pathname === "/api/v1/config") {
    const session = authorize(request, response, security, "installer", true);
    if (!session) return;
    const ifMatch = request.headers["if-match"];
    if (!ifMatch) return json(response, 428, { code: "REVISION_REQUIRED", message: "Révision de configuration requise." });
    if (ifMatch !== `"${state.configRevision}"`) {
      return json(response, 409, { code: "REVISION_CONFLICT", message: "La configuration a changé. Relire avant de modifier.", currentRevision: state.configRevision });
    }
    const candidate = await readJson(request);
    const validation = validateConfig(candidate, { strict: true });
    if (!validation.ok) return json(response, 422, { code: "INVALID_CONFIG", errors: validation.errors });
    state.config = {
      targetPpm: candidate.targetPpm,
      minOutputPct: candidate.minOutputPct,
      maxOutputPct: candidate.maxOutputPct,
      highAlarmPpm: candidate.highAlarmPpm,
    };
    state.configRevision = (state.configRevision + 1) >>> 0;
    appendEvent(state, "CONFIG_CHANGED", "INFO", session.role === "admin" ? "ADMIN" : "INSTALLER", state.configRevision);
    return json(response, 200, { ...state.config, revision: state.configRevision }, { ETag: `"${state.configRevision}"` });
  }
  if (request.method === "POST" && pathname === "/api/v1/output-test") {
    const session = authorize(request, response, security, "installer", true);
    if (!session) return;
    const body = await readJson(request);
    const outputPct = Number(body.outputPct);
    const durationSeconds = Number(body.durationSeconds ?? 60);
    if (![0, 25, 50, 75, 100].includes(outputPct) || !Number.isInteger(durationSeconds) || durationSeconds < 5 || durationSeconds > 600) {
      return json(response, 422, { code: "INVALID_TEST", message: "Sortie ou durée de test invalide." });
    }
    state.test = { outputPct, endsAt: state.now() + durationSeconds * 1000 };
    state.outputPct = outputPct;
    appendEvent(state, "TEST_STARTED", "WARNING", session.role === "admin" ? "ADMIN" : "INSTALLER", Math.round(outputPct * 10), durationSeconds);
    return json(response, 200, statusPayload(state));
  }
  if (request.method === "DELETE" && pathname === "/api/v1/output-test") {
    const session = authorize(request, response, security, "installer", true);
    if (!session) return;
    state.test = null;
    state.outputPct = Math.max(state.config.minOutputPct, 20);
    appendEvent(state, "TEST_STOPPED", "INFO", session.role === "admin" ? "ADMIN" : "INSTALLER");
    return json(response, 200, statusPayload(state));
  }
  json(response, 404, { code: "NOT_FOUND", message: "Endpoint inconnu." });
}

export function createAppServer(options = {}) {
  const state = createControllerState({ now: options.controllerNow });
  const security = createSecurityState(options.security);
  return createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname);
    try {
      if (pathname.startsWith("/api/")) {
        await handleApi(request, response, state, security, pathname);
        return;
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const candidate = normalize(join(root, relative));
      if (!candidate.startsWith(root)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const content = await readFile(candidate);
      response.writeHead(200, {
        ...securityHeaders(mime[extname(candidate)] || "application/octet-stream"),
      });
      response.end(content);
    } catch (error) {
      if (pathname.startsWith("/api/")) json(response, error.status || 500, { code: "REQUEST_ERROR", message: error.message });
      else {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Introuvable");
      }
    }
  });
}

const launchedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (launchedDirectly) {
  const port = Number(process.env.PORT || 4173);
  createAppServer().listen(port, "127.0.0.1", () => {
    console.log(`Prototype PWA disponible sur http://127.0.0.1:${port}`);
    console.log("Comptes demo : installateur / installateur123 ; administrateur / administrateur123");
  });
}
