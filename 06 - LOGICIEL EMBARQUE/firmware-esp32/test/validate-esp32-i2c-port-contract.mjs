import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const firmwareDir = path.dirname(here);
const headerPath = path.join(firmwareDir, 'components', 'esp32_i2c_port', 'include', 'esp32_i2c_port.hpp');
const sourcePath = path.join(firmwareDir, 'components', 'esp32_i2c_port', 'esp32_i2c_port.cpp');
const cmakePath = path.join(firmwareDir, 'components', 'esp32_i2c_port', 'CMakeLists.txt');
const boardPath = path.join(firmwareDir, 'BOARD WEMOS S2 MINI - CIBLE V0.1.md');

const header = fs.readFileSync(headerPath, 'utf8');
const source = fs.readFileSync(sourcePath, 'utf8');
const cmake = fs.readFileSync(cmakePath, 'utf8');
const board = fs.readFileSync(boardPath, 'utf8');

for (const token of [
  'kUnassignedGpio = -1',
  'kLot1I2cClockHz = 100000U',
  'kLot1I2cTimeoutMs = 100U',
  'Esp32I2cPins',
  'I2cPortStatus',
  'kPinsNotAssigned',
  'Esp32I2cPort',
  'write(const I2cWrite& command)',
  'write_read',
]) {
  assert.ok(header.includes(token), `Contrat I2C absent du header : ${token}`);
}

for (const token of [
  'pins_.sda_gpio >= 0',
  'pins_.scl_gpio >= 0',
  'pins_.sda_gpio != pins_.scl_gpio',
  'return I2cPortStatus::kPinsNotAssigned',
  'i2c_param_config',
  'i2c_driver_install',
  'i2c_master_write_to_device',
  'i2c_master_write_read_device',
  'pdMS_TO_TICKS(kLot1I2cTimeoutMs)',
]) {
  assert.ok(source.includes(token), `Contrat I2C absent du source : ${token}`);
}

assert.ok(cmake.includes('REQUIRES driver lot1_drivers'), 'Le port I2C doit dependre du driver ESP-IDF et de lot1_drivers.');
assert.ok(board.includes("Aucun numéro GPIO n'est figé avant cette identification."), 'Le blocage GPIO Wemos doit rester documente.');
assert.ok(board.includes('esp32s2'), 'La cible prototype doit etre ESP32-S2 / esp32s2.');
assert.ok(board.includes('S2 Mini'), 'La carte prototype doit etre documentee comme Wemos S2 Mini.');

console.log('Contrat port I2C ESP32-S2 OK : GPIO non assignes refuses, init ESP-IDF et transactions I2C preparees.');
