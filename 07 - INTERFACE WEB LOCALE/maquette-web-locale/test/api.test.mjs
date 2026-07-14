import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createAppServer } from "../server.mjs";

let server;
let baseUrl;
let session;

before(async () => {
  server = createAppServer({
    security: {
      accounts: {
        installateur: { password: "mot-de-passe-test", role: "installer" },
        administrateur: { password: "mot-de-passe-admin", role: "admin" },
      },
      lockDurationMs: 1000,
    },
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function api(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { response, body: await response.json() };
}

function authenticated(method = "GET", body, csrf = true, extraHeaders = {}) {
  return {
    method,
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(csrf && !["GET", "HEAD"].includes(method) ? { "X-CSRF-Token": session.csrfToken } : {}),
      ...extraHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

test("sert la PWA et ses ressources essentielles", async () => {
  for (const path of ["/", "/styles.css", "/app.js", "/api-client.mjs", "/manifest.webmanifest", "/sw.js"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text|javascript|json|manifest/);
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  }
});

test("retourne un état instantané cohérent", async () => {
  const { response, body } = await api("/api/v1/status");
  assert.equal(response.status, 200);
  assert.ok(body.co2Ppm >= 350 && body.co2Ppm <= 5000);
  assert.ok(body.outputPct >= 0 && body.outputPct <= 100);
  assert.ok(body.outputVolts >= 0 && body.outputVolts <= 10);
  assert.equal(body.sensor.state, "VALID");
});

test("retourne 24 heures d’historique simulé", async () => {
  const { response, body } = await api("/api/v1/history");
  assert.equal(response.status, 200);
  assert.equal(body.samples.length, 49);
  assert.equal(body.periodSeconds, 1800);
  assert.ok(Date.parse(body.samples[0].timestamp));
});

test("protège le journal technique sans session", async () => {
  const { response, body } = await api("/api/v1/events");
  assert.equal(response.status, 401);
  assert.equal(body.code, "AUTH_REQUIRED");
});

test("refuse la configuration sans session", async () => {
  const { response, body } = await api("/api/v1/config");
  assert.equal(response.status, 401);
  assert.equal(body.code, "AUTH_REQUIRED");
});

test("refuse un mot de passe incorrect sans révéler le compte", async () => {
  const { response, body } = await api("/api/v1/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "installateur", password: "incorrect" }),
  });
  assert.equal(response.status, 401);
  assert.equal(body.code, "INVALID_CREDENTIALS");
  assert.doesNotMatch(body.message, /installateur/i);
});

test("ouvre une session installateur temporaire", async () => {
  const result = await api("/api/v1/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "installateur", password: "mot-de-passe-test" }),
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.role, "installer");
  assert.ok(result.body.token.length >= 32);
  assert.ok(result.body.csrfToken.length >= 24);
  session = result.body;
});

test("exige un jeton anti-CSRF sur une écriture authentifiée", async () => {
  const config = { targetPpm: 950, minOutputPct: 25, maxOutputPct: 90, highAlarmPpm: 1450 };
  const { response, body } = await api("/api/v1/config", authenticated("PUT", config, false));
  assert.equal(response.status, 403);
  assert.equal(body.code, "CSRF_REQUIRED");
});

test("exige la révision lue avant de modifier la configuration", async () => {
  const config = { targetPpm: 950, minOutputPct: 25, maxOutputPct: 90, highAlarmPpm: 1450 };
  const { response, body } = await api("/api/v1/config", authenticated("PUT", config));
  assert.equal(response.status, 428);
  assert.equal(body.code, "REVISION_REQUIRED");
});

test("accepte et relit une configuration valide", async () => {
  const config = { targetPpm: 950, minOutputPct: 25, maxOutputPct: 90, highAlarmPpm: 1450 };
  const updated = await api("/api/v1/config", authenticated("PUT", config, true, { "If-Match": '"1"' }));
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.targetPpm, 950);
  assert.equal(updated.body.revision, 2);
  const current = await api("/api/v1/config", authenticated());
  assert.equal(current.body.minOutputPct, 25);
});

test("refuse une écriture basée sur une ancienne révision", async () => {
  const config = { targetPpm: 1050, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500 };
  const { response, body } = await api("/api/v1/config", authenticated("PUT", config, true, { "If-Match": '"1"' }));
  assert.equal(response.status, 409);
  assert.equal(body.code, "REVISION_CONFLICT");
  assert.equal(body.currentRevision, 2);
});

test("refuse une configuration dangereuse", async () => {
  const invalid = { targetPpm: 1600, minOutputPct: 90, maxOutputPct: 80, highAlarmPpm: 1200 };
  const { response, body } = await api("/api/v1/config", authenticated("PUT", invalid, true, { "If-Match": '"2"' }));
  assert.equal(response.status, 422);
  assert.equal(body.code, "INVALID_CONFIG");
  assert.ok(body.errors.targetPpm);
});

test("refuse un champ supplémentaire même si les valeurs principales sont valides", async () => {
  const candidate = { targetPpm: 1000, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500, inconnu: 1 };
  const { response, body } = await api("/api/v1/config", authenticated("PUT", candidate, true, { "If-Match": '"2"' }));
  assert.equal(response.status, 422);
  assert.equal(body.code, "INVALID_CONFIG");
  assert.ok(body.errors._schema);
});

test("démarre puis arrête un test actionneur", async () => {
  const started = await api("/api/v1/output-test", authenticated("POST", { outputPct: 75, durationSeconds: 60 }));
  assert.equal(started.response.status, 200);
  assert.equal(started.body.mode, "TEST");
  assert.equal(started.body.outputPct, 75);
  const stopped = await api("/api/v1/output-test", authenticated("DELETE"));
  assert.equal(stopped.response.status, 200);
  assert.equal(stopped.body.mode, "AUTO");
});

test("refuse un test hors bornes", async () => {
  const { response, body } = await api("/api/v1/output-test", authenticated("POST", { outputPct: 37, durationSeconds: 1000 }));
  assert.equal(response.status, 422);
  assert.equal(body.code, "INVALID_TEST");
});

test("journalise le retour automatique en AUTO a l'expiration", async () => {
  let now = Date.now();
  const automaticServer = createAppServer({
    controllerNow: () => now,
    security: { accounts: { installateur: { password: "test", role: "installer" } } },
  });
  await new Promise((resolve, reject) => {
    automaticServer.once("error", reject);
    automaticServer.listen(0, "127.0.0.1", resolve);
  });
  const automaticBaseUrl = `http://127.0.0.1:${automaticServer.address().port}`;
  try {
    const loginResponse = await fetch(`${automaticBaseUrl}/api/v1/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "installateur", password: "test" }),
    });
    const automaticSession = await loginResponse.json();
    const headers = {
      Authorization: `Bearer ${automaticSession.token}`,
      "Content-Type": "application/json",
      "X-CSRF-Token": automaticSession.csrfToken,
    };
    const started = await fetch(`${automaticBaseUrl}/api/v1/output-test`, {
      method: "POST",
      headers,
      body: JSON.stringify({ outputPct: 50, durationSeconds: 5 }),
    });
    assert.equal((await started.json()).mode, "TEST");
    now += 5_001;
    const status = await fetch(`${automaticBaseUrl}/api/v1/status`);
    assert.equal((await status.json()).mode, "AUTO");
    const events = await fetch(`${automaticBaseUrl}/api/v1/events`, {
      headers: { Authorization: `Bearer ${automaticSession.token}` },
    });
    const stopped = (await events.json()).events.find((event) => event.code === "TEST_STOPPED");
    assert.equal(stopped.source, "SYSTEM");
    assert.equal(stopped.detail0, 1);
  } finally {
    await new Promise((resolve) => automaticServer.close(resolve));
  }
});

test("retourne un journal technique structuré sans identifiant ni texte libre", async () => {
  const { response, body } = await api("/api/v1/events", authenticated());
  assert.equal(response.status, 200);
  const codes = body.events.map((item) => item.code);
  for (const expected of ["BOOT", "LOGIN_FAILED", "SESSION_OPENED", "CONFIG_CHANGED", "TEST_STARTED", "TEST_STOPPED"]) assert.ok(codes.includes(expected), expected);
  for (const item of body.events) {
    assert.equal(Object.hasOwn(item, "username"), false);
    assert.equal(Object.hasOwn(item, "message"), false);
    assert.equal(Object.hasOwn(item, "secret"), false);
  }
});

test("reserve l'effacement de l'historique a l'administrateur", async () => {
  const before = await api("/api/v1/history");
  assert.equal(before.response.status, 200);
  assert.ok(before.body.samples.length > 0);

  const installerAttempt = await api("/api/v1/history", authenticated("DELETE"));
  assert.equal(installerAttempt.response.status, 403);
  assert.equal(installerAttempt.body.code, "FORBIDDEN");

  const adminLogin = await api("/api/v1/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "administrateur", password: "mot-de-passe-admin" }),
  });
  assert.equal(adminLogin.response.status, 200);
  session = adminLogin.body;

  const noCsrf = await api("/api/v1/history", authenticated("DELETE", null, false));
  assert.equal(noCsrf.response.status, 403);
  assert.equal(noCsrf.body.code, "CSRF_REQUIRED");

  const cleared = await api("/api/v1/history", authenticated("DELETE"));
  assert.equal(cleared.response.status, 200);
  assert.equal(cleared.body.cleared, true);
  assert.equal(cleared.body.deletedSamples, before.body.samples.length);

  const after = await api("/api/v1/history");
  assert.equal(after.response.status, 200);
  assert.equal(after.body.samples.length, 0);

  const events = await api("/api/v1/events", authenticated());
  const historyCleared = events.body.events.find((event) => event.code === "HISTORY_CLEARED");
  assert.equal(historyCleared.source, "ADMIN");
  assert.equal(historyCleared.detail0, before.body.samples.length);
});

test("le contrat OpenAPI est un JSON valide avec les endpoints requis", async () => {
  const contractPath = fileURLToPath(new URL("../../CONTRAT API LOCALE V0.1.json", import.meta.url));
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  assert.equal(contract.openapi, "3.1.0");
  for (const path of ["/status", "/config", "/history", "/events", "/output-test", "/session"]) assert.ok(contract.paths[path]);
  assert.ok(contract.paths["/history"].delete);
  assert.ok(contract.components.securitySchemes.bearerAuth);
});

test("ferme la session et invalide immédiatement le jeton", async () => {
  const closed = await api("/api/v1/session", authenticated("DELETE"));
  assert.equal(closed.response.status, 200);
  const after = await api("/api/v1/config", authenticated());
  assert.equal(after.response.status, 401);
});

test("limite les tentatives répétées de connexion", async () => {
  let result;
  for (let index = 0; index < 6; index += 1) {
    result = await api("/api/v1/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "inconnu", password: "incorrect" }),
    });
  }
  assert.equal(result.response.status, 429);
  assert.equal(result.body.code, "LOGIN_LOCKED");
});
