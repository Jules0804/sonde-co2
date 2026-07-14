import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  CONFIG_RECORD_SIZE, FACTORY_CONFIG, decodeConfigRecord, encodeConfigRecord,
  isNewerGeneration, loadConfigSlots, planConfigWrite,
} from "../src/config-store.js";

const vectorArtifact = JSON.parse(await readFile(resolve("../firmware-esp32/test/vectors/config_store_vectors.json"), "utf8"));
const fromHex = (hex) => hex == null ? null : Uint8Array.from(Buffer.from(hex, "hex"));
const summarize = (loaded) => ({
  config: loaded.config, generation: loaded.generation, source: loaded.source,
  status: loaded.status, safeToAuto: loaded.safeToAuto,
});

const configA = { ...FACTORY_CONFIG };
const configB = {
  targetPpm: 950, minOutputPct: 25.5, maxOutputPct: 90, highAlarmPpm: 1450,
  alarmDelaySeconds: 90, testDurationSeconds: 300, historyPeriodSeconds: 30,
};

test("encode un enregistrement binaire stable de 32 octets et le relit", () => {
  const record = encodeConfigRecord(configB, 42);
  assert.equal(record.length, CONFIG_RECORD_SIZE);
  assert.deepEqual(decodeConfigRecord(record), { ok: true, generation: 42, config: configB });
  assert.equal(Buffer.from(record).toString("hex"), "56434f32010014002a000000b603ff008403aa055a002c011e000000a9d64f0d");
});

test("refuse CRC, longueur, magie, schéma et valeurs hors bornes", () => {
  const valid = encodeConfigRecord(configA, 1);
  const crc = valid.slice(); crc[12] ^= 1;
  assert.equal(decodeConfigRecord(crc).reason, "CRC");
  assert.equal(decodeConfigRecord(valid.subarray(0, 31)).reason, "LENGTH");
  const magic = valid.slice(); magic[0] = 0;
  assert.equal(decodeConfigRecord(magic).reason, "MAGIC");
  const schema = valid.slice(); new DataView(schema.buffer).setUint16(4, 2, true);
  assert.equal(decodeConfigRecord(schema).reason, "SCHEMA");
  assert.throws(() => encodeConfigRecord({ ...configA, minOutputPct: 90 }, 1), RangeError);
  assert.throws(() => encodeConfigRecord({ ...configA, champInconnu: 1 }, 1), RangeError);
});

test("utilise les valeurs usine uniquement pour une mémoire réellement vierge", () => {
  const virgin = loadConfigSlots({ a: null, b: null });
  assert.deepEqual(virgin.config, FACTORY_CONFIG);
  assert.equal(virgin.status, "FACTORY_DEFAULTS");
  assert.equal(virgin.safeToAuto, true);
  const corrupt = loadConfigSlots({ a: new Uint8Array(3), b: new Uint8Array(5) });
  assert.equal(corrupt.status, "CONFIG_CORRUPT");
  assert.equal(corrupt.safeToAuto, false);
});

test("sélectionne la génération valide la plus récente et tolère une copie corrompue", () => {
  const slots = { a: encodeConfigRecord(configA, 10), b: encodeConfigRecord(configB, 11) };
  assert.equal(loadConfigSlots(slots).source, "B");
  slots.b[20] ^= 1;
  const degraded = loadConfigSlots(slots);
  assert.equal(degraded.source, "A");
  assert.equal(degraded.status, "BACKUP_DEGRADED");
  assert.equal(degraded.safeToAuto, true);
});

test("conserve toujours l'ancienne copie lors d'une coupure à chaque octet de l'écriture", () => {
  const oldRecord = encodeConfigRecord(configA, 100);
  const planned = planConfigWrite({ a: oldRecord, b: null }, configB);
  assert.equal(planned.targetSlot, "b");
  for (let written = 0; written < CONFIG_RECORD_SIZE; written += 1) {
    const partial = planned.record.subarray(0, written);
    const loaded = loadConfigSlots({ a: oldRecord, b: partial });
    assert.deepEqual(loaded.config, configA, `coupure après ${written} octets`);
    assert.equal(loaded.safeToAuto, true);
  }
  assert.deepEqual(loadConfigSlots({ a: oldRecord, b: planned.record }).config, configB);
});

test("n'use pas la flash si la configuration ne change pas", () => {
  const slots = { a: encodeConfigRecord(configA, 7), b: encodeConfigRecord(configA, 6) };
  const planned = planConfigWrite(slots, { ...configA });
  assert.equal(planned.ok, true);
  assert.equal(planned.noOp, true);
  assert.equal(planned.generation, 7);
});

test("répare une copie absente au lieu de considérer l'écriture comme inutile", () => {
  const slots = { a: encodeConfigRecord(configA, 7), b: null };
  const planned = planConfigWrite(slots, { ...configA });
  assert.equal(planned.noOp, false);
  assert.equal(planned.targetSlot, "b");
  assert.equal(planned.generation, 8);
});

test("gère le retour de génération 32 bits par arithmétique série", () => {
  assert.equal(isNewerGeneration(0, 0xffffffff), true);
  const loaded = loadConfigSlots({ a: encodeConfigRecord(configA, 0xffffffff), b: encodeConfigRecord(configB, 0) });
  assert.equal(loaded.source, "B");
});

test("refuse un conflit de génération et exige une récupération explicite", () => {
  const slots = { a: encodeConfigRecord(configA, 5), b: encodeConfigRecord(configB, 5) };
  const loaded = loadConfigSlots(slots);
  assert.equal(loaded.status, "GENERATION_CONFLICT");
  assert.equal(loaded.safeToAuto, false);
  assert.equal(planConfigWrite(slots, configA).reason, "RECOVERY_CONFIRMATION_REQUIRED");
  assert.equal(planConfigWrite(slots, configA, { allowRecovery: true }).ok, true);
});

test("rejoue les vecteurs de format et de sélection destinés au C++", () => {
  assert.equal(vectorArtifact.schemaVersion, 1);
  for (const record of vectorArtifact.goldenRecords) {
    assert.equal(Buffer.from(encodeConfigRecord(record.config, record.generation)).toString("hex"), record.expectedHex, record.name);
  }
  for (const scenario of vectorArtifact.loadScenarios) {
    assert.deepEqual(summarize(loadConfigSlots({ a: fromHex(scenario.aHex), b: fromHex(scenario.bHex) })), scenario.expected, scenario.name);
  }
});

test("rejoue toutes les coupures partielles du vecteur firmware", () => {
  const oldSlot = fromHex(vectorArtifact.powerCut.oldSlotAHex);
  const complete = fromHex(vectorArtifact.powerCut.completeNewSlotBHex);
  for (const cut of vectorArtifact.powerCut.cases) {
    const loaded = loadConfigSlots({ a: oldSlot, b: complete.subarray(0, cut.writtenBytes) });
    assert.deepEqual(summarize(loaded), cut.expected, `coupure ${cut.writtenBytes}`);
  }
});
