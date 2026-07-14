import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function parseNetlist(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines.shift()?.split(",") ?? [];
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function validateNetlist(rows) {
  const errors = [];
  const requiredColumns = ["ref", "pin", "net", "domain", "direction", "voltage_max_v", "status", "comment"];
  const seenPins = new Set();
  for (const [index, row] of rows.entries()) {
    for (const column of requiredColumns) if (!Object.hasOwn(row, column) || row[column] === "") errors.push(`ligne ${index + 2}: ${column} absent`);
    const key = `${row.ref}.${row.pin}`;
    if (seenPins.has(key)) errors.push(`broche dupliquee: ${key}`);
    seenPins.add(key);
    if (!Number.isFinite(Number(row.voltage_max_v))) errors.push(`tension invalide: ${key}`);
  }

  const members = (net) => rows.filter((row) => row.net === net).map((row) => `${row.ref}.${row.pin}`).sort();
  const expectMembers = (net, expected) => {
    const actual = members(net);
    if (actual.join("|") !== [...expected].sort().join("|")) errors.push(`${net}: membres ${actual.join(", ")} au lieu de ${expected.join(", ")}`);
  };
  expectMembers("I2C_SDA", ["U1.GPIO_SDA", "U2.SDA", "U3.SDA"]);
  expectMembers("I2C_SCL", ["U1.GPIO_SCL", "U2.SCL", "U3.SCL"]);
  expectMembers("LOGIC_3V3", ["U1.3V3", "U2.VCC", "U3.VCC"]);
  expectMembers("AO_0_10V", ["U2.VOUT0", "TP1.V"]);
  expectMembers("AO2_0_10V", ["U2.VOUT1", "TP2.V"]);

  for (const row of rows.filter((item) => item.ref === "U1")) {
    if (row.domain === "ANALOG_0_10" || Number(row.voltage_max_v) > 3.6) errors.push(`tension interdite sur ESP32: ${row.ref}.${row.pin}`);
  }
  if (rows.some((row) => row.domain.includes("24") || row.net.includes("24V"))) errors.push("le lot 1 sans moteur ne doit contenir aucun reseau 24 V");

  const gpioPending = rows.filter((row) => row.ref === "U1" && row.pin.startsWith("GPIO_") && row.status === "GPIO_PENDING").length;
  return { ok: errors.length === 0, errors, gpioPending, rows: rows.length };
}

async function main() {
  const path = fileURLToPath(new URL("./NETLIST LOT 1 V0.1.csv", import.meta.url));
  const result = validateNetlist(parseNetlist(await readFile(path, "utf8")));
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Netlist lot 1 coherente : ${result.rows} raccordements, ${result.gpioPending} GPIO en attente d'identification.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
