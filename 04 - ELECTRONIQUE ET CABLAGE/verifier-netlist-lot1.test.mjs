import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseNetlist, validateNetlist } from "./verifier-netlist-lot1.mjs";

const path = fileURLToPath(new URL("./NETLIST LOT 1 V0.1.csv", import.meta.url));
const nominal = parseNetlist(await readFile(path, "utf8"));

test("accepte la netlist nominale du lot 1", () => {
  const result = validateNetlist(nominal);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.gpioPending, 2);
});

test("refuse une sortie 0-10 V raccordee a l ESP32", () => {
  const changed = nominal.map((row) => row.ref === "TP1" ? { ...row, ref: "U1", pin: "GPIO_BAD" } : row);
  const result = validateNetlist(changed);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("tension interdite")));
});

test("refuse un reseau 24 V dans le banc logique", () => {
  const changed = [...nominal, { ...nominal[0], ref: "X1", pin: "1", net: "MOTOR_24V", domain: "POWER_24V" }];
  assert.equal(validateNetlist(changed).ok, false);
});

test("refuse une broche dupliquee", () => {
  assert.equal(validateNetlist([...nominal, { ...nominal[0] }]).ok, false);
});

test("refuse la disparition d un participant I2C", () => {
  const changed = nominal.filter((row) => !(row.ref === "U3" && row.pin === "SDA"));
  assert.equal(validateNetlist(changed).ok, false);
});
