import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  EVENT_RECORD_SIZE, HISTORY_FLAG, HISTORY_RECORD_SIZE, EventLog, HistoryLog,
  decodeEventRecord, decodeHistoryRecord, encodeEventRecord, encodeHistoryRecord,
  estimateLogStorage,
} from "../src/history-log.js";

const vectorArtifact = JSON.parse(await readFile(resolve("../firmware-esp32/test/vectors/history_log_vectors.json"), "utf8"));

const sample = {
  sequence: 42, epochSeconds: 1_750_000_000, uptimeSeconds: 1234, bootId: 7,
  co2Ppm: 987, outputPct: 34.5, state: "AUTO", fault: "NONE",
  flags: HISTORY_FLAG.TIME_SYNCED | HISTORY_FLAG.SENSOR_VALID,
};

const event = {
  sequence: 9, epochSeconds: 1_750_000_010, uptimeSeconds: 1244, bootId: 7,
  code: "CONFIG_CHANGED", severity: "INFO", source: "INSTALLER",
  count: 1, detail0: 41, detail1: -2,
};

test("encode et relit un échantillon compact avec CRC16", () => {
  const record = encodeHistoryRecord(sample);
  assert.equal(record.length, HISTORY_RECORD_SIZE);
  assert.deepEqual(decodeHistoryRecord(record), { ok: true, sample });
  assert.equal(Buffer.from(record).toString("hex"), "2a00000080e14e68d20400000700db035901010003001c22");
  const corrupt = record.slice(); corrupt[5] ^= 1;
  assert.equal(decodeHistoryRecord(corrupt).reason, "CRC");
});

test("encode et relit un événement sans texte libre", () => {
  const record = encodeEventRecord(event);
  assert.equal(record.length, EVENT_RECORD_SIZE);
  assert.deepEqual(decodeEventRecord(record), { ok: true, event });
  assert.equal(Buffer.from(record).toString("hex"), "090000008ae14e68dc040000070002000002010029000000feffffff0000aecd");
  const corrupt = record.slice(); corrupt[20] ^= 1;
  assert.equal(decodeEventRecord(corrupt).reason, "CRC");
});

test("le journal de mesures écrase seulement le plus ancien", () => {
  const log = new HistoryLog({ capacity: 3 });
  for (let index = 0; index < 4; index += 1) {
    log.add({ ...sample, bootId: 1, uptimeSeconds: index * 60, epochSeconds: 0, co2Ppm: 700 + index });
  }
  assert.equal(log.size, 3);
  assert.deepEqual(log.latest().map((row) => row.co2Ppm), [701, 702, 703]);
  assert.deepEqual(log.latest().map((row) => row.sequence), [1, 2, 3]);
});

test("refuse un retour d'uptime sans nouveau bootId", () => {
  const log = new HistoryLog({ capacity: 3 });
  log.add({ ...sample, bootId: 3, uptimeSeconds: 100 });
  assert.throws(() => log.add({ ...sample, bootId: 3, uptimeSeconds: 99 }), RangeError);
  assert.doesNotThrow(() => log.add({ ...sample, bootId: 4, uptimeSeconds: 1 }));
});

test("agrège les événements répétitifs mais jamais un événement critique", () => {
  const log = new EventLog({ capacity: 10, coalesceWindowSeconds: 60 });
  log.add({ ...event, sequence: undefined, uptimeSeconds: 100, code: "LOGIN_FAILED", severity: "WARNING" });
  log.add({ ...event, sequence: undefined, uptimeSeconds: 120, code: "LOGIN_FAILED", severity: "WARNING" });
  assert.equal(log.size, 1);
  assert.equal(log.latest()[0].count, 2);
  log.add({ ...event, sequence: undefined, uptimeSeconds: 130, code: "FAULT_RAISED", severity: "CRITICAL" });
  log.add({ ...event, sequence: undefined, uptimeSeconds: 140, code: "FAULT_RAISED", severity: "CRITICAL" });
  assert.equal(log.size, 3);
});

test("interdit les secrets, identifiants et textes libres persistants", () => {
  const log = new EventLog();
  assert.throws(() => log.add({ ...event, password: "non" }), /password|invalide|inconnu/i);
  assert.throws(() => log.add({ ...event, username: "jules" }), TypeError);
  assert.throws(() => log.add({ ...event, message: "texte libre" }), TypeError);
  assert.throws(() => log.add({ ...event, secret: "clé" }), TypeError);
});

test("sept jours de mesures et 512 événements tiennent largement dans 384 ko", () => {
  const estimate = estimateLogStorage();
  assert.equal(estimate.sampleCount, 10080);
  assert.equal(estimate.historyBytes, 241920);
  assert.equal(estimate.eventBytes, 16384);
  assert.ok(estimate.totalRecordBytes < 384 * 1024);
  assert.ok(384 * 1024 - estimate.totalRecordBytes > 128 * 1024);
});

test("rejoue les formats binaires destinés au firmware C++", () => {
  assert.equal(vectorArtifact.schemaVersion, 1);
  assert.equal(Buffer.from(encodeHistoryRecord(vectorArtifact.historyRecord.input)).toString("hex"), vectorArtifact.historyRecord.expectedHex);
  assert.equal(Buffer.from(encodeEventRecord(vectorArtifact.eventRecord.input)).toString("hex"), vectorArtifact.eventRecord.expectedHex);
  assert.deepEqual(estimateLogStorage(), vectorArtifact.capacity);
});
