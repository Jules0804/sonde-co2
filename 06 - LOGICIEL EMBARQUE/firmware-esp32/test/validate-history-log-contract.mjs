import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'history_log', 'include', 'history_log.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'history_log', 'history_log.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'history_log', 'CMakeLists.txt');
const vectorsPath = path.join(here, 'vectors', 'history_log_vectors.json');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));

for (const token of [
  'kHistoryRecordSize = 24U',
  'kEventRecordSize = 32U',
  'kHistoryNullCo2Ppm = 0xffffU',
  'kHistoryDefaultSamplePeriodSeconds = 60U',
  'kHistoryDefaultRetentionDays = 7U',
  'kEventDefaultCapacity = 512U',
  'HistoryState',
  'HistoryFault',
  'EventCode',
  'EventSeverity',
  'EventSource',
  'HistorySample',
  'EventEntry',
  'estimate_log_storage',
]) {
  assert.ok(header.includes(token), `Contrat historique absent du header : ${token}`);
}

for (const token of [
  'kAuto = 1U',
  'kHistoryStorageFailed = 8U',
  'kHistoryFlagTimeSynced = 1U',
  'kHistoryFlagSensorValid = 2U',
  'kConfigChanged = 2U',
  'kHistoryCleared = 15U',
  'kInstaller = 2U',
  'kGtb = 4U',
]) {
  assert.ok(header.includes(token), `Enum historique non aligne avec le simulateur : ${token}`);
}

for (const token of [
  'uint16_t crc = 0xffffU',
  '^ 0x1021U',
  'write_u32_le(data, 0U, sample.sequence)',
  'write_u32_le(data, 4U, sample.epoch_seconds)',
  'write_u32_le(data, 8U, sample.uptime_seconds)',
  'write_u16_le(data, 12U, sample.boot_id)',
  'write_u16_le(data, 14U, sample.co2_ppm)',
  'write_u16_le(data, 16U, output_tenths)',
  'data[18U] = static_cast<uint8_t>(sample.state)',
  'data[19U] = static_cast<uint8_t>(sample.fault)',
  'write_u16_le(data, 20U, sample.flags)',
  'write_u16_le(data, 22U, crc16_ccitt(data, 22U))',
  'write_u16_le(data, 28U, 0U)',
  'write_u16_le(data, 30U, crc16_ccitt(data, 30U))',
  '* 86400UL',
]) {
  assert.ok(source.includes(token), `Contrat binaire historique absent du source : ${token}`);
}

assert.ok(cmake.includes('history_log.cpp'), 'Composant history_log non declare dans CMake.');

assert.equal(vectors.historyRecord.expectedHex, '2a00000080e14e68d20400000700db035901010003001c22');
assert.equal(vectors.eventRecord.expectedHex, '090000008ae14e68dc040000070002000002010029000000feffffff0000aecd');
assert.deepEqual(vectors.capacity, {
  sampleCount: 10080,
  historyBytes: 241920,
  eventBytes: 16384,
  totalRecordBytes: 258304,
});

console.log(`Contrat historique firmware OK : ${vectors.capacity.sampleCount} mesures, ${vectors.capacity.eventBytes} octets evenements, CRC16 aligne.`);
