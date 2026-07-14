import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const projectDir = path.resolve(firmwareDir, '..', '..');
const headerPath = path.join(firmwareDir, 'components', 'credential_store', 'include', 'credential_store.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'credential_store', 'credential_store.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'credential_store', 'CMakeLists.txt');
const resolveProjectFile = (...segments) => {
  const activePath = path.join(projectDir, ...segments);
  if (fs.existsSync(activePath)) return activePath;
  const archivedPath = path.join(projectDir, '99 - ARCHIVES', 'ANCIENS LIVRABLES ACTIFS', ...segments);
  if (fs.existsSync(archivedPath)) return archivedPath;
  return activePath;
};
const authSpecPath = resolveProjectFile('07 - INTERFACE WEB LOCALE', 'SPECIFICATION AUTHENTIFICATION LOCALE V0.1.md');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const authSpec = fs.readFileSync(authSpecPath, 'utf8');

for (const token of [
  'kCredentialSchemaVersion = 1U',
  'kCredentialRecordSize = 80U',
  'kCredentialSaltBytes = 16U',
  'kCredentialVerifierBytes = 32U',
  '0x41U, 0x55U, 0x54U, 0x48U',
  'CredentialAlgorithm',
  'kExternalMeasuredVerifier',
  'CredentialPayload',
  'CredentialDecodeReason',
  'password_length_allowed',
  'encode_credential_record',
  'decode_credential_record',
  'verify_credential_material',
]) {
  assert.ok(header.includes(token), `Contrat credential_store absent du header : ${token}`);
}

for (const token of [
  'kPasswordMinLength',
  'kPasswordMaxLength',
  'role == ApiRole::kInstaller || role == ApiRole::kAdmin',
  '0xedb88320U',
  'write_u32_le(data, 76U, crc32_credential(data, 76U))',
  'read_u32_le(data, 76U) != crc32_credential(data, 76U)',
  'constant_time_equal(payload.verifier.data(), candidate_verifier, payload.verifier.size())',
  'candidate_length != payload.verifier.size()',
]) {
  assert.ok(source.includes(token), `Contrat credential_store absent du source : ${token}`);
}

for (const specToken of [
  'stockage sous forme de vérificateur salé',
  'algorithme et coût mesurés sur le matériel final',
  'longueur minimale cible : 12 caractères',
  'comparaison en temps constant',
  'aucun mot de passe usine commun',
]) {
  assert.ok(authSpec.includes(specToken), `Spec auth non alignee : ${specToken}`);
}

assert.ok(cmake.includes('REQUIRES http_api_contract local_auth'), 'credential_store doit dependre de http_api_contract et local_auth.');

console.log('Contrat stockage identifiants OK : record AUTH, sel, verificateur, CRC32, role et comparaison constante.');
