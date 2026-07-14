import test from "node:test";
import assert from "node:assert/strict";
import { classifyScd41Sample, dacFrameFromPercent, dacWordFromPercent, SensorSampleStatus } from "../src/hardware-contracts.js";

test("convertit 0 à 100 % dans la plage 12 bits décalée", () => {
  assert.equal(dacWordFromPercent(0), 0x0000);
  assert.equal(dacWordFromPercent(100), 0xfff0);
  assert.equal(dacWordFromPercent(50), 0x7ff0);
});

test("borne les consignes DAC", () => {
  assert.equal(dacWordFromPercent(-10), 0x0000);
  assert.equal(dacWordFromPercent(120), 0xfff0);
});

test("forme les trames des deux voies", () => {
  assert.deepEqual(dacFrameFromPercent(100, 0), { register: 0x02, bytes: [0xf0, 0xff] });
  assert.deepEqual(dacFrameFromPercent(100, 1), { register: 0x04, bytes: [0xf0, 0xff] });
  assert.deepEqual(dacFrameFromPercent(100, 2), { register: 0x02, bytes: [0xf0, 0xff, 0xf0, 0xff] });
});

test("refuse un canal DAC inconnu sans écrire", () => assert.deepEqual(dacFrameFromPercent(50, 3), { register: 0x00, bytes: [] }));

const validSample = { communicationOk: true, dataReady: true, crcValid: true, co2Ppm: 800, ageMs: 1000 };

test("classe une mesure SCD41 valide", () => assert.equal(classifyScd41Sample(validSample), SensorSampleStatus.VALID));
test("classe la communication absente", () => assert.equal(classifyScd41Sample({ ...validSample, communicationOk: false }), SensorSampleStatus.MISSING));
test("classe une trame CRC invalide", () => assert.equal(classifyScd41Sample({ ...validSample, crcValid: false }), SensorSampleStatus.CRC_ERROR));
test("classe une valeur hors plage", () => assert.equal(classifyScd41Sample({ ...validSample, co2Ppm: 6000 }), SensorSampleStatus.RANGE));
test("classe une mesure périmée", () => assert.equal(classifyScd41Sample({ ...validSample, ageMs: 30000 }), SensorSampleStatus.STALE));
test("attend sans défaut avant la temporisation", () => assert.equal(classifyScd41Sample({ ...validSample, dataReady: false, ageMs: 5000 }), SensorSampleStatus.NOT_READY));
