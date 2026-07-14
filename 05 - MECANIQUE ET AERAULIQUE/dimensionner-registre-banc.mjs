import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function circularAreaM2(diameterMm) {
  if (!(diameterMm > 0)) throw new Error("diametre invalide");
  const diameterM = diameterMm / 1000;
  return Math.PI * diameterM * diameterM / 4;
}

export function velocityMs(flowM3h, diameterMm) {
  if (!(flowM3h > 0)) throw new Error("debit invalide");
  return (flowM3h / 3600) / circularAreaM2(diameterMm);
}

export function buildVelocityTable(input) {
  const rows = [];
  for (const diameterMm of input.ductDiameterCandidatesMm) {
    for (const flowM3h of input.flowsM3h) {
      rows.push({
        diameterMm,
        flowM3h,
        areaM2: circularAreaM2(diameterMm),
        velocityMs: velocityMs(flowM3h, diameterMm),
      });
    }
  }
  return rows;
}

export function evaluateDiameter(input, diameterMm) {
  const selection = input.benchSelection;
  const v = velocityMs(selection.targetFlowM3h, diameterMm);
  const inComfortRange = v >= selection.minimumComfortVelocityMs && v <= selection.maximumComfortVelocityMs;
  const practicalForBench = diameterMm <= selection.maximumPracticalBenchDiameterMm;
  const score = Math.abs(v - selection.preferredVelocityMs)
    + (inComfortRange ? 0 : 10)
    + (practicalForBench ? 0 : 3);
  return {
    diameterMm,
    targetFlowM3h: selection.targetFlowM3h,
    areaM2: circularAreaM2(diameterMm),
    targetVelocityMs: v,
    inComfortRange,
    practicalForBench,
    score,
  };
}

export function evaluateActuatorPrecheck(input, diameterMm) {
  const areaM2 = circularAreaM2(diameterMm);
  const precheck = input.actuatorPrecheck;
  const passesDocumentedAreaFilter = areaM2 <= precheck.maximumDocumentedDamperAreaM2;
  return {
    diameterMm,
    damperAreaM2: areaM2,
    candidateTorqueNm: precheck.candidateTorqueNm,
    maximumDocumentedDamperAreaM2: precheck.maximumDocumentedDamperAreaM2,
    passesDocumentedAreaFilter,
    warning: "Controle papier uniquement : confirmer le couple sur le registre reel avant achat.",
  };
}

export function recommendBenchDuct(input) {
  const evaluations = input.ductDiameterCandidatesMm
    .map((diameterMm) => evaluateDiameter(input, diameterMm))
    .sort((a, b) => a.score - b.score);
  const primary = evaluations[0];
  const secondary = evaluations.find((item) => item.diameterMm !== primary.diameterMm && item.inComfortRange);
  return {
    ok: primary.inComfortRange,
    primary,
    secondary: secondary ?? null,
    evaluations,
    velocityTable: buildVelocityTable(input),
    actuatorPrecheck: evaluateActuatorPrecheck(input, primary.diameterMm),
  };
}

function formatNumber(value, digits = 2) {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

async function main() {
  const path = fileURLToPath(new URL("./HYPOTHESES AERAULIQUES BANC V0.1.json", import.meta.url));
  const input = JSON.parse(await readFile(path, "utf8"));
  const result = recommendBenchDuct(input);
  if (!result.ok) {
    console.error("Aucun diametre ne respecte les criteres de vitesse du banc.");
    process.exitCode = 1;
    return;
  }
  console.log(`Diametre banc recommande : DN${result.primary.diameterMm}, vitesse ${formatNumber(result.primary.targetVelocityMs)} m/s a ${result.primary.targetFlowM3h} m3/h.`);
  if (result.secondary) {
    console.log(`Alternative acceptable : DN${result.secondary.diameterMm}, vitesse ${formatNumber(result.secondary.targetVelocityMs)} m/s.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
