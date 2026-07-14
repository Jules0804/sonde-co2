import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { calculatePowerBudget } from "./dimensionner-alimentation-lot2.mjs";

const path = fileURLToPath(new URL("./DONNEES DIMENSIONNEMENT ALIMENTATION LOT 2 V0.1.json", import.meta.url));
const nominal = JSON.parse(await readFile(path, "utf8"));

test("dimensionne six moteurs sur le candidat 2 VA", () => {
  const result = calculatePowerBudget(nominal);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.worstMotorVa, 2);
  assert.equal(result.motorsVa, 12);
  assert.equal(result.designW, 39.6875);
  assert.ok(result.designCurrentA < 1.66);
});

test("confirme la coherence 60 W et 2.5 A", () => {
  const result = calculatePowerBudget(nominal);
  assert.equal(result.effectiveSupplyCurrentA, 2.5);
  assert.ok(result.powerReserveW > 20);
});

test("refuse une alimentation de 30 W", () => {
  const changed = { ...nominal, supply: { ...nominal.supply, ratedPowerW: 30, ratedCurrentA: 1.25 } };
  assert.equal(calculatePowerBudget(changed).ok, false);
});

test("refuse une marge inferieure a 25 pour cent", () => {
  assert.equal(calculatePowerBudget({ ...nominal, designMarginFactor: 1.1 }).ok, false);
});

test("refuse plus de six moteurs", () => {
  assert.equal(calculatePowerBudget({ ...nominal, motorQuantity: 7 }).ok, false);
});

test("refuse un candidat sans VA de dimensionnement", () => {
  const changed = { ...nominal, motorCandidates: [...nominal.motorCandidates, { reference: "inconnu", acceptedForSizing: true }] };
  assert.equal(calculatePowerBudget(changed).ok, false);
});
