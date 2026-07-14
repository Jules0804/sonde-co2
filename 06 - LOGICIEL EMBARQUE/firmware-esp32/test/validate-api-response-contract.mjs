import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');
const headerPath = path.join(firmwareDir, 'components', 'api_response', 'include', 'api_response.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'api_response', 'api_response.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'api_response', 'CMakeLists.txt');
const serverPath = path.join(projectDir, '07 - INTERFACE WEB LOCALE', 'maquette-web-locale', 'server.mjs');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');

for (const token of [
  'kJsonContentType = "application/json; charset=utf-8"',
  'kSecurityHeaderCount = 7U',
  'kApiErrorJsonMaxBytes = 160U',
  'HttpHeader',
  'ApiErrorBody',
  'security_headers',
  'api_error_body',
  'api_error_message',
  'guard_status_requires_bearer_challenge',
  'format_api_error_json',
]) {
  assert.ok(header.includes(token), `Contrat api_response absent du header : ${token}`);
}

for (const headerName of [
  'Content-Type',
  'Cache-Control',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
]) {
  assert.ok(source.includes(`"${headerName}"`), `Header firmware manquant : ${headerName}`);
  assert.ok(server.includes(`"${headerName}"`), `Header PWA manquant : ${headerName}`);
}

for (const token of [
  'no-store',
  'nosniff',
  'DENY',
  'no-referrer',
  'camera=(), microphone=(), geolocation=()',
  "frame-ancestors 'none'",
  'form-action',
]) {
  assert.ok(source.includes(token), `Valeur de securite absente du firmware : ${token}`);
  assert.ok(server.includes(token), `Valeur de securite absente de la PWA : ${token}`);
}

for (const token of [
  'ApiGuardStatus::kNotFound',
  'Endpoint inconnu.',
  'ApiGuardStatus::kUnsupportedMediaType',
  'Content-Type application/json requis.',
  'ApiGuardStatus::kPayloadTooLarge',
  'Payload too large.',
  'ApiGuardStatus::kAuthRequired',
  'Connexion requise.',
  'ApiGuardStatus::kForbidden',
  'Droits insuffisants.',
  'ApiGuardStatus::kCsrfRequired',
  'Jeton de confirmation absent ou invalide.',
  'retryAfterSeconds',
]) {
  assert.ok(source.includes(token), `Erreur JSON firmware absente : ${token}`);
}

assert.ok(cmake.includes('REQUIRES api_request_guard http_api_contract'), 'api_response doit dependre du garde API et du contrat HTTP.');

console.log('Contrat reponses API firmware OK : headers securite et erreurs JSON alignes avec la PWA.');
