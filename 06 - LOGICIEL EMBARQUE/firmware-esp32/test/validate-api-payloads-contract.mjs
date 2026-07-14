import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const component = join(root, 'components', 'api_payloads');
const header = readFileSync(join(component, 'include', 'api_payloads.hpp'), 'utf8');
const source = readFileSync(join(component, 'api_payloads.cpp'), 'utf8');
const cmake = readFileSync(join(component, 'CMakeLists.txt'), 'utf8');
const api = JSON.parse(readFileSync(join(root, '..', '..', '07 - INTERFACE WEB LOCALE', 'CONTRAT API LOCALE V0.1.json'), 'utf8'));

function mustContain(text, needle, label = needle) {
  assert.ok(text.includes(needle), `Manquant dans ${label}`);
}

for (const dependency of [
  'actuator_output',
  'config_store',
  'firmware_app',
  'history_log',
  'http_api_contract',
  'local_auth',
  'sensor_cycle',
]) {
  mustContain(cmake, dependency, `CMake dependency ${dependency}`);
}

for (const symbol of [
  'kApiStatusJsonMaxBytes',
  'kApiConfigJsonMaxBytes',
  'kApiSessionJsonMaxBytes',
  'kApiHistorySampleJsonMaxBytes',
  'kApiEventJsonMaxBytes',
  'ApiJsonWriteResult',
  'format_api_timestamp',
  'format_status_json',
  'format_config_json',
  'format_session_json',
  'format_history_sample_json',
  'format_event_json',
  'api_mode_from_snapshot',
  'api_fault_from_history',
  'api_sensor_state_from_status',
]) {
  mustContain(header, symbol, `header symbol ${symbol}`);
  if (symbol.startsWith('format_') || symbol.startsWith('api_')) {
    mustContain(source, symbol, `source symbol ${symbol}`);
  }
}

const statusRequired = api.components.schemas.Status.required;
const configRequired = ['targetPpm', 'minOutputPct', 'maxOutputPct', 'highAlarmPpm', 'revision'];
const historyRequired = api.components.schemas.HistorySample.required;
const eventRequired = api.components.schemas.Event.required;
const sessionFields = ['token', 'csrfToken', 'role', 'expiresAt', 'expiresInSeconds'];

for (const field of [...statusRequired, ...configRequired, ...historyRequired, ...eventRequired, ...sessionFields]) {
  mustContain(source, field, `JSON field ${field}`);
}

for (const value of [
  'STARTUP',
  'AUTO',
  'SERVICE',
  'FORCE_OPEN',
  'FAULT',
  'VALID',
  'MISSING',
  'RANGE',
  'STALE',
  'SENSOR_MISSING',
  'SENSOR_RANGE',
  'HIGH_CO2',
]) {
  mustContain(source, value, `API enum ${value}`);
}

mustContain(source, 'std::vsnprintf', 'bounded snprintf formatting');
mustContain(source, 'format_hex', 'opaque token hex encoding');
mustContain(source, '1970U', 'UTC epoch timestamp conversion');
mustContain(source, 'T%02u:%02u:%02uZ', 'ISO-8601 UTC timestamp format');

console.log('OK - contrat payloads API firmware coherent avec OpenAPI locale');
