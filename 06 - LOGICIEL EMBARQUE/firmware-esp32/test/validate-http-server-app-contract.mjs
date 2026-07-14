import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const component = join(root, 'components', 'http_server_app');
const header = readFileSync(join(component, 'include', 'http_server_app.hpp'), 'utf8');
const source = readFileSync(join(component, 'http_server_app.cpp'), 'utf8');
const cmake = readFileSync(join(component, 'CMakeLists.txt'), 'utf8');
const apiContract = readFileSync(join(root, 'components', 'http_api_contract', 'include', 'http_api_contract.hpp'), 'utf8');
const pwaServer = readFileSync(join(root, '..', '..', '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs'), 'utf8');

function mustContain(text, token, label = token) {
  assert.ok(text.includes(token), `Manquant : ${label}`);
}

for (const dependency of [
  'api_handlers',
  'api_payloads',
  'api_request_guard',
  'api_response',
  'config_store',
  'firmware_app',
  'history_log',
  'http_api_contract',
  'local_auth',
]) {
  mustContain(cmake, dependency, `dependency ${dependency}`);
}

mustContain(header, '#include "api_handlers.hpp"', 'server app includes api_handlers');

for (const symbol of [
  'HttpServerAction',
  'kSendError',
  'kSendStatus',
  'kSendHistory',
  'kClearHistory',
  'kSendEvents',
  'kOpenSession',
  'kReadSession',
  'kCloseSession',
  'kSendConfig',
  'kRejectMissingRevision',
  'kUpdateConfig',
  'kStartOutputTest',
  'kStopOutputTest',
  'HttpServerRequest',
  'HttpServerPlan',
  'plan_http_server_request',
  'payload_capacity_for_handler',
]) {
  mustContain(header, symbol, `header ${symbol}`);
}

for (const handler of [
  'kStatus',
  'kHistoryGet',
  'kHistoryDelete',
  'kEvents',
  'kSessionCreate',
  'kSessionRead',
  'kSessionDelete',
  'kConfigGet',
  'kConfigPut',
  'kOutputTestStart',
  'kOutputTestStop',
  'kNotFound',
]) {
  mustContain(apiContract, handler, `API contract handler ${handler}`);
  mustContain(source, `ApiHandler::${handler}`, `server dispatch ${handler}`);
}

for (const token of [
  'guard_api_request(auth, request.api)',
  'guard.status != ApiGuardStatus::kOk',
  'security_headers()',
  'security_header_count()',
  'guard_status_requires_bearer_challenge',
  'guard_status_allows_retry_after',
  'kApiErrorJsonMaxBytes',
  'kApiStatusJsonMaxBytes',
  'kApiConfigJsonMaxBytes',
  'kApiSessionJsonMaxBytes',
  'kApiHistorySampleJsonMaxBytes',
  'kApiEventJsonMaxBytes',
  'request.if_match',
  'HttpServerAction::kRejectMissingRevision',
  '428U',
]) {
  mustContain(source, token, `server behavior ${token}`);
}

for (const route of [
  '/api/v1/status',
  '/api/v1/history',
  '/api/v1/events',
  '/api/v1/session',
  '/api/v1/config',
  '/api/v1/output-test',
]) {
  mustContain(pwaServer, route, `PWA route ${route}`);
}

for (const pwaToken of [
  'if-match',
  'REVISION_REQUIRED',
  'REVISION_CONFLICT',
  'INVALID_CONFIG',
  'INVALID_TEST',
  'TEST_STARTED',
  'TEST_STOPPED',
]) {
  mustContain(pwaServer, pwaToken, `PWA behavior ${pwaToken}`);
}

console.log('Contrat serveur HTTP firmware OK : garde, dispatch, headers, payloads et If-Match prepares.');
