const MAGIC = [0x56, 0x43, 0x4f, 0x32]; // "VCO2"
export const CONFIG_SCHEMA_VERSION = 1;
export const CONFIG_RECORD_SIZE = 32;
const PAYLOAD_SIZE = 20;

export const FACTORY_CONFIG = Object.freeze({
  targetPpm: 1000,
  minOutputPct: 20,
  maxOutputPct: 100,
  highAlarmPpm: 1500,
  alarmDelaySeconds: 60,
  testDurationSeconds: 600,
  historyPeriodSeconds: 60,
});

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  return value >>> 0;
});

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function validatePersistentConfig(config) {
  const errors = [];
  const expectedKeys = ["alarmDelaySeconds", "highAlarmPpm", "historyPeriodSeconds", "maxOutputPct", "minOutputPct", "targetPpm", "testDurationSeconds"];
  const actualKeys = config && typeof config === "object" ? Object.keys(config).sort() : [];
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) errors.push("schemaKeys");
  const integerInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const tenthInRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max
    && Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;
  if (!integerInRange(config?.targetPpm, 800, 1400)) errors.push("targetPpm");
  if (!tenthInRange(config?.minOutputPct, 0, 80)) errors.push("minOutputPct");
  if (!tenthInRange(config?.maxOutputPct, 50, 100)) errors.push("maxOutputPct");
  if (!integerInRange(config?.highAlarmPpm, 1200, 2500)) errors.push("highAlarmPpm");
  if (!integerInRange(config?.alarmDelaySeconds, 10, 600)) errors.push("alarmDelaySeconds");
  if (!integerInRange(config?.testDurationSeconds, 30, 600)) errors.push("testDurationSeconds");
  if (!integerInRange(config?.historyPeriodSeconds, 10, 300)) errors.push("historyPeriodSeconds");
  if (Number.isFinite(config?.minOutputPct) && Number.isFinite(config?.maxOutputPct)
    && config.minOutputPct > config.maxOutputPct) errors.push("minGreaterThanMax");
  if (Number.isFinite(config?.targetPpm) && Number.isFinite(config?.highAlarmPpm)
    && config.highAlarmPpm <= config.targetPpm) errors.push("alarmNotAboveTarget");
  return { ok: errors.length === 0, errors };
}

export function encodeConfigRecord(config, generation) {
  const validation = validatePersistentConfig(config);
  if (!validation.ok) throw new RangeError(`Configuration persistante invalide : ${validation.errors.join(", ")}`);
  if (!Number.isInteger(generation) || generation < 0 || generation > 0xffffffff) {
    throw new RangeError("Génération invalide.");
  }
  const bytes = new Uint8Array(CONFIG_RECORD_SIZE);
  bytes.set(MAGIC, 0);
  const view = new DataView(bytes.buffer);
  view.setUint16(4, CONFIG_SCHEMA_VERSION, true);
  view.setUint16(6, PAYLOAD_SIZE, true);
  view.setUint32(8, generation >>> 0, true);
  view.setUint16(12, config.targetPpm, true);
  view.setUint16(14, Math.round(config.minOutputPct * 10), true);
  view.setUint16(16, Math.round(config.maxOutputPct * 10), true);
  view.setUint16(18, config.highAlarmPpm, true);
  view.setUint16(20, config.alarmDelaySeconds, true);
  view.setUint16(22, config.testDurationSeconds, true);
  view.setUint16(24, config.historyPeriodSeconds, true);
  view.setUint16(26, 0, true);
  view.setUint32(28, crc32(bytes.subarray(0, 28)), true);
  return bytes;
}

export function decodeConfigRecord(input) {
  if (input == null) return { ok: false, reason: "EMPTY" };
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength !== CONFIG_RECORD_SIZE) return { ok: false, reason: "LENGTH" };
  if (!MAGIC.every((value, index) => bytes[index] === value)) return { ok: false, reason: "MAGIC" };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(4, true) !== CONFIG_SCHEMA_VERSION) return { ok: false, reason: "SCHEMA" };
  if (view.getUint16(6, true) !== PAYLOAD_SIZE) return { ok: false, reason: "PAYLOAD_LENGTH" };
  if (view.getUint16(26, true) !== 0) return { ok: false, reason: "FLAGS" };
  if (view.getUint32(28, true) !== crc32(bytes.subarray(0, 28))) return { ok: false, reason: "CRC" };
  const config = {
    targetPpm: view.getUint16(12, true),
    minOutputPct: view.getUint16(14, true) / 10,
    maxOutputPct: view.getUint16(16, true) / 10,
    highAlarmPpm: view.getUint16(18, true),
    alarmDelaySeconds: view.getUint16(20, true),
    testDurationSeconds: view.getUint16(22, true),
    historyPeriodSeconds: view.getUint16(24, true),
  };
  const validation = validatePersistentConfig(config);
  if (!validation.ok) return { ok: false, reason: "BOUNDS", errors: validation.errors };
  return { ok: true, generation: view.getUint32(8, true), config };
}

export function isNewerGeneration(candidate, reference) {
  const difference = (candidate - reference) >>> 0;
  return difference !== 0 && difference < 0x80000000;
}

const sameConfig = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function loadConfigSlots(slots) {
  const a = decodeConfigRecord(slots?.a);
  const b = decodeConfigRecord(slots?.b);
  if (!a.ok && !b.ok) {
    const virgin = a.reason === "EMPTY" && b.reason === "EMPTY";
    return {
      config: { ...FACTORY_CONFIG },
      generation: 0,
      source: "FACTORY",
      status: virgin ? "FACTORY_DEFAULTS" : "CONFIG_CORRUPT",
      safeToAuto: virgin,
      slots: { a, b },
    };
  }
  if (a.ok && b.ok) {
    if (a.generation === b.generation) {
      if (!sameConfig(a.config, b.config)) {
        return {
          config: { ...FACTORY_CONFIG }, generation: a.generation, source: "FACTORY",
          status: "GENERATION_CONFLICT", safeToAuto: false, slots: { a, b },
        };
      }
      return { config: a.config, generation: a.generation, source: "A", status: "REDUNDANT", safeToAuto: true, slots: { a, b } };
    }
    const aNewer = isNewerGeneration(a.generation, b.generation);
    const bNewer = isNewerGeneration(b.generation, a.generation);
    if (aNewer === bNewer) {
      return {
        config: { ...FACTORY_CONFIG }, generation: 0, source: "FACTORY",
        status: "GENERATION_AMBIGUOUS", safeToAuto: false, slots: { a, b },
      };
    }
    const selected = aNewer ? a : b;
    return { config: selected.config, generation: selected.generation, source: aNewer ? "A" : "B", status: "OK", safeToAuto: true, slots: { a, b } };
  }
  const selected = a.ok ? a : b;
  return {
    config: selected.config,
    generation: selected.generation,
    source: a.ok ? "A" : "B",
    status: "BACKUP_DEGRADED",
    safeToAuto: true,
    slots: { a, b },
  };
}

export function planConfigWrite(slots, config, { allowRecovery = false } = {}) {
  const validation = validatePersistentConfig(config);
  if (!validation.ok) return { ok: false, reason: "INVALID_CONFIG", errors: validation.errors };
  const current = loadConfigSlots(slots);
  if (!current.safeToAuto && current.status !== "FACTORY_DEFAULTS" && !allowRecovery) {
    return { ok: false, reason: "RECOVERY_CONFIRMATION_REQUIRED", status: current.status };
  }
  if (["OK", "REDUNDANT"].includes(current.status) && sameConfig(current.config, config)) {
    return { ok: true, noOp: true, generation: current.generation, targetSlot: current.source.toLowerCase() };
  }
  const generation = (current.generation + 1) >>> 0;
  let targetSlot = "a";
  if (current.source === "A") targetSlot = "b";
  else if (current.source === "B") targetSlot = "a";
  return { ok: true, noOp: false, generation, targetSlot, record: encodeConfigRecord(config, generation) };
}
