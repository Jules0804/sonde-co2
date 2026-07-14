import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const mainPath = path.join(firmwareDir, 'main', 'app_main.cpp');
const cmakePath = path.join(firmwareDir, 'main', 'CMakeLists.txt');

const main = fs.readFileSync(mainPath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');

for (const component of ['config_store', 'control_core', 'history_log', 'service_mode']) {
  assert.ok(cmake.includes(component), `Composant non relie au main : ${component}`);
}

for (const include of [
  '#include "config_store.hpp"',
  '#include "control_core.hpp"',
  '#include "history_log.hpp"',
  '#include "service_mode.hpp"',
]) {
  assert.ok(main.includes(include), `Include absent du main : ${include}`);
}

for (const token of [
  'factory_config()',
  'control_config_from_persistent',
  'service_mode.update',
  'ServiceWifiEvent::kNone',
  'Controller controller',
  'ControlInput safe_input',
  'encode_history_record',
  'HistorySample',
  'kHistoryNullCo2Ppm',
  'history_state_from_control',
  'history_fault_from_control',
  'encode_event_record',
  'EventCode::kBoot',
  'EventSource::kSystem',
]) {
  assert.ok(main.includes(token), `Contrat orchestration absent du main : ${token}`);
}

assert.ok(
  main.includes('co2_valid = false') && main.includes('sortie de securite a 100 %'),
  'Le main doit rester en mode sur tant que les pilotes materiels ne sont pas raccordes.',
);

console.log('Contrat app_main OK : config, regulation, service et journal sont raccordes en mode sur.');
