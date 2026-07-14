import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');
const headerPath = path.join(firmwareDir, 'components', 'api_request_guard', 'include', 'api_request_guard.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'api_request_guard', 'api_request_guard.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'api_request_guard', 'CMakeLists.txt');
const serverPath = path.join(projectDir, '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');

for (const token of [
  'ApiGuardStatus',
  'kNotFound',
  'kUnsupportedMediaType',
  'kPayloadTooLarge',
  'kAuthRequired',
  'kForbidden',
  'kCsrfRequired',
  'ApiRequestView',
  'ApiGuardResult',
  'guard_api_request',
  'error_code',
]) {
  assert.ok(header.includes(token), `Contrat api_request_guard absent du header : ${token}`);
}

for (const token of [
  'find_api_route(request.method, request.path)',
  'ApiGuardStatus::kNotFound, 404U',
  'api_method_requires_json_body(request.method)',
  'ApiGuardStatus::kUnsupportedMediaType, 415U',
  'request.body_length > kApiMaxJsonBodyBytes',
  'ApiGuardStatus::kPayloadTooLarge, 413U',
  'route->min_role != ApiRole::kPublic',
  'auth.authorize(',
  'AuthStatus::kAuthRequired',
  'ApiGuardStatus::kAuthRequired, 401U',
  'AuthStatus::kForbidden',
  'ApiGuardStatus::kForbidden, 403U',
  'AuthStatus::kCsrfRequired',
  'ApiGuardStatus::kCsrfRequired, 403U',
]) {
  assert.ok(source.includes(token), `Contrat api_request_guard absent du source : ${token}`);
}

for (const pwaToken of [
  'AUTH_REQUIRED',
  'FORBIDDEN',
  'CSRF_REQUIRED',
  'Content-Type application/json requis',
  'Payload too large',
  'NOT_FOUND',
]) {
  assert.ok(server.includes(pwaToken), `Prototype PWA non aligne : ${pwaToken}`);
}

assert.ok(cmake.includes('REQUIRES http_api_contract local_auth'), 'api_request_guard doit dependre de http_api_contract et local_auth.');

console.log('Contrat garde API firmware OK : route, media type, taille, role et CSRF controles avant handler.');
