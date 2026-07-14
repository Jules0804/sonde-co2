import assert from "node:assert/strict";
import test from "node:test";
import { VentilationController } from "../src/controller.js";
import { SERVICE_ACTION, SERVICE_STATE, ServiceAccess } from "../src/service-access.js";

function update(service, nowMs, extra = {}) {
  return service.update({ nowMs, buttonPressed: false, wifiEvent: null, closeRequested: false, ...extra });
}

test("exige un appui continu de trois secondes et ne redéclenche pas avant relâchement", () => {
  const service = new ServiceAccess();
  assert.equal(update(service, 0, { buttonPressed: true }).state, SERVICE_STATE.OFF);
  assert.equal(update(service, 2999, { buttonPressed: true }).state, SERVICE_STATE.OFF);
  const triggered = update(service, 3000, { buttonPressed: true });
  assert.equal(triggered.state, SERVICE_STATE.STARTING);
  assert.deepEqual(triggered.actions, [SERVICE_ACTION.START_WIFI]);
  assert.deepEqual(update(service, 4000, { buttonPressed: true }).actions, []);
});

test("accorde quinze minutes seulement après le démarrage réel du Wi-Fi", () => {
  const service = new ServiceAccess();
  update(service, 0, { buttonPressed: true });
  update(service, 3000, { buttonPressed: true });
  const active = update(service, 4500, { buttonPressed: false, wifiEvent: "STARTED" });
  assert.equal(active.state, SERVICE_STATE.ACTIVE);
  assert.equal(active.remainingMs, 15 * 60_000);
  assert.equal(update(service, 4500 + 899_999).state, SERVICE_STATE.ACTIVE);
  const expired = update(service, 4500 + 900_000);
  assert.equal(expired.state, SERVICE_STATE.STOPPING);
  assert.deepEqual(expired.actions, [SERVICE_ACTION.STOP_WIFI]);
});

test("ferme volontairement, attend l'arrêt radio puis invalide toutes les sessions", () => {
  const service = new ServiceAccess();
  update(service, 0, { buttonPressed: true });
  update(service, 3000, { buttonPressed: true });
  update(service, 3100, { buttonPressed: false, wifiEvent: "STARTED" });
  const closing = update(service, 5000, { closeRequested: true });
  assert.equal(closing.state, SERVICE_STATE.STOPPING);
  assert.deepEqual(closing.actions, [SERVICE_ACTION.STOP_WIFI]);
  const stopped = update(service, 5100, { wifiEvent: "STOPPED" });
  assert.equal(stopped.state, SERVICE_STATE.OFF);
  assert.equal(stopped.sessionGeneration, 1);
  assert.deepEqual(stopped.actions, [SERVICE_ACTION.INVALIDATE_SESSIONS]);
});

test("effectue un seul réessai puis déclare un défaut Wi-Fi non critique", () => {
  const service = new ServiceAccess({ maxStartAttempts: 2 });
  update(service, 0, { buttonPressed: true });
  const first = update(service, 3000, { buttonPressed: true });
  assert.equal(first.startAttempts, 1);
  const retry = update(service, 3100, { wifiEvent: "FAILED" });
  assert.equal(retry.state, SERVICE_STATE.STARTING);
  assert.equal(retry.startAttempts, 2);
  assert.deepEqual(retry.actions, [SERVICE_ACTION.START_WIFI]);
  const failed = update(service, 3200, { wifiEvent: "FAILED" });
  assert.equal(failed.state, SERVICE_STATE.FAULT);
  assert.equal(failed.fault, "WIFI_START_FAILED");
  assert.ok(failed.actions.includes(SERVICE_ACTION.INVALIDATE_SESSIONS));
});

test("réessaie après un arrêt radio inattendu sans prolonger silencieusement l'ancienne session", () => {
  const service = new ServiceAccess();
  update(service, 0, { buttonPressed: true });
  update(service, 3000, { buttonPressed: true });
  update(service, 3100, { buttonPressed: false, wifiEvent: "STARTED" });
  const interrupted = update(service, 6000, { wifiEvent: "STOPPED" });
  assert.equal(interrupted.state, SERVICE_STATE.STARTING);
  assert.equal(interrupted.sessionGeneration, 1);
  assert.equal(interrupted.fault, "WIFI_UNEXPECTED_STOP");
  assert.deepEqual(interrupted.actions, [SERVICE_ACTION.INVALIDATE_SESSIONS, SERVICE_ACTION.START_WIFI]);
});

test("le mode service ne modifie jamais directement la sortie de régulation", () => {
  const reference = new VentilationController();
  const withService = new VentilationController();
  const service = new ServiceAccess();
  update(service, 0, { buttonPressed: true });
  update(service, 3000, { buttonPressed: true });
  update(service, 3200, { buttonPressed: false, wifiEvent: "STARTED" });
  for (const timestampMs of [0, 5000, 10000, 15000]) {
    const input = { timestampSeconds: timestampMs / 1000, co2Ppm: 1100 };
    assert.deepEqual(withService.update(input), reference.update(input));
    update(service, timestampMs + 3200);
  }
});
