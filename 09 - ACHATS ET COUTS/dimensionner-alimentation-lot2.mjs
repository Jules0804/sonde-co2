import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function calculatePowerBudget(input) {
  const errors = [];
  if (!Number.isInteger(input.motorQuantity) || input.motorQuantity < 1 || input.motorQuantity > 6) errors.push("motorQuantity doit etre compris entre 1 et 6");
  if (!Array.isArray(input.motorCandidates) || input.motorCandidates.length < 2) errors.push("deux candidats moteur au minimum sont requis");
  const accepted = (input.motorCandidates ?? []).filter((candidate) => candidate.acceptedForSizing);
  for (const candidate of accepted) {
    if (!(candidate.wireSizingVaPerMotor > 0)) errors.push(`VA de dimensionnement absent pour ${candidate.reference}`);
  }
  if (!(input.logicConverterOutputW > 0)) errors.push("puissance logique invalide");
  if (!(input.logicConverterMinimumEfficiency > 0 && input.logicConverterMinimumEfficiency <= 1)) errors.push("rendement logique invalide");
  if (!(input.designMarginFactor >= 1.25)) errors.push("marge de conception inferieure a 25 %");
  if (!(input.supply?.voltageV > 0 && input.supply?.ratedPowerW > 0 && input.supply?.ratedCurrentA > 0)) errors.push("alimentation invalide");
  if (errors.length) return { ok: false, errors };

  const worstMotorVa = Math.max(...accepted.map((candidate) => candidate.wireSizingVaPerMotor));
  const motorsVa = input.motorQuantity * worstMotorVa;
  const logicInputW = input.logicConverterOutputW / input.logicConverterMinimumEfficiency;
  const baseW = motorsVa + logicInputW + input.direct24vAuxiliariesW;
  const designW = baseW * input.designMarginFactor;
  const designCurrentA = designW / input.supply.voltageV;
  const supplyCurrentFromPowerA = input.supply.ratedPowerW / input.supply.voltageV;
  const effectiveSupplyCurrentA = Math.min(input.supply.ratedCurrentA, supplyCurrentFromPowerA);
  const ok = designW <= input.supply.ratedPowerW && designCurrentA <= effectiveSupplyCurrentA;
  return {
    ok,
    errors: ok ? [] : ["alimentation insuffisante pour le cas de dimensionnement"],
    worstMotorVa,
    motorsVa,
    logicInputW,
    baseW,
    designW,
    designCurrentA,
    effectiveSupplyCurrentA,
    powerReserveW: input.supply.ratedPowerW - designW,
  };
}

async function main() {
  const path = fileURLToPath(new URL("./DONNEES DIMENSIONNEMENT ALIMENTATION LOT 2 V0.1.json", import.meta.url));
  const input = JSON.parse(await readFile(path, "utf8"));
  const result = calculatePowerBudget(input);
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Alimentation lot 2 suffisante : ${result.designW.toFixed(2)} W / ${input.supply.ratedPowerW.toFixed(0)} W, ${result.designCurrentA.toFixed(2)} A / ${result.effectiveSupplyCurrentA.toFixed(2)} A.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
