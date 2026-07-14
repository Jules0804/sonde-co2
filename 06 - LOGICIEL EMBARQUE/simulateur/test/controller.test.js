import test from "node:test";
import assert from "node:assert/strict";
import { Fault, State, VentilationController } from "../src/controller.js";

function run(controller, values, step = 5) {
  let result;
  values.forEach((co2Ppm, index) => {
    result = controller.update({ timestampSeconds: index * step, co2Ppm });
  });
  return result;
}

test("reste ouvert pendant le démarrage puis entre en AUTO", () => {
  const c = new VentilationController({ startupValidSeconds: 10 });
  assert.equal(c.update({ timestampSeconds: 0, co2Ppm: 500 }).state, State.STARTUP);
  assert.equal(c.update({ timestampSeconds: 5, co2Ppm: 500 }).state, State.STARTUP);
  const result = c.update({ timestampSeconds: 10, co2Ppm: 500 });
  assert.equal(result.state, State.AUTO);
  assert.equal(result.fault, Fault.NONE);
});

test("tend vers le minimum quand le CO2 reste bas", () => {
  const c = new VentilationController({ startupValidSeconds: 5 });
  const result = run(c, Array(130).fill(500));
  assert.equal(result.state, State.AUTO);
  assert.ok(result.outputPct <= 25, `sortie=${result.outputPct}`);
  assert.ok(result.outputPct >= 20);
});

test("augmente la ventilation quand le CO2 dépasse la cible", () => {
  const c = new VentilationController({ startupValidSeconds: 5, highAlarmDelaySeconds: 9999 });
  run(c, Array(100).fill(700));
  const lowOutput = c.snapshot().outputPct;
  const result = run(c, Array(100).fill(1300));
  assert.equal(result.state, State.AUTO);
  assert.ok(result.outputPct > lowOutput + 20, `bas=${lowOutput}, haut=${result.outputPct}`);
});

test("ouvre immédiatement sur défaut de plage", () => {
  const c = new VentilationController();
  c.update({ timestampSeconds: 0, co2Ppm: 600 });
  const result = c.update({ timestampSeconds: 5, co2Ppm: 9999 });
  assert.equal(result.state, State.FAULT);
  assert.equal(result.fault, Fault.SENSOR_RANGE);
  assert.equal(result.outputPct, 100);
});

test("ouvre sur absence prolongée de sonde", () => {
  const c = new VentilationController({ sensorTimeoutSeconds: 10 });
  c.update({ timestampSeconds: 0, co2Ppm: 600 });
  c.update({ timestampSeconds: 5, co2Ppm: null });
  const result = c.update({ timestampSeconds: 10, co2Ppm: null });
  assert.equal(result.state, State.FAULT);
  assert.equal(result.fault, Fault.SENSOR_MISSING);
  assert.equal(result.outputPct, 100);
});

test("la commande forcée est prioritaire", () => {
  const c = new VentilationController();
  const result = c.update({ timestampSeconds: 0, co2Ppm: 500, forceOpen: true });
  assert.equal(result.state, State.FORCE_OPEN);
  assert.equal(result.outputPct, 100);
});

test("déclenche l'alarme CO2 élevé après temporisation", () => {
  const c = new VentilationController({
    startupValidSeconds: 5,
    filterTauSeconds: 1,
    highAlarmPpm: 1500,
    highAlarmDelaySeconds: 15,
  });
  const result = run(c, Array(8).fill(1800), 5);
  assert.equal(result.state, State.FAULT);
  assert.equal(result.fault, Fault.HIGH_CO2);
  assert.equal(result.outputPct, 100);
});
