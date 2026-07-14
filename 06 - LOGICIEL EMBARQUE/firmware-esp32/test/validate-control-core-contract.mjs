import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');

const headerPath = path.join(firmwareDir, 'components', 'control_core', 'include', 'control_core.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'control_core', 'control_core.cpp');
const jsControllerPath = path.join(projectDir, '06 - LOGICIEL EMBARQUE', 'simulateur', 'src', 'controller.js');
const vectorsPath = path.join(here, 'vectors', 'controller_vectors.json');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const jsController = fs.readFileSync(jsControllerPath, 'utf8');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));

function extractCppDefault(fieldName) {
  const match = header.match(new RegExp(`${fieldName}\\{([^}]+)\\}`));
  assert.ok(match, `Valeur par defaut C++ introuvable pour ${fieldName}`);
  return Number(match[1].replace(/[UF]/g, ''));
}

function extractJsDefault(fieldName) {
  const match = jsController.match(new RegExp(`${fieldName}:\\s*([0-9.]+)`));
  assert.ok(match, `Valeur par defaut JS introuvable pour ${fieldName}`);
  return Number(match[1]);
}

function assertNear(actual, expected, label, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: C++=${actual}, JS=${expected}`);
}

const defaults = [
  ['target_ppm', 'targetPpm', 1],
  ['min_output_pct', 'minOutputPct', 1],
  ['max_output_pct', 'maxOutputPct', 1],
  ['valid_min_ppm', 'validMinPpm', 1],
  ['valid_max_ppm', 'validMaxPpm', 1],
  ['startup_valid_ms', 'startupValidSeconds', 1000],
  ['sensor_timeout_ms', 'sensorTimeoutSeconds', 1000],
  ['high_alarm_ppm', 'highAlarmPpm', 1],
  ['high_alarm_delay_ms', 'highAlarmDelaySeconds', 1000],
  ['filter_tau_s', 'filterTauSeconds', 1],
  ['kp_pct_per_ppm', 'kpPctPerPpm', 1],
  ['ki_pct_per_ppm_s', 'kiPctPerPpmSecond', 1],
  ['ramp_up_pct_per_s', 'rampUpPctPerSecond', 1],
  ['ramp_down_pct_per_s', 'rampDownPctPerSecond', 1],
];

for (const [cppName, jsName, scale] of defaults) {
  assertNear(extractCppDefault(cppName), extractJsDefault(jsName) * scale, `${cppName}/${jsName}`);
}

const cppStates = [...source.matchAll(/case ControlState::k[A-Za-z0-9]+:\s*return "([^"]+)"/g)].map((match) => match[1]);
const cppFaults = [...source.matchAll(/case FaultCode::k[A-Za-z0-9]+:\s*return "([^"]+)"/g)].map((match) => match[1]);

assert.deepEqual(cppStates.sort(), ['AUTO', 'FAULT', 'FORCE_OPEN', 'STARTUP'].sort(), 'Etats C++ exposes');
assert.deepEqual(cppFaults.sort(), ['HIGH_CO2', 'NONE', 'SENSOR_MISSING', 'SENSOR_RANGE'].sort(), 'Defauts C++ exposes');

const expectedStates = new Set();
const expectedFaults = new Set();
let safetyOpenCount = 0;

for (const scenario of vectors.scenarios) {
  assert.ok(Array.isArray(scenario.steps) && scenario.steps.length > 0, `Scenario vide: ${scenario.name}`);
  for (const step of scenario.steps) {
    expectedStates.add(step.expected.state);
    expectedFaults.add(step.expected.fault);
    if (step.expected.state === 'FAULT') {
      assert.equal(step.expected.outputPct, 100, `${scenario.name}: un defaut doit ouvrir a 100 %`);
      safetyOpenCount += 1;
    }
  }
}

for (const state of expectedStates) {
  assert.ok(cppStates.includes(state), `Etat attendu par les vecteurs mais absent du C++: ${state}`);
}

for (const fault of expectedFaults) {
  assert.ok(cppFaults.includes(fault), `Defaut attendu par les vecteurs mais absent du C++: ${fault}`);
}

assert.ok(safetyOpenCount >= 3, 'Les vecteurs doivent couvrir plusieurs cas de securite ouverts a 100 %.');

console.log(`Contrat noyau controle OK : ${vectors.scenarios.length} scenarios, ${expectedStates.size} etats, ${expectedFaults.size} defauts, ${safetyOpenCount} pas de securite.`);
