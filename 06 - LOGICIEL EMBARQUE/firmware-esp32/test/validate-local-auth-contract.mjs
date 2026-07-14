import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');
const headerPath = path.join(firmwareDir, 'components', 'local_auth', 'include', 'local_auth.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'local_auth', 'local_auth.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'local_auth', 'CMakeLists.txt');
const resolveProjectFile = (...segments) => {
  const activePath = path.join(projectDir, ...segments);
  if (fs.existsSync(activePath)) return activePath;
  const archivedPath = path.join(projectDir, '99 - ARCHIVES', 'ANCIENS LIVRABLES ACTIFS', ...segments);
  if (fs.existsSync(archivedPath)) return archivedPath;
  return activePath;
};
const authSpecPath = resolveProjectFile('07 - INTERFACE WEB LOCALE', 'SPECIFICATION AUTHENTIFICATION LOCALE V0.1.md');
const serverPath = path.join(projectDir, '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const authSpec = fs.readFileSync(authSpecPath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');

for (const token of [
  'kSessionTokenBytes = 32U',
  'kCsrfTokenBytes = 24U',
  'kMaxSessions = 2U',
  'kLoginLockDurationSeconds = 30U',
  'kPasswordMinLength = 12U',
  'kPasswordMaxLength = 128U',
  'AuthStatus',
  'kAuthRequired',
  'kForbidden',
  'kCsrfRequired',
  'kInvalidCredentials',
  'kLoginLocked',
  'LocalAuth',
  'open_session',
  'authorize',
  'invalidate_all',
]) {
  assert.ok(header.includes(token), `Contrat local_auth absent du header : ${token}`);
}

for (const token of [
  'diff |= static_cast<uint8_t>(left[index] ^ right[index])',
  'static_cast<uint8_t>(actual) >= static_cast<uint8_t>(minimum)',
  'expires_at_ms <= now_ms',
  'kApiMaxFailedLoginBeforeLock',
  'kLoginLockDurationSeconds',
  'kApiSessionDurationSeconds',
  'role == ApiRole::kPublic',
  'AuthStatus::kInvalidCredentials',
  'AuthStatus::kCsrfRequired',
  'AuthStatus::kForbidden',
  '++session_generation_',
]) {
  assert.ok(source.includes(token), `Contrat local_auth absent du source : ${token}`);
}

for (const specToken of [
  'jeton opaque aléatoire d\'au moins 256 bits',
  'expiration initiale : 15 minutes',
  'cinq échecs consécutifs',
  'blocage initial de 30 secondes',
  'jeton anti-CSRF',
]) {
  assert.ok(authSpec.includes(specToken), `Spec auth non alignee ou encodage illisible : ${specToken}`);
}

for (const pwaToken of ['randomBytes(32)', 'randomBytes(24)', '15 * 60_000', 'lockDurationMs ?? 30_000', 'maxFailures ?? 5', 'CSRF_REQUIRED']) {
  assert.ok(server.includes(pwaToken), `Prototype PWA non aligne : ${pwaToken}`);
}

assert.ok(cmake.includes('REQUIRES http_api_contract'), 'local_auth doit dependre du contrat HTTP API.');

console.log('Contrat auth locale firmware OK : session 256 bits, CSRF, roles, expiration et limitation prepares.');
