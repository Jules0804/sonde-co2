import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const serviceHeaderPath = path.join(firmwareDir, 'components', 'service_mode', 'include', 'service_mode.hpp');
const serviceSourcePath = path.join(firmwareDir, 'components', 'service_mode', 'service_mode.cpp');
const vectorsPath = path.join(here, 'vectors', 'service_access_vectors.json');

const header = fs.readFileSync(serviceHeaderPath, 'utf8');
const source = fs.readFileSync(serviceSourcePath, 'utf8');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));

function extractCppDefault(fieldName) {
  const match = header.match(new RegExp(`${fieldName}\\{([^}]+)\\}`));
  assert.ok(match, `Valeur par defaut C++ introuvable pour ${fieldName}`);
  const expression = match[1].replaceAll('U', '').trim();
  assert.match(expression, /^[0-9+\-*/ ()]+$/, `Expression C++ inattendue pour ${fieldName}`);
  return Function(`"use strict"; return (${expression});`)();
}

assert.equal(extractCppDefault('hold_ms'), 3000);
assert.equal(extractCppDefault('duration_ms'), 15 * 60 * 1000);
assert.equal(extractCppDefault('start_timeout_ms'), 10000);
assert.equal(extractCppDefault('max_start_attempts'), 2);

const cppStates = [...source.matchAll(/case ServiceState::k[A-Za-z0-9]+:\s*return "([^"]+)"/g)].map((match) => match[1]);
const cppEvents = [...source.matchAll(/case ServiceWifiEvent::k[A-Za-z0-9]+:\s*return "([^"]+)"/g)].map((match) => match[1]);
const cppFaults = [...source.matchAll(/case ServiceFault::k[A-Za-z0-9]+:\s*return "([^"]+)"/g)].map((match) => match[1]);
const cppActions = new Map([
  ['START_WIFI', 'kServiceActionStartWifi'],
  ['STOP_WIFI', 'kServiceActionStopWifi'],
  ['INVALIDATE_SESSIONS', 'kServiceActionInvalidateSessions'],
]);

assert.deepEqual(cppStates.sort(), ['ACTIVE', 'FAULT', 'OFF', 'STARTING', 'STOPPING'].sort(), 'Etats service exposes');
assert.deepEqual(cppEvents.sort(), ['FAILED', 'NONE', 'STARTED', 'STOPPED'].sort(), 'Evenements Wi-Fi exposes');
assert.deepEqual(cppFaults.sort(), ['NONE', 'WIFI_START_FAILED', 'WIFI_UNEXPECTED_STOP'].sort(), 'Defauts service exposes');

for (const [label, symbol] of cppActions) {
  assert.ok(header.includes(symbol) && source.includes(symbol), `Action service absente du C++ : ${label}`);
}

const expectedStates = new Set();
const expectedFaults = new Set();
const expectedActions = new Set();
let invalidationCount = 0;
let startCount = 0;
let stopCount = 0;

for (const scenario of vectors.scenarios) {
  assert.ok(Array.isArray(scenario.steps) && scenario.steps.length > 0, `Scenario service vide : ${scenario.name}`);
  for (const step of scenario.steps) {
    expectedStates.add(step.expected.state);
    expectedFaults.add(step.expected.fault ?? 'NONE');
    for (const action of step.expected.actions) expectedActions.add(action);
    if (step.expected.actions.includes('INVALIDATE_SESSIONS')) invalidationCount += 1;
    if (step.expected.actions.includes('START_WIFI')) startCount += 1;
    if (step.expected.actions.includes('STOP_WIFI')) stopCount += 1;
  }
}

for (const state of expectedStates) assert.ok(cppStates.includes(state), `Etat attendu absent du C++ : ${state}`);
for (const fault of expectedFaults) assert.ok(cppFaults.includes(fault), `Defaut attendu absent du C++ : ${fault}`);
for (const action of expectedActions) assert.ok(cppActions.has(action), `Action attendue absente du C++ : ${action}`);

assert.ok(invalidationCount >= 3, 'Les vecteurs doivent couvrir plusieurs invalidations de session.');
assert.ok(startCount >= 4, 'Les vecteurs doivent couvrir les demarrages et reessais Wi-Fi.');
assert.ok(stopCount >= 2, 'Les vecteurs doivent couvrir la fermeture manuelle et expiration.');
assert.ok(source.includes('state_ == ServiceState::kActive') && source.includes('input.close_requested'), 'La fermeture volontaire doit etre traitee en ACTIVE.');
assert.ok(source.includes('input.wifi_event == ServiceWifiEvent::kStopped'), 'Arret Wi-Fi inattendu ou confirme absent.');
assert.ok(source.includes('ServiceFault::kWifiStartFailed'), 'Defaut demarrage Wi-Fi absent.');
assert.ok(source.includes('ServiceFault::kWifiUnexpectedStop'), 'Defaut arret Wi-Fi inattendu absent.');

console.log(`Contrat mode service OK : ${vectors.scenarios.length} scenarios, ${expectedStates.size} etats, ${expectedActions.size} actions, ${invalidationCount} invalidations.`);
