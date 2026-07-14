import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'firmware_app', 'include', 'firmware_app.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'firmware_app', 'firmware_app.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'firmware_app', 'CMakeLists.txt');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');

for (const include of [
  '#include "actuator_output.hpp"',
  '#include "config_store.hpp"',
  '#include "control_core.hpp"',
  '#include "history_log.hpp"',
  '#include "sensor_cycle.hpp"',
  '#include "service_mode.hpp"',
]) {
  assert.ok(header.includes(include), `Include orchestration absent : ${include}`);
}

for (const token of [
  'FirmwareAppConfig',
  'FirmwareAppInput',
  'FirmwareAppSnapshot',
  'SensorCycleSnapshot sensor',
  'ControlSnapshot control',
  'ActuatorOutputSnapshot actuator',
  'ServiceSnapshot service',
  'HistoryRecord history_record',
  'EventRecord event_record',
  'FirmwareApp',
]) {
  assert.ok(header.includes(token), `Contrat firmware_app absent du header : ${token}`);
}

for (const token of [
  'factory_config()',
  'sensor_.update(input.sensor)',
  'controller_.update(control_input)',
  'actuator_.update(ActuatorOutputInput',
  'service_.update(input.service)',
  'encode_history_record',
  'encode_event_record',
  'history_sequence_++',
  'event_sequence_++',
  'kHistoryNullCo2Ppm',
  'kHistoryFlagSensorValid',
  'EventCode::kFaultRaised',
  'EventCode::kFaultCleared',
]) {
  assert.ok(source.includes(token), `Contrat firmware_app absent du source : ${token}`);
}

assert.ok(
  cmake.includes('REQUIRES actuator_output config_store control_core history_log sensor_cycle service_mode'),
  'firmware_app doit declarer toutes ses dependances fonctionnelles.',
);

console.log('Contrat orchestrateur firmware OK : capteur, regulation, actionneur, service et journaux relies.');
