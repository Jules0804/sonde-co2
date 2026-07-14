import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  buildVelocityTable,
  circularAreaM2,
  evaluateActuatorPrecheck,
  recommendBenchDuct,
  velocityMs,
} from "./dimensionner-registre-banc.mjs";

const path = fileURLToPath(new URL("./HYPOTHESES AERAULIQUES BANC V0.1.json", import.meta.url));
const nominal = JSON.parse(await readFile(path, "utf8"));

test("calcule l'aire d'une gaine circulaire DN200", () => {
  assert.ok(Math.abs(circularAreaM2(200) - 0.031416) < 0.00001);
});

test("calcule environ 2.65 m/s a 300 m3/h en DN200", () => {
  assert.ok(Math.abs(velocityMs(300, 200) - 2.6526) < 0.001);
});

test("produit une table complete diametres x debits", () => {
  const rows = buildVelocityTable(nominal);
  assert.equal(rows.length, nominal.flowsM3h.length * nominal.ductDiameterCandidatesMm.length);
  assert.ok(rows.some((row) => row.diameterMm === 250 && row.flowM3h === 360));
});

test("recommande DN200 pour le banc nominal a 300 m3/h", () => {
  const result = recommendBenchDuct(nominal);
  assert.equal(result.ok, true);
  assert.equal(result.primary.diameterMm, 200);
  assert.equal(result.primary.inComfortRange, true);
});

test("identifie DN250 comme alternative acceptable", () => {
  const result = recommendBenchDuct(nominal);
  assert.equal(result.secondary.diameterMm, 250);
  assert.equal(result.secondary.inComfortRange, true);
});

test("precontrole la surface du registre face au filtre papier moteur", () => {
  const result = evaluateActuatorPrecheck(nominal, 200);
  assert.equal(result.passesDocumentedAreaFilter, true);
  assert.ok(result.damperAreaM2 < 0.04);
});

test("refuse les entrees physiques impossibles", () => {
  assert.throws(() => circularAreaM2(0), /diametre invalide/);
  assert.throws(() => velocityMs(0, 200), /debit invalide/);
});
