import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'config_store', 'include', 'config_store.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'config_store', 'config_store.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'config_store', 'CMakeLists.txt');
const vectorsPath = path.join(here, 'vectors', 'config_store_vectors.json');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));

for (const token of [
  'kConfigSchemaVersion = 1U',
  'kConfigRecordSize = 32U',
  'kConfigPayloadSize = 20U',
  '0x56U, 0x43U, 0x4fU, 0x32U',
  'PersistentConfig',
  'ConfigLoadStatus',
  'safe_to_auto',
]) {
  assert.ok(header.includes(token), `Contrat config absent du header : ${token}`);
}

for (const token of [
  '0xedb88320U',
  'crc32_config(output.bytes.data(), 28U)',
  'read_u32_le(data, 28U) != crc32_config(data, 28U)',
  'difference != 0U && difference < 0x80000000U',
  'ConfigLoadStatus::kGenerationConflict',
  'ConfigLoadStatus::kGenerationAmbiguous',
  'ConfigLoadStatus::kBackupDegraded',
  'ConfigLoadStatus::kFactoryDefaults',
]) {
  assert.ok(source.includes(token), `Contrat config absent du source : ${token}`);
}

assert.ok(cmake.includes('config_store.cpp'), 'Composant config_store non declare dans CMake.');

for (const [name, value] of [
  ['target_ppm{1000U}', 1000],
  ['min_output_pct{20.0F}', 20],
  ['max_output_pct{100.0F}', 100],
  ['high_alarm_ppm{1500U}', 1500],
  ['alarm_delay_s{60U}', 60],
  ['test_duration_s{600U}', 600],
  ['history_period_s{60U}', 60],
]) {
  assert.ok(header.includes(name), `Valeur usine absente : ${name}=${value}`);
}

const golden = vectors.goldenRecords.find((record) => record.name === 'schema1_generation42');
assert.ok(golden, 'Vecteur golden schema1_generation42 absent.');
assert.equal(golden.expectedHex, '56434f32010014002a000000b603ff008403aa055a002c011e000000a9d64f0d');

for (const scenario of ['virgin', 'newer_b', 'backup_missing']) {
  assert.ok(vectors.loadScenarios.some((item) => item.name === scenario), `Scenario config manquant : ${scenario}`);
}

assert.ok(vectors.powerCut.cases.length === 33, 'Le vecteur coupure doit couvrir 0 a 32 octets ecrits.');
assert.ok(source.includes('decode_config_record(slot_a') && source.includes('decode_config_record(slot_b'), 'Chargement A/B absent.');
assert.ok(source.includes('same_config(a.config, b.config)'), 'Conflit generation/config absent.');

console.log(`Contrat stockage configuration OK : ${vectors.goldenRecords.length} golden, ${vectors.loadScenarios.length} scenarios A/B, ${vectors.powerCut.cases.length} coupures.`);
