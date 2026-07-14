export const HISTORY_RECORD_SIZE = 24;
export const EVENT_RECORD_SIZE = 32;

export const HISTORY_STATE = Object.freeze({
  STARTUP: 0, AUTO: 1, TEST: 2, FORCE_OPEN: 3, FAULT: 4,
  DEGRADED_FLOW: 5, UPDATE: 6, RECOVERY: 7,
});

export const HISTORY_FAULT = Object.freeze({
  NONE: 0, SENSOR_MISSING: 1, SENSOR_RANGE: 2, SENSOR_STALE: 3,
  HIGH_CO2: 4, OUTPUT_WRITE_FAILED: 5, CONFIG_CORRUPT: 6,
  WIFI_START_FAILED: 7, HISTORY_STORAGE_FAILED: 8,
});

export const HISTORY_FLAG = Object.freeze({
  TIME_SYNCED: 1, SENSOR_VALID: 2, FLOW_VALID: 4, TEST_ACTIVE: 8,
});

export const EVENT_CODE = Object.freeze({
  BOOT: 1, CONFIG_CHANGED: 2, CONFIG_RECOVERY: 3, SERVICE_OPENED: 4,
  SERVICE_CLOSED: 5, LOGIN_FAILED: 6, TEST_STARTED: 7, TEST_STOPPED: 8,
  FAULT_RAISED: 9, FAULT_CLEARED: 10, FIRMWARE_UPDATE: 11,
  HISTORY_STORAGE_FAILED: 12, SESSION_OPENED: 13, SESSION_CLOSED: 14,
  HISTORY_CLEARED: 15,
});

export const EVENT_SEVERITY = Object.freeze({ INFO: 0, WARNING: 1, ERROR: 2, CRITICAL: 3 });
export const EVENT_SOURCE = Object.freeze({ SYSTEM: 0, PHYSICAL: 1, INSTALLER: 2, ADMIN: 3, GTB: 4 });

const reverse = (object) => Object.fromEntries(Object.entries(object).map(([key, value]) => [value, key]));
const STATE_NAME = reverse(HISTORY_STATE);
const FAULT_NAME = reverse(HISTORY_FAULT);
const EVENT_NAME = reverse(EVENT_CODE);
const SEVERITY_NAME = reverse(EVENT_SEVERITY);
const SOURCE_NAME = reverse(EVENT_SOURCE);

export function crc16Ccitt(bytes) {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    crc &= 0xffff;
  }
  return crc;
}

function enumValue(map, value, field) {
  if (typeof value === "number" && Object.values(map).includes(value)) return value;
  if (typeof value === "string" && Object.hasOwn(map, value)) return map[value];
  throw new RangeError(`${field} inconnu.`);
}

function uint(value, max, field) {
  if (!Number.isInteger(value) || value < 0 || value > max) throw new RangeError(`${field} invalide.`);
  return value;
}

function int32(value, field) {
  if (!Number.isInteger(value) || value < -0x80000000 || value > 0x7fffffff) throw new RangeError(`${field} invalide.`);
  return value;
}

export function encodeHistoryRecord(sample) {
  const bytes = new Uint8Array(HISTORY_RECORD_SIZE);
  const view = new DataView(bytes.buffer);
  const co2 = sample.co2Ppm == null ? 0xffff : uint(sample.co2Ppm, 10000, "co2Ppm");
  const outputTenths = Math.round(Number(sample.outputPct) * 10);
  if (!Number.isFinite(sample.outputPct) || Math.abs(sample.outputPct * 10 - outputTenths) > 1e-9) throw new RangeError("outputPct invalide.");
  view.setUint32(0, uint(sample.sequence, 0xffffffff, "sequence"), true);
  view.setUint32(4, uint(sample.epochSeconds ?? 0, 0xffffffff, "epochSeconds"), true);
  view.setUint32(8, uint(sample.uptimeSeconds, 0xffffffff, "uptimeSeconds"), true);
  view.setUint16(12, uint(sample.bootId, 0xffff, "bootId"), true);
  view.setUint16(14, co2, true);
  view.setUint16(16, uint(outputTenths, 1000, "outputPct"), true);
  view.setUint8(18, enumValue(HISTORY_STATE, sample.state, "state"));
  view.setUint8(19, enumValue(HISTORY_FAULT, sample.fault, "fault"));
  view.setUint16(20, uint(sample.flags ?? 0, 0xffff, "flags"), true);
  view.setUint16(22, crc16Ccitt(bytes.subarray(0, 22)), true);
  return bytes;
}

export function decodeHistoryRecord(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input ?? []);
  if (bytes.length !== HISTORY_RECORD_SIZE) return { ok: false, reason: "LENGTH" };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(22, true) !== crc16Ccitt(bytes.subarray(0, 22))) return { ok: false, reason: "CRC" };
  const state = STATE_NAME[view.getUint8(18)];
  const fault = FAULT_NAME[view.getUint8(19)];
  if (!state || !fault) return { ok: false, reason: "ENUM" };
  const co2 = view.getUint16(14, true);
  return {
    ok: true,
    sample: {
      sequence: view.getUint32(0, true), epochSeconds: view.getUint32(4, true),
      uptimeSeconds: view.getUint32(8, true), bootId: view.getUint16(12, true),
      co2Ppm: co2 === 0xffff ? null : co2, outputPct: view.getUint16(16, true) / 10,
      state, fault, flags: view.getUint16(20, true),
    },
  };
}

export function encodeEventRecord(event) {
  const bytes = new Uint8Array(EVENT_RECORD_SIZE);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, uint(event.sequence, 0xffffffff, "sequence"), true);
  view.setUint32(4, uint(event.epochSeconds ?? 0, 0xffffffff, "epochSeconds"), true);
  view.setUint32(8, uint(event.uptimeSeconds, 0xffffffff, "uptimeSeconds"), true);
  view.setUint16(12, uint(event.bootId, 0xffff, "bootId"), true);
  view.setUint16(14, enumValue(EVENT_CODE, event.code, "code"), true);
  view.setUint8(16, enumValue(EVENT_SEVERITY, event.severity, "severity"));
  view.setUint8(17, enumValue(EVENT_SOURCE, event.source, "source"));
  view.setUint16(18, uint(event.count ?? 1, 0xffff, "count"), true);
  view.setInt32(20, int32(event.detail0 ?? 0, "detail0"), true);
  view.setInt32(24, int32(event.detail1 ?? 0, "detail1"), true);
  view.setUint16(28, 0, true);
  view.setUint16(30, crc16Ccitt(bytes.subarray(0, 30)), true);
  return bytes;
}

export function decodeEventRecord(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input ?? []);
  if (bytes.length !== EVENT_RECORD_SIZE) return { ok: false, reason: "LENGTH" };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(28, true) !== 0) return { ok: false, reason: "RESERVED" };
  if (view.getUint16(30, true) !== crc16Ccitt(bytes.subarray(0, 30))) return { ok: false, reason: "CRC" };
  const code = EVENT_NAME[view.getUint16(14, true)];
  const severity = SEVERITY_NAME[view.getUint8(16)];
  const source = SOURCE_NAME[view.getUint8(17)];
  if (!code || !severity || !source) return { ok: false, reason: "ENUM" };
  return {
    ok: true,
    event: {
      sequence: view.getUint32(0, true), epochSeconds: view.getUint32(4, true),
      uptimeSeconds: view.getUint32(8, true), bootId: view.getUint16(12, true),
      code, severity, source, count: view.getUint16(18, true),
      detail0: view.getInt32(20, true), detail1: view.getInt32(24, true),
    },
  };
}

class CircularLog {
  constructor(capacity) {
    this.capacity = uint(capacity, 1_000_000, "capacity");
    if (capacity < 1) throw new RangeError("capacity invalide.");
    this.records = [];
  }
  append(record) {
    if (this.records.length === this.capacity) this.records.shift();
    this.records.push(record);
  }
  latest(limit = this.capacity) { return this.records.slice(-Math.max(0, Math.min(this.capacity, limit))); }
  get size() { return this.records.length; }
}

export class HistoryLog extends CircularLog {
  constructor({ samplePeriodSeconds = 60, retentionDays = 7, capacity } = {}) {
    const computedCapacity = Math.ceil(retentionDays * 86400 / samplePeriodSeconds);
    super(capacity ?? computedCapacity);
    this.samplePeriodSeconds = samplePeriodSeconds;
    this.nextSequence = 0;
    this.lastByBoot = new Map();
  }
  add(sample) {
    const previousUptime = this.lastByBoot.get(sample.bootId);
    if (previousUptime !== undefined && sample.uptimeSeconds < previousUptime) throw new RangeError("uptime décroissant pour le même bootId.");
    const normalized = { ...sample, sequence: this.nextSequence >>> 0, epochSeconds: sample.epochSeconds ?? 0 };
    const decoded = decodeHistoryRecord(encodeHistoryRecord(normalized));
    if (!decoded.ok) throw new Error(decoded.reason);
    this.append(decoded.sample);
    this.lastByBoot.set(sample.bootId, sample.uptimeSeconds);
    this.nextSequence = (this.nextSequence + 1) >>> 0;
    return decoded.sample;
  }
}

export class EventLog extends CircularLog {
  constructor({ capacity = 512, coalesceWindowSeconds = 60 } = {}) {
    super(capacity);
    this.coalesceWindowSeconds = coalesceWindowSeconds;
    this.nextSequence = 0;
  }
  add(event) {
    const allowedKeys = new Set(["sequence", "epochSeconds", "uptimeSeconds", "bootId", "code", "severity", "source", "count", "detail0", "detail1"]);
    if (!event || typeof event !== "object" || Object.keys(event).some((key) => !allowedKeys.has(key))) {
      throw new TypeError("Les textes libres, secrets, identifiants et champs inconnus ne sont pas admis dans le journal persistant.");
    }
    const normalized = { ...event, sequence: this.nextSequence >>> 0, epochSeconds: event.epochSeconds ?? 0, count: 1 };
    const previous = this.records.at(-1);
    const canCoalesce = previous && normalized.severity !== "CRITICAL"
      && previous.bootId === normalized.bootId && previous.code === normalized.code
      && previous.severity === normalized.severity && previous.source === normalized.source
      && previous.detail0 === (normalized.detail0 ?? 0) && previous.detail1 === (normalized.detail1 ?? 0)
      && normalized.uptimeSeconds >= previous.uptimeSeconds
      && normalized.uptimeSeconds - previous.uptimeSeconds <= this.coalesceWindowSeconds;
    if (canCoalesce) {
      previous.count = Math.min(0xffff, previous.count + 1);
      previous.uptimeSeconds = normalized.uptimeSeconds;
      previous.epochSeconds = normalized.epochSeconds;
      return previous;
    }
    const decoded = decodeEventRecord(encodeEventRecord(normalized));
    if (!decoded.ok) throw new Error(decoded.reason);
    this.append(decoded.event);
    this.nextSequence = (this.nextSequence + 1) >>> 0;
    return decoded.event;
  }
}

export function estimateLogStorage({ samplePeriodSeconds = 60, retentionDays = 7, eventCapacity = 512 } = {}) {
  const sampleCount = Math.ceil(retentionDays * 86400 / samplePeriodSeconds);
  const historyBytes = sampleCount * HISTORY_RECORD_SIZE;
  const eventBytes = eventCapacity * EVENT_RECORD_SIZE;
  return { sampleCount, historyBytes, eventBytes, totalRecordBytes: historyBytes + eventBytes };
}
