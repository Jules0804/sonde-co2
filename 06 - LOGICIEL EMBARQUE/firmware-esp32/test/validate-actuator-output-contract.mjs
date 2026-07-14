import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'actuator_output', 'include', 'actuator_output.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'actuator_output', 'actuator_output.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'actuator_output', 'CMakeLists.txt');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');

for (const token of [
  'kActuatorSafeOutputPct = 100.0F',
  'kActuatorAllChannels = 2U',
  'ActuatorOutputState',
  'kUnconfigured',
  'kConfiguringRange',
  'kSafeOutput',
  'kFollowingController',
  'kFault',
  'kActuatorActionConfigureRange',
  'kActuatorActionWriteSafeOutput',
  'kActuatorActionWriteControllerOutput',
  'ActuatorOutputInput',
  'ActuatorOutputSnapshot',
  'I2cWrite write',
]) {
  assert.ok(header.includes(token), `Contrat actuator_output absent du header : ${token}`);
}

for (const token of [
  'std::clamp(percent, 0.0F, 100.0F)',
  'ControlState::kStartup',
  'ControlState::kForceOpen',
  'ControlState::kFault',
  'control.fault != FaultCode::kNone',
  '!input.hardware_enable',
  '!input.range_configured',
  '!input.last_write_ok',
  'dfr0971_configure_0_10v_write()',
  'dfr0971_output_write(kActuatorSafeOutputPct, kActuatorAllChannels)',
  'dfr0971_output_write(written_pct_, kActuatorAllChannels)',
  'safe_output_forced_ = true',
  'safe_output_forced_ = false',
]) {
  assert.ok(source.includes(token), `Contrat actuator_output absent du source : ${token}`);
}

assert.ok(
  cmake.includes('REQUIRES control_core lot1_drivers'),
  'actuator_output doit dependre de control_core et lot1_drivers.',
);

console.log('Contrat sortie actionneur OK : configuration 0-10 V, repli 100 % et suivi regulateur prepares.');
