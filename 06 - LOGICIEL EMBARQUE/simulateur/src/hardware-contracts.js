const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function dacWordFromPercent(percent) {
  const bounded = clamp(Number(percent), 0, 100);
  const millivolts = bounded * 100;
  const code12 = Math.trunc((millivolts / 10000) * 4095);
  return code12 << 4;
}

export function dacFrameFromPercent(percent, channel = 0) {
  const word = dacWordFromPercent(percent);
  const low = word & 0xff;
  const high = (word >> 8) & 0xff;
  if (channel === 0) return { register: 0x02, bytes: [low, high] };
  if (channel === 1) return { register: 0x04, bytes: [low, high] };
  if (channel === 2) return { register: 0x02, bytes: [low, high, low, high] };
  return { register: 0x00, bytes: [] };
}

export const SensorSampleStatus = Object.freeze({
  VALID: "VALID",
  NOT_READY: "NOT_READY",
  MISSING: "MISSING",
  CRC_ERROR: "CRC_ERROR",
  STALE: "STALE",
  RANGE: "RANGE",
});

export function classifyScd41Sample(sample, limits = {}) {
  const config = { minPpm: 350, maxPpm: 5000, staleAfterMs: 30000, ...limits };
  if (!sample.communicationOk) return SensorSampleStatus.MISSING;
  if (!sample.dataReady) return sample.ageMs >= config.staleAfterMs ? SensorSampleStatus.STALE : SensorSampleStatus.NOT_READY;
  if (!sample.crcValid) return SensorSampleStatus.CRC_ERROR;
  if (!Number.isFinite(sample.co2Ppm) || sample.co2Ppm < config.minPpm || sample.co2Ppm > config.maxPpm) return SensorSampleStatus.RANGE;
  if (sample.ageMs >= config.staleAfterMs) return SensorSampleStatus.STALE;
  return SensorSampleStatus.VALID;
}
