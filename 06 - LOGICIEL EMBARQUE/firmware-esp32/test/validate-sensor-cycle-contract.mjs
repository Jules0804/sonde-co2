import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'sensor_cycle', 'include', 'sensor_cycle.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'sensor_cycle', 'sensor_cycle.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'sensor_cycle', 'CMakeLists.txt');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');

for (const token of [
  'SensorCycleState',
  'kStopped',
  'kStarting',
  'kWaitingDataReady',
  'kReadingMeasurement',
  'kFault',
  'kSensorActionStartPeriodic',
  'kSensorActionPollDataReady',
  'kSensorActionReadMeasurement',
  'SensorCycleConfig',
  'SensorCycleInput',
  'SensorCycleSnapshot',
  'ControlInput control_input',
  'sensor_cycle_command_for_action',
]) {
  assert.ok(header.includes(token), `Contrat sensor_cycle absent du header : ${token}`);
}

for (const token of [
  'classify_scd41_sample',
  'kSensorActionStartPeriodic',
  'kSensorActionPollDataReady',
  'kSensorActionReadMeasurement',
  'input.measurement.crc_valid',
  'last_co2_ppm_ = static_cast<float>(input.measurement.co2_raw)',
  'sample_status_ == SensorSampleStatus::kValid',
  '.co2_valid = valid',
  'scd41_command(kScd41CmdStartPeriodicMeasurement)',
  'scd41_command(kScd41CmdGetDataReadyStatus)',
  'scd41_command(kScd41CmdReadMeasurement)',
]) {
  assert.ok(source.includes(token), `Contrat sensor_cycle absent du source : ${token}`);
}

assert.ok(
  cmake.includes('REQUIRES control_core hardware_contracts lot1_drivers'),
  'sensor_cycle doit dependre de control_core, hardware_contracts et lot1_drivers.',
);

console.log('Contrat cycle capteur OK : START, data-ready, lecture SCD41 et entree regulation prepares.');
