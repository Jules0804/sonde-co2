import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { VentilationController } from "./controller.js";
import { ServiceAccess } from "./service-access.js";
import { FACTORY_CONFIG, encodeConfigRecord, loadConfigSlots, planConfigWrite } from "./config-store.js";
import { encodeEventRecord, encodeHistoryRecord, estimateLogStorage } from "./history-log.js";

const here = dirname(fileURLToPath(import.meta.url));
const destination = resolve(here, "../../firmware-esp32/test/vectors/controller_vectors.json");
const serviceDestination = resolve(here, "../../firmware-esp32/test/vectors/service_access_vectors.json");
const configDestination = resolve(here, "../../firmware-esp32/test/vectors/config_store_vectors.json");
const historyDestination = resolve(here, "../../firmware-esp32/test/vectors/history_log_vectors.json");

function sequence(name, samples, config = {}) {
  const controller = new VentilationController(config);
  return {
    name,
    config,
    steps: samples.map((input) => ({ input, expected: controller.update(input) })),
  };
}

const everySecond = (count, makeInput) => Array.from({ length: count }, (_, index) => makeInput(index));
const warmup = everySecond(21, (second) => ({ timestampSeconds: second, co2Ppm: 700, forceOpen: false }));

const scenarios = [
  sequence("startup_to_auto", warmup),
  sequence("rising_co2", [
    ...warmup,
    ...everySecond(120, (index) => ({ timestampSeconds: 21 + index, co2Ppm: 1300, forceOpen: false })),
  ]),
  sequence("missing_sensor", [
    ...warmup,
    ...everySecond(36, (index) => ({ timestampSeconds: 21 + index, co2Ppm: null, forceOpen: false })),
  ]),
  sequence("range_fault", [...warmup, { timestampSeconds: 21, co2Ppm: 6000, forceOpen: false }]),
  sequence("force_open", [...warmup, { timestampSeconds: 21, co2Ppm: 700, forceOpen: true }]),
  sequence("high_co2_alarm", [
    ...warmup,
    ...everySecond(121, (index) => ({ timestampSeconds: 21 + index, co2Ppm: 1900, forceOpen: false })),
  ], { filterTauSeconds: 1 }),
];

const artifact = {
  schemaVersion: 1,
  generatedBy: "simulateur/src/generate-firmware-vectors.js",
  description: "Référence de comportement à rejouer par le noyau C++ ESP32.",
  scenarios,
};

function serviceSequence(name, inputs, config = {}) {
  const service = new ServiceAccess(config);
  return {
    name,
    config,
    steps: inputs.map((input) => ({ input, expected: service.update(input) })),
  };
}

const serviceDefaults = (nowMs, extra = {}) => ({
  nowMs,
  buttonPressed: false,
  wifiEvent: null,
  closeRequested: false,
  ...extra,
});

const serviceArtifact = {
  schemaVersion: 1,
  generatedBy: "simulateur/src/generate-firmware-vectors.js",
  description: "Référence du bouton et du cycle Wi-Fi à rejouer par le composant C++/ESP-IDF.",
  scenarios: [
    serviceSequence("button_then_manual_close", [
      serviceDefaults(0, { buttonPressed: true }),
      serviceDefaults(2999, { buttonPressed: true }),
      serviceDefaults(3000, { buttonPressed: true }),
      serviceDefaults(3500, { wifiEvent: "STARTED" }),
      serviceDefaults(5000, { closeRequested: true }),
      serviceDefaults(5100, { wifiEvent: "STOPPED" }),
    ]),
    serviceSequence("automatic_expiry", [
      serviceDefaults(0, { buttonPressed: true }),
      serviceDefaults(3000, { buttonPressed: true }),
      serviceDefaults(4000, { wifiEvent: "STARTED" }),
      serviceDefaults(903999),
      serviceDefaults(904000),
      serviceDefaults(904100, { wifiEvent: "STOPPED" }),
    ]),
    serviceSequence("start_retry_then_fault", [
      serviceDefaults(0, { buttonPressed: true }),
      serviceDefaults(3000, { buttonPressed: true }),
      serviceDefaults(3100, { wifiEvent: "FAILED" }),
      serviceDefaults(3200, { wifiEvent: "FAILED" }),
    ]),
    serviceSequence("unexpected_stop_and_recovery", [
      serviceDefaults(0, { buttonPressed: true }),
      serviceDefaults(3000, { buttonPressed: true }),
      serviceDefaults(3100, { wifiEvent: "STARTED" }),
      serviceDefaults(5000, { wifiEvent: "STOPPED" }),
      serviceDefaults(5200, { wifiEvent: "STARTED" }),
    ]),
  ],
};

const bytesToHex = (bytes) => bytes == null ? null : Buffer.from(bytes).toString("hex");
const configVectorB = {
  targetPpm: 950, minOutputPct: 25.5, maxOutputPct: 90, highAlarmPpm: 1450,
  alarmDelaySeconds: 90, testDurationSeconds: 300, historyPeriodSeconds: 30,
};
const oldConfigRecord = encodeConfigRecord(FACTORY_CONFIG, 100);
const plannedConfigWrite = planConfigWrite({ a: oldConfigRecord, b: null }, configVectorB);
const summarizeLoad = (slots) => {
  const loaded = loadConfigSlots(slots);
  return {
    config: loaded.config,
    generation: loaded.generation,
    source: loaded.source,
    status: loaded.status,
    safeToAuto: loaded.safeToAuto,
  };
};
const configArtifact = {
  schemaVersion: 1,
  generatedBy: "simulateur/src/generate-firmware-vectors.js",
  description: "Format binaire et sélection A/B à reproduire dans le composant C++/NVS.",
  goldenRecords: [
    { name: "schema1_generation42", config: configVectorB, generation: 42, expectedHex: bytesToHex(encodeConfigRecord(configVectorB, 42)) },
  ],
  loadScenarios: [
    { name: "virgin", aHex: null, bHex: null, expected: summarizeLoad({ a: null, b: null }) },
    { name: "newer_b", aHex: bytesToHex(encodeConfigRecord(FACTORY_CONFIG, 10)), bHex: bytesToHex(encodeConfigRecord(configVectorB, 11)), expected: summarizeLoad({ a: encodeConfigRecord(FACTORY_CONFIG, 10), b: encodeConfigRecord(configVectorB, 11) }) },
    { name: "backup_missing", aHex: bytesToHex(encodeConfigRecord(FACTORY_CONFIG, 10)), bHex: null, expected: summarizeLoad({ a: encodeConfigRecord(FACTORY_CONFIG, 10), b: null }) },
  ],
  powerCut: {
    oldSlotAHex: bytesToHex(oldConfigRecord),
    completeNewSlotBHex: bytesToHex(plannedConfigWrite.record),
    cases: Array.from({ length: plannedConfigWrite.record.length + 1 }, (_, writtenBytes) => ({
      writtenBytes,
      expected: summarizeLoad({ a: oldConfigRecord, b: plannedConfigWrite.record.subarray(0, writtenBytes) }),
    })),
  },
};

const historySampleVector = {
  sequence: 42, epochSeconds: 1_750_000_000, uptimeSeconds: 1234, bootId: 7,
  co2Ppm: 987, outputPct: 34.5, state: "AUTO", fault: "NONE", flags: 3,
};
const eventVector = {
  sequence: 9, epochSeconds: 1_750_000_010, uptimeSeconds: 1244, bootId: 7,
  code: "CONFIG_CHANGED", severity: "INFO", source: "INSTALLER",
  count: 1, detail0: 41, detail1: -2,
};
const historyArtifact = {
  schemaVersion: 1,
  generatedBy: "simulateur/src/generate-firmware-vectors.js",
  description: "Formats compacts historique/événements et capacité à reproduire dans le firmware.",
  historyRecord: { input: historySampleVector, expectedHex: bytesToHex(encodeHistoryRecord(historySampleVector)) },
  eventRecord: { input: eventVector, expectedHex: bytesToHex(encodeEventRecord(eventVector)) },
  capacity: estimateLogStorage(),
};

await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
await writeFile(serviceDestination, `${JSON.stringify(serviceArtifact, null, 2)}\n`, "utf8");
await writeFile(configDestination, `${JSON.stringify(configArtifact, null, 2)}\n`, "utf8");
await writeFile(historyDestination, `${JSON.stringify(historyArtifact, null, 2)}\n`, "utf8");
console.log(`Vecteurs firmware générés : ${destination}`);
console.log(`Vecteurs mode service générés : ${serviceDestination}`);
console.log(`Vecteurs configuration générés : ${configDestination}`);
console.log(`Vecteurs historique générés : ${historyDestination}`);
