import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../partitions.csv", import.meta.url));
const flashSize = 0x400000;
const reservedEnd = 0x9000;
const rows = (await readFile(path, "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const [name, type, subtype, offsetText, sizeText] = line.split(",").map((cell) => cell.trim());
    return { name, type, subtype, offset: Number(offsetText), size: Number(sizeText) };
  });

let previousEnd = reservedEnd;
for (const row of rows) {
  assert.ok(Number.isInteger(row.offset) && Number.isInteger(row.size), `${row.name}: valeurs invalides`);
  assert.ok(row.size > 0, `${row.name}: taille nulle`);
  assert.ok(row.offset >= previousEnd, `${row.name}: chevauchement`);
  assert.ok(row.offset + row.size <= flashSize, `${row.name}: dépasse 4 Mo`);
  previousEnd = row.offset + row.size;
}

assert.equal(previousEnd, flashSize, "le plan doit utiliser exactement les 4 Mo prévus");
assert.equal(rows.filter((row) => row.type === "app").length, 3, "factory + deux images OTA attendues");
console.log(`Partitions valides : ${rows.length} zones, fin 0x${previousEnd.toString(16)}, flash 4 Mo.`);
