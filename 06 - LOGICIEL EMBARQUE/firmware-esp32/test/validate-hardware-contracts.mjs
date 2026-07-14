import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');

const headerPath = path.join(firmwareDir, 'components', 'hardware_contracts', 'include', 'hardware_contracts.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'hardware_contracts', 'hardware_contracts.cpp');
const jsPath = path.join(projectDir, '06 - LOGICIEL EMBARQUE', 'simulateur', 'src', 'hardware-contracts.js');
const jsTestPath = path.join(projectDir, '06 - LOGICIEL EMBARQUE', 'simulateur', 'test', 'hardware-contracts.test.js');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const jsTest = fs.readFileSync(jsTestPath, 'utf8');

function cppConstant(name) {
  const match = header.match(new RegExp(`${name}\\s*=\\s*(0x[0-9a-fA-F]+|[0-9]+)U?`));
  assert.ok(match, `Constante C++ introuvable : ${name}`);
  return Number(match[1]);
}

assert.equal(cppConstant('kDfr0971DefaultAddress'), 0x58, 'Adresse DFR0971');
assert.equal(cppConstant('kDfr0971RangeRegister'), 0x01, 'Registre plage DFR0971');
assert.equal(cppConstant('kDfr0971Range10V'), 0x11, 'Configuration 0-10 V DFR0971');
assert.equal(cppConstant('kScd41Address'), 0x62, 'Adresse SCD41');

for (const token of ['0x02', '0x04', '4095', '10000.0F', 'code12 << 4U']) {
  assert.ok(source.includes(token) || header.includes(token), `Marqueur DAC absent du C++ : ${token}`);
}

for (const token of ['0x02', '0x04', '0xfff0', '4095']) {
  assert.ok(js.includes(token) || jsTest.includes(token), `Marqueur DAC absent du modele JS/tests : ${token}`);
}

const cppStatuses = [...header.matchAll(/k(Valid|NotReady|Missing|CrcError|Stale|Range)/g)].map((match) => match[1]);
for (const status of ['VALID', 'NOT_READY', 'MISSING', 'CRC_ERROR', 'STALE', 'RANGE']) {
  assert.ok(js.includes(status), `Statut SCD41 absent du JS : ${status}`);
}
for (const status of ['Valid', 'NotReady', 'Missing', 'CrcError', 'Stale', 'Range']) {
  assert.ok(cppStatuses.includes(status), `Statut SCD41 absent du C++ : ${status}`);
}

for (const check of [
  '!sample.communication_ok',
  '!sample.data_ready',
  'sample.age_ms >= stale_after_ms ? SensorSampleStatus::kStale : SensorSampleStatus::kNotReady',
  '!sample.crc_valid',
  '!std::isfinite(sample.co2_ppm)',
  'sample.co2_ppm < min_ppm || sample.co2_ppm > max_ppm',
  'return SensorSampleStatus::kValid',
]) {
  assert.ok(source.includes(check), `Classification SCD41 manquante : ${check}`);
}

for (const [percent, expected] of [[0, '0x0000'], [50, '0x7ff0'], [100, '0xfff0']]) {
  assert.ok(jsTest.includes(`dacWordFromPercent(${percent})`) && jsTest.includes(expected), `Vecteur DAC ${percent}% manquant.`);
}

assert.ok(jsTest.includes('communicationOk: false'), 'Test communication absente manquant.');
assert.ok(jsTest.includes('crcValid: false'), 'Test CRC SCD41 manquant.');
assert.ok(jsTest.includes('dataReady: false'), 'Test dataReady SCD41 manquant.');
assert.ok(jsTest.includes('ageMs: 30000'), 'Test peremption SCD41 manquant.');

console.log('Contrats materiels firmware OK : DFR0971 0x58/0-10V, SCD41 0x62, DAC 0/50/100 %, statuts capteur coherents.');
