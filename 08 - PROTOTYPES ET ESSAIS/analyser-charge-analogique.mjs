import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function calculateEquivalentLoad(inputResistanceOhm, count) {
  if (!(inputResistanceOhm > 0) || !Number.isInteger(count) || count < 1) throw new Error("charge invalide");
  const equivalentResistanceOhm = inputResistanceOhm / count;
  return {
    equivalentResistanceOhm,
    currentAt10Vma: (10 / equivalentResistanceOhm) * 1000,
    powerAt10Vmw: (100 / equivalentResistanceOhm) * 1000,
  };
}

export function analyseAnalogLoad(rows, config) {
  const errors = [];
  const numeric = rows.map((row, index) => {
    const item = {
      channel: Number(row.channel),
      targetV: Number(row.target_v),
      loadOhm: Number(row.load_ohm),
      openV: Number(row.open_v),
      loadedV: Number(row.loaded_v),
      repeat: Number(row.repeat),
    };
    if (!Object.values(item).every(Number.isFinite)) errors.push(`ligne ${index + 2}: valeur numerique invalide`);
    return item;
  });

  const expectedPerChannel = config.testPointsV.length * config.repeatsPerPoint;
  for (const channel of config.channels) {
    const channelRows = numeric.filter((row) => row.channel === channel && row.loadOhm === config.stressLoadOhm);
    if (channelRows.length !== expectedPerChannel) errors.push(`canal ${channel}: ${channelRows.length} mesures au lieu de ${expectedPerChannel}`);
    for (const target of config.testPointsV) {
      const point = channelRows.filter((row) => row.targetV === target);
      if (point.length !== config.repeatsPerPoint) errors.push(`canal ${channel}, ${target} V: repetitions incompletes`);
    }
  }

  for (const [index, row] of numeric.entries()) {
    if (!config.channels.includes(row.channel)) errors.push(`ligne ${index + 2}: canal invalide`);
    if (row.loadOhm !== config.stressLoadOhm) errors.push(`ligne ${index + 2}: charge autre que ${config.stressLoadOhm} ohm`);
    if (Math.abs(row.loadedV - row.targetV) > config.maximumAbsoluteErrorV + 1e-9) errors.push(`ligne ${index + 2}: erreur chargee excessive`);
    if (row.targetV > 0 && Math.abs(row.openV - row.loadedV) > config.maximumLoadedDroopV + 1e-9) errors.push(`ligne ${index + 2}: chute en charge excessive`);
    if (row.openV > config.maximumOutputV || row.loadedV > config.maximumOutputV) errors.push(`ligne ${index + 2}: surtension`);
    if (row.openV < -0.05 || row.loadedV < -0.05) errors.push(`ligne ${index + 2}: tension negative`);
  }

  for (const channel of config.channels) {
    const averages = config.testPointsV.map((target) => {
      const point = numeric.filter((row) => row.channel === channel && row.targetV === target && row.loadOhm === config.stressLoadOhm);
      return point.length ? point.reduce((sum, row) => sum + row.loadedV, 0) / point.length : NaN;
    });
    for (let index = 1; index < averages.length; index += 1) {
      if (!(averages[index] > averages[index - 1])) errors.push(`canal ${channel}: sortie non monotone`);
    }
  }

  const maximumCurrentMa = numeric.length ? Math.max(...numeric.map((row) => (row.loadedV / row.loadOhm) * 1000)) : 0;
  const maximumLoadPowerMw = numeric.length ? Math.max(...numeric.map((row) => (row.loadedV ** 2 / row.loadOhm) * 1000)) : 0;
  return { accepted: errors.length === 0, errors, maximumCurrentMa, maximumLoadPowerMw };
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.filter(Boolean).map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index], value])));
}

async function main() {
  const dataPath = process.argv[2];
  if (!dataPath) throw new Error("usage: node analyser-charge-analogique.mjs mesures.csv");
  const configPath = fileURLToPath(new URL("./HYPOTHESES CHARGE ANALOGIQUE SIX ENTREES V0.1.json", import.meta.url));
  const [config, csv] = await Promise.all([
    readFile(configPath, "utf8").then(JSON.parse),
    readFile(dataPath, "utf8"),
  ]);
  const result = analyseAnalogLoad(parseCsv(csv), config);
  console.log(JSON.stringify(result, null, 2));
  if (!result.accepted) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
