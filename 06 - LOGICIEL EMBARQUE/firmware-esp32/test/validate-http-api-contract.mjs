import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');
const headerPath = path.join(firmwareDir, 'components', 'http_api_contract', 'include', 'http_api_contract.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'http_api_contract', 'http_api_contract.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'http_api_contract', 'CMakeLists.txt');
const openApiPath = path.join(projectDir, '07 - INTERFACE WEB LOCALE', 'CONTRAT API LOCALE V0.1.json');
const serverPath = path.join(projectDir, '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
const server = fs.readFileSync(serverPath, 'utf8');

for (const token of [
  'kApiBasePath = "/api/v1"',
  'kApiRouteCount = 11U',
  'kApiMaxJsonBodyBytes = 1024U',
  'kApiSessionDurationSeconds = 15U * 60U',
  'HttpMethod',
  'ApiRole',
  'ApiHandler',
  'ApiRoute',
  'find_api_route',
]) {
  assert.ok(header.includes(token), `Contrat API absent du header : ${token}`);
}

const expectedRoutes = [
  ['GET', '/api/v1/status', 'kPublic', false, 'kStatus'],
  ['GET', '/api/v1/history', 'kPublic', false, 'kHistoryGet'],
  ['DELETE', '/api/v1/history', 'kAdmin', true, 'kHistoryDelete'],
  ['GET', '/api/v1/events', 'kInstaller', false, 'kEvents'],
  ['POST', '/api/v1/session', 'kPublic', false, 'kSessionCreate'],
  ['GET', '/api/v1/session', 'kInstaller', false, 'kSessionRead'],
  ['DELETE', '/api/v1/session', 'kInstaller', true, 'kSessionDelete'],
  ['GET', '/api/v1/config', 'kInstaller', false, 'kConfigGet'],
  ['PUT', '/api/v1/config', 'kInstaller', true, 'kConfigPut'],
  ['POST', '/api/v1/output-test', 'kInstaller', true, 'kOutputTestStart'],
  ['DELETE', '/api/v1/output-test', 'kInstaller', true, 'kOutputTestStop'],
];

for (const [method, fullPath, role, csrf, handler] of expectedRoutes) {
  const cppMethod = `HttpMethod::k${method[0]}${method.slice(1).toLowerCase()}`;
  assert.ok(source.includes(cppMethod), `Methode C++ manquante : ${method} ${fullPath}`);
  assert.ok(source.includes(`"${fullPath}"`), `Route C++ manquante : ${fullPath}`);
  assert.ok(source.includes(`ApiRole::${role}`), `Role C++ manquant : ${method} ${fullPath} ${role}`);
  assert.ok(source.includes(`ApiHandler::${handler}`), `Handler C++ manquant : ${handler}`);
  if (csrf) assert.ok(source.includes(`"${fullPath}", ApiRole::${role}, true`), `CSRF C++ manquant : ${method} ${fullPath}`);
}

const openApiRoutes = [];
for (const [routePath, methods] of Object.entries(openApi.paths)) {
  for (const method of Object.keys(methods)) openApiRoutes.push(`${method.toUpperCase()} /api/v1${routePath}`);
}
for (const [method, fullPath] of expectedRoutes.map(([method, fullPath]) => [method, fullPath])) {
  assert.ok(openApiRoutes.includes(`${method} ${fullPath}`), `Route OpenAPI absente : ${method} ${fullPath}`);
  assert.ok(server.includes(`request.method === "${method}"`) && server.includes(`pathname === "${fullPath}"`), `Route serveur PWA absente : ${method} ${fullPath}`);
}

assert.ok(cmake.includes('http_api_contract.cpp'), 'Composant http_api_contract non declare dans CMake.');
assert.equal(openApi.info.version, '0.3.0', 'Le validateur est aligne sur le contrat OpenAPI 0.3.0.');

console.log(`Contrat API firmware OK : ${expectedRoutes.length} routes alignees avec OpenAPI ${openApi.info.version} et la PWA.`);
