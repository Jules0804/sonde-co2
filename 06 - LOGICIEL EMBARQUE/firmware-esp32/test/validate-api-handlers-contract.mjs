import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const component = join(root, 'components', 'api_handlers');
const header = readFileSync(join(component, 'include', 'api_handlers.hpp'), 'utf8');
const source = readFileSync(join(component, 'api_handlers.cpp'), 'utf8');
const cmake = readFileSync(join(component, 'CMakeLists.txt'), 'utf8');
const api = JSON.parse(readFileSync(join(root, '..', '..', '07 - INTERFACE WEB LOCALE', 'CONTRAT API LOCALE V0.1.json'), 'utf8'));
const pwaServer = readFileSync(join(root, '..', '..', '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs'), 'utf8');

function mustContain(text, token, label = token) {
  assert.ok(text.includes(token), `Manquant : ${label}`);
}

for (const dependency of [
  'api_payloads',
  'api_response',
  'config_store',
  'firmware_app',
  'history_log',
  'local_auth',
]) {
  mustContain(cmake, dependency, `dependency ${dependency}`);
}

for (const symbol of [
  'ApiHandlerStatus',
  'kInvalidBody',
  'kRevisionRequired',
  'kRevisionConflict',
  'kInvalidConfig',
  'kInvalidTest',
  'ApiReadContext',
  'ConfigUpdateResult',
  'OutputTestCommand',
  'handle_status_get',
  'handle_config_get',
  'handle_config_put',
  'handle_session_create',
  'handle_session_read',
  'handle_session_delete',
  'handle_history_sample_get',
  'handle_history_delete',
  'handle_event_get',
  'handle_output_test_start',
  'handle_output_test_stop',
]) {
  mustContain(header, symbol, `header ${symbol}`);
  if (symbol.startsWith('handle_')) mustContain(source, symbol, `source ${symbol}`);
}

for (const payloadFn of [
  'format_status_json',
  'format_config_json',
  'format_session_json',
  'format_history_sample_json',
  'format_event_json',
  'format_api_error_json',
]) {
  mustContain(source, payloadFn, `payload function ${payloadFn}`);
}

for (const statusToken of [
  '428U',
  '409U',
  '422U',
  '429U',
  '401U',
  '200U',
  'REVISION_REQUIRED',
  'REVISION_CONFLICT',
  'INVALID_CONFIG',
  'INVALID_TEST',
]) {
  mustContain(source, statusToken, `status/error ${statusToken}`);
  if (statusToken.endsWith('U')) continue;
  mustContain(pwaServer, statusToken, `PWA token ${statusToken}`);
}

for (const strictToken of [
  'config_body_has_only_known_fields',
  'allowed_config_key',
  'targetPpm',
  'minOutputPct',
  'maxOutputPct',
  'highAlarmPpm',
  'validate_persistent_config(candidate)',
  'parse_if_match_revision',
  'expected_revision != context.config_revision',
]) {
  mustContain(source, strictToken, `strict config behavior ${strictToken}`);
}

for (const outputTestToken of [
  'outputPct',
  'durationSeconds',
  'duration_seconds < 5U',
  'duration_seconds > 600U',
  '0.0F',
  '25.0F',
  '50.0F',
  '75.0F',
  '100.0F',
]) {
  mustContain(source, outputTestToken, `output-test behavior ${outputTestToken}`);
}

const configInput = api.components.schemas.ConfigInput;
assert.deepEqual(configInput.required.sort(), ['highAlarmPpm', 'maxOutputPct', 'minOutputPct', 'targetPpm'].sort());
assert.equal(configInput.additionalProperties, false, 'ConfigInput OpenAPI doit rester strict.');
assert.equal(configInput.properties.targetPpm.minimum, 800);
assert.equal(configInput.properties.targetPpm.maximum, 1400);
assert.equal(configInput.properties.highAlarmPpm.minimum, 1200);
assert.equal(configInput.properties.highAlarmPpm.maximum, 2500);

for (const forbidden of ['std::string', 'new ', 'delete ', 'std::vector']) {
  assert.ok(!source.includes(forbidden), `Allocation dynamique ou type lourd interdit dans api_handlers : ${forbidden}`);
}

console.log('Contrat handlers API firmware OK : lectures, config stricte, sessions, historique et test actionneur prepares.');
