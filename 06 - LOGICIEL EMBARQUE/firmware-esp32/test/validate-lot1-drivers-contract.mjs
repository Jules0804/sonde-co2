import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'lot1_drivers', 'include', 'lot1_drivers.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'lot1_drivers', 'lot1_drivers.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'lot1_drivers', 'CMakeLists.txt');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');

for (const token of [
  'kScd41CmdStartPeriodicMeasurement = 0x21b1U',
  'kScd41CmdStopPeriodicMeasurement = 0x3f86U',
  'kScd41CmdGetDataReadyStatus = 0xe4b8U',
  'kScd41CmdReadMeasurement = 0xec05U',
  'kScd41ReadIntervalMs = 5000U',
  'I2cWrite',
  'Scd41RawMeasurement',
  'dfr0971_configure_0_10v_write',
  'dfr0971_output_write',
]) {
  assert.ok(header.includes(token), `Contrat lot1_drivers absent du header : ${token}`);
}

for (const token of [
  'kScd41Address',
  'uint8_t crc = 0xffU',
  '^ 0x31U',
  'scd41_crc8(data, 2U) == data[2U]',
  'read_u16_be(raw_status) & 0x07ffU',
  'length != 9U',
  'temperature_raw',
  'humidity_raw',
  'kDfr0971DefaultAddress',
  'kDfr0971RangeRegister',
  'kDfr0971Range10V',
  'dac_frame_from_percent(percent, channel)',
]) {
  assert.ok(source.includes(token), `Contrat lot1_drivers absent du source : ${token}`);
}

assert.ok(cmake.includes('lot1_drivers.cpp'), 'Composant lot1_drivers non declare dans CMake.');
assert.ok(cmake.includes('REQUIRES hardware_contracts'), 'lot1_drivers doit dependre de hardware_contracts.');

console.log('Contrat pilotes lot 1 OK : commandes SCD41, CRC8, lecture mesure et trames DFR0971 prepares.');
