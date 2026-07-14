import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { analyseAnalogLoad, calculateEquivalentLoad } from "./analyser-charge-analogique.mjs";

const configPath = fileURLToPath(new URL("./HYPOTHESES CHARGE ANALOGIQUE SIX ENTREES V0.1.json", import.meta.url));
const config = JSON.parse(await readFile(configPath, "utf8"));

function nominalRows(changer = (row) => row) {
  return config.channels.flatMap((channel) => config.testPointsV.flatMap((target) =>
    Array.from({ length: config.repeatsPerPoint }, (_, index) => changer({
      channel: String(channel), target_v: String(target), load_ohm: String(config.stressLoadOhm),
      open_v: String(target + (target ? 0.02 : 0)), loaded_v: String(target), repeat: String(index + 1),
    }))));
}

test("calcule six entrees de 60 kohm comme une charge de 10 kohm", () => {
  const result = calculateEquivalentLoad(60000, 6);
  assert.equal(result.equivalentResistanceOhm, 10000);
  assert.equal(result.currentAt10Vma, 1);
  assert.equal(result.powerAt10Vmw, 10);
});

test("accepte les deux canaux sous 10 kohm", () => {
  const result = analyseAnalogLoad(nominalRows(), config);
  assert.equal(result.accepted, true, result.errors.join("\n"));
  assert.equal(result.maximumCurrentMa, 1);
});

test("refuse une chute en charge superieure a 50 mV", () => {
  const rows = nominalRows((row) => row.channel === "0" && row.target_v === "10" ? { ...row, open_v: "10.08" } : row);
  assert.equal(analyseAnalogLoad(rows, config).accepted, false);
});

test("refuse une erreur absolue superieure a 0.10 V", () => {
  const rows = nominalRows((row) => row.channel === "1" && row.target_v === "8" ? { ...row, loaded_v: "7.88", open_v: "7.90" } : row);
  assert.equal(analyseAnalogLoad(rows, config).accepted, false);
});

test("refuse une surtension au-dessus de 10.2 V", () => {
  const rows = nominalRows((row) => row.target_v === "10" ? { ...row, loaded_v: "10.21", open_v: "10.21" } : row);
  assert.equal(analyseAnalogLoad(rows, config).accepted, false);
});

test("refuse une serie incomplete", () => {
  assert.equal(analyseAnalogLoad(nominalRows().slice(1), config).accepted, false);
});

test("refuse une sortie non monotone", () => {
  const rows = nominalRows((row) => row.target_v === "8" ? { ...row, loaded_v: "4.99", open_v: "5.01" } : row);
  assert.equal(analyseAnalogLoad(rows, config).accepted, false);
});
