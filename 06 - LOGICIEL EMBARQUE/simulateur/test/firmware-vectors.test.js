import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { VentilationController } from "../src/controller.js";
import { ServiceAccess } from "../src/service-access.js";

const artifactPath = resolve("../firmware-esp32/test/vectors/controller_vectors.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const serviceArtifactPath = resolve("../firmware-esp32/test/vectors/service_access_vectors.json");
const serviceArtifact = JSON.parse(await readFile(serviceArtifactPath, "utf8"));

test("le fichier de vecteurs possède le schéma et les scénarios requis", () => {
  assert.equal(artifact.schemaVersion, 1);
  const names = artifact.scenarios.map((scenario) => scenario.name);
  for (const required of ["startup_to_auto", "rising_co2", "missing_sensor", "range_fault", "force_open", "high_co2_alarm"]) {
    assert.ok(names.includes(required), required);
  }
});

for (const scenario of artifact.scenarios) {
  test(`rejoue le vecteur firmware ${scenario.name}`, () => {
    const controller = new VentilationController(scenario.config);
    for (const [index, step] of scenario.steps.entries()) {
      assert.deepEqual(controller.update(step.input), step.expected, `${scenario.name} étape ${index}`);
    }
  });
}

test("le fichier de vecteurs service possède les scénarios requis", () => {
  assert.equal(serviceArtifact.schemaVersion, 1);
  const names = serviceArtifact.scenarios.map((scenario) => scenario.name);
  for (const required of ["button_then_manual_close", "automatic_expiry", "start_retry_then_fault", "unexpected_stop_and_recovery"]) {
    assert.ok(names.includes(required), required);
  }
});

for (const scenario of serviceArtifact.scenarios) {
  test(`rejoue le vecteur service ${scenario.name}`, () => {
    const service = new ServiceAccess(scenario.config);
    for (const [index, step] of scenario.steps.entries()) {
      assert.deepEqual(service.update(step.input), step.expected, `${scenario.name} étape ${index}`);
    }
  });
}
