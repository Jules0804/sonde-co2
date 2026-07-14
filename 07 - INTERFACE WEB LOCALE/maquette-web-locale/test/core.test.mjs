import test from "node:test";
import assert from "node:assert/strict";
import { airQualityStatus, formatCountdown, outputToVoltage, presentEvent, validateConfig } from "../public/core.mjs";

test("accepte la configuration nominale", () => {
  assert.equal(validateConfig({ targetPpm: 1000, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500 }).ok, true);
});

test("le mode strict refuse les chaînes et les champs supplémentaires", () => {
  assert.equal(validateConfig({ targetPpm: "1000", minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500 }, { strict: true }).ok, false);
  assert.equal(validateConfig({ targetPpm: 1000, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500, inconnu: 1 }, { strict: true }).ok, false);
});

test("refuse une consigne hors plage", () => {
  const result = validateConfig({ targetPpm: 1600, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1800 });
  assert.equal(result.ok, false);
  assert.ok(result.errors.targetPpm);
});

test("refuse un minimum supérieur au maximum", () => {
  const result = validateConfig({ targetPpm: 1000, minOutputPct: 90, maxOutputPct: 80, highAlarmPpm: 1500 });
  assert.equal(result.ok, false);
  assert.ok(result.errors.minOutputPct);
});

test("refuse une alarme sous la consigne", () => {
  const result = validateConfig({ targetPpm: 1200, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1200 });
  assert.equal(result.ok, false);
  assert.ok(result.errors.highAlarmPpm);
});

test("classe les niveaux de CO2", () => {
  assert.equal(airQualityStatus(750).tone, "good");
  assert.equal(airQualityStatus(1000).tone, "attention");
  assert.equal(airQualityStatus(1300).tone, "warning");
  assert.equal(airQualityStatus(1600).tone, "danger");
});

test("formate le compte à rebours", () => {
  assert.equal(formatCountdown(65), "01:05");
  assert.equal(formatCountdown(-1), "00:00");
});

test("présente les événements sans reprendre de texte libre", () => {
  assert.deepEqual(presentEvent({ code: "TEST_STARTED", severity: "WARNING", source: "INSTALLER", count: 1, detail0: 255, detail1: 60, message: "à ne pas afficher" }), {
    label: "Test actionneur démarré", severity: "WARNING", source: "Installateur", detail: "25,5 % pendant 60 s",
  });
  assert.equal(presentEvent({ code: "INCONNU", severity: "FAUSSE", source: "AUTRE", count: 1, message: "secret" }).label, "Événement technique inconnu");
  assert.equal(presentEvent({ code: "INCONNU", severity: "FAUSSE", source: "AUTRE", count: 1, message: "secret" }).detail, "");
});

test("convertit la commande en tension et la borne", () => {
  assert.equal(outputToVoltage(50), 5);
  assert.equal(outputToVoltage(120), 10);
  assert.equal(outputToVoltage(-20), 0);
});

test("distingue la fin automatique d'un test actionneur", () => {
  const event = presentEvent({ code: "TEST_STOPPED", severity: "INFO", source: "SYSTEM", count: 1, detail0: 1, detail1: 0 });
  assert.equal(event.detail, "Fin automatique");
});
